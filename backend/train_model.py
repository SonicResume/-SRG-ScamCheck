from pathlib import Path
from datetime import datetime, timezone
import json
import pickle

import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


# ============================================================
# ScamShield Training Pipeline v2
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "spam_production.csv"
MODELS_DIR = BASE_DIR / "models"

CANDIDATE_MODEL_PATH = MODELS_DIR / "spam_model_candidate.pkl"
CANDIDATE_VECTORIZER_PATH = MODELS_DIR / "vectorizer_candidate.pkl"
METADATA_PATH = MODELS_DIR / "model_metadata.json"


def normalize_text(text):
    """Clean whitespace without changing the meaning of messages."""
    return " ".join(str(text).strip().split())


def load_dataset():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}\n"
            "Make sure spam_production.csv exists in the ScamShield project root."
        )

    df = pd.read_csv(DATA_PATH)

    # Support the new format.
    if "label" in df.columns and "message" in df.columns:
        df = df[["label", "message"]]

    # Also support the original UCI-style format if encountered.
    elif "v1" in df.columns and "v2" in df.columns:
        df = df.rename(
            columns={
                "v1": "label",
                "v2": "message",
            }
        )[["label", "message"]]

    else:
        raise ValueError(
            "Dataset must contain either 'label'/'message' "
            "or 'v1'/'v2' columns."
        )

    return df


def clean_dataset(df):
    original_rows = len(df)

    # Remove missing values.
    df = df.dropna(subset=["label", "message"]).copy()

    # Normalize labels.
    df["label"] = (
        df["label"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # Normalize message whitespace.
    df["message"] = df["message"].map(normalize_text)

    # Keep only known labels.
    df = df[df["label"].isin(["ham", "spam"])]

    # Remove extremely short messages.
    df = df[df["message"].str.len() >= 3]

    before_duplicates = len(df)

    # Remove exact duplicate label/message pairs.
    df = df.drop_duplicates(
        subset=["label", "message"]
    ).reset_index(drop=True)

    duplicates_removed = before_duplicates - len(df)

    print("\nDataset cleaning")
    print("-" * 60)
    print(f"Original rows:       {original_rows}")
    print(f"Rows after cleaning: {len(df)}")
    print(f"Duplicates removed:  {duplicates_removed}")

    print("\nClass distribution:")
    print(df["label"].value_counts())

    return df, duplicates_removed


def train():
    print("=" * 60)
    print("ScamShield Training Pipeline v2")
    print("=" * 60)

    # --------------------------------------------------------
    # 1. Load dataset
    # --------------------------------------------------------

    print(f"\nDataset: {DATA_PATH}")

    df = load_dataset()

    # --------------------------------------------------------
    # 2. Clean dataset
    # --------------------------------------------------------

    df, duplicates_removed = clean_dataset(df)

    X = df["message"]
    y = df["label"].map(
        {
            "ham": 0,
            "spam": 1,
        }
    )

    # --------------------------------------------------------
    # 3. Stratified train/test split
    # --------------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print("\nTraining split")
    print("-" * 60)
    print(f"Training messages: {len(X_train)}")
    print(f"Testing messages:  {len(X_test)}")

    # --------------------------------------------------------
    # 4. TF-IDF vectorization
    # --------------------------------------------------------

    print("\nBuilding TF-IDF vectorizer...")

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
        max_features=50000,
    )

    X_train_vectorized = vectorizer.fit_transform(X_train)
    X_test_vectorized = vectorizer.transform(X_test)

    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

    # --------------------------------------------------------
    # 5. Train Logistic Regression
    # --------------------------------------------------------

    print("\nTraining Logistic Regression model...")

    model = LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        random_state=42,
    )

    model.fit(
        X_train_vectorized,
        y_train,
    )

    # --------------------------------------------------------
    # 6. Evaluate
    # --------------------------------------------------------

    predictions = model.predict(X_test_vectorized)

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0,
    )

    matrix = confusion_matrix(
        y_test,
        predictions,
    )

    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)

    print(f"\nAccuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")

    print("\nConfusion Matrix")
    print("-" * 60)
    print(matrix)

    print("\nClassification Report")
    print("-" * 60)
    print(
        classification_report(
            y_test,
            predictions,
            target_names=["ham", "spam"],
            zero_division=0,
        )
    )

    # --------------------------------------------------------
    # 7. Save candidate model
    # --------------------------------------------------------

    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        CANDIDATE_MODEL_PATH,
        "wb",
    ) as f:
        pickle.dump(model, f)

    with open(
        CANDIDATE_VECTORIZER_PATH,
        "wb",
    ) as f:
        pickle.dump(vectorizer, f)

    # --------------------------------------------------------
    # 8. Save metadata
    # --------------------------------------------------------

    metadata = {
        "model_version": "2.0-candidate",
        "trained_at": datetime.now(
            timezone.utc
        ).isoformat(),
        "dataset": "UCI SMS Spam Collection",
        "dataset_file": str(DATA_PATH),
        "original_rows": int(len(pd.read_csv(DATA_PATH))),
        "clean_rows": int(len(df)),
        "duplicates_removed": int(duplicates_removed),
        "training_rows": int(len(X_train)),
        "testing_rows": int(len(X_test)),
        "model": "LogisticRegression",
        "vectorizer": "TfidfVectorizer",
        "ngram_range": [1, 2],
        "max_features": 50000,
        "accuracy": round(float(accuracy), 6),
        "precision": round(float(precision), 6),
        "recall": round(float(recall), 6),
        "f1": round(float(f1), 6),
        "confusion_matrix": matrix.tolist(),
    }

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            metadata,
            f,
            indent=2,
        )

    # --------------------------------------------------------
    # 9. Finished
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)

    print("\nCandidate files created:")
    print(f"  {CANDIDATE_MODEL_PATH}")
    print(f"  {CANDIDATE_VECTORIZER_PATH}")
    print(f"  {METADATA_PATH}")

    print("\nIMPORTANT:")
    print("The current live model was NOT replaced.")
    print("Review the metrics before promoting the candidate model.")


if __name__ == "__main__":
    train()

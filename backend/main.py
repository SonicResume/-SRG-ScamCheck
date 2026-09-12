from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import json
import os
import pickle
import re
from datetime import datetime, timezone
from urllib.parse import urlparse


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "spam_model.pkl")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "vectorizer.pkl")

FEEDBACK_FILE = os.path.join(BASE_DIR, "feedback.json")

MAX_TEXT_LENGTH = 10000
MAX_URL_LENGTH = 2048


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="SRG ScamCheck API",
    version="1.0.0",
    description="Scam and phishing detection API",
)


# ============================================================
# CORS
# ============================================================

# For local development this defaults to the Vite frontend.
# In production set:
#
# FRONTEND_ORIGINS=https://your-frontend.vercel.app
#
# Multiple origins can be comma-separated.

frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:3003,http://127.0.0.1:3003",
)

allow_origins = [
    origin.strip()
    for origin in frontend_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ============================================================
# MODEL LOADING
# ============================================================

model = None
cv = None
model_error = None


def load_models():
    global model, cv, model_error

    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}"
            )

        if not os.path.exists(VECTORIZER_PATH):
            raise FileNotFoundError(
                f"Vectorizer not found: {VECTORIZER_PATH}"
            )

        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)

        with open(VECTORIZER_PATH, "rb") as f:
            cv = pickle.load(f)

        model_error = None

    except Exception as exc:
        model = None
        cv = None
        model_error = str(exc)


load_models()


# ============================================================
# REQUEST MODELS
# ============================================================

class TextData(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=MAX_TEXT_LENGTH,
    )


class URLData(BaseModel):
    url: str = Field(
        ...,
        min_length=1,
        max_length=MAX_URL_LENGTH,
    )


class FeedbackData(BaseModel):
    input_data: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    original_label: str = Field(..., min_length=1, max_length=50)
    user_label: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., min_length=1, max_length=20)


# ============================================================
# HEALTH / STATUS
# ============================================================

@app.get("/")
def read_root():
    return {
        "message": "SRG ScamCheck API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    healthy = model is not None and cv is not None

    return {
        "status": "healthy" if healthy else "degraded",
        "model_loaded": healthy,
    }


@app.get("/ready")
def readiness_check():
    if model is None or cv is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not available",
        )

    return {
        "status": "ready",
        "model_loaded": True,
    }


# ============================================================
# TEXT HELPERS
# ============================================================

def detect_text_indicators(text: str):
    text_lower = text.lower()

    insights = []
    rule_score = 0

    urgency_terms = [
        "urgent",
        "immediately",
        "act now",
        "final notice",
        "last warning",
        "expires today",
        "within 24 hours",
        "suspended",
    ]

    financial_terms = [
        "bank",
        "payment",
        "credit card",
        "refund",
        "money",
        "wire transfer",
        "investment",
        "crypto",
        "bitcoin",
        "gift card",
    ]

    credential_terms = [
        "password",
        "verify your identity",
        "verify your account",
        "login",
        "sign in",
        "security code",
        "one-time code",
        "otp",
    ]

    reward_terms = [
        "you won",
        "winner",
        "prize",
        "gift",
        "reward",
        "free money",
        "congratulations",
    ]

    link_pattern = r"(https?://|www\.)"

    if any(term in text_lower for term in urgency_terms):
        insights.append("Urgency or threat language detected")
        rule_score += 20

    if any(term in text_lower for term in financial_terms):
        insights.append("Financial or payment-related language detected")
        rule_score += 15

    if any(term in text_lower for term in credential_terms):
        insights.append("Credential or identity-verification request detected")
        rule_score += 20

    if any(term in text_lower for term in reward_terms):
        insights.append("Prize or reward bait detected")
        rule_score += 20

    if re.search(link_pattern, text_lower):
        insights.append("Contains an external link")
        rule_score += 20

    return insights, min(rule_score, 100)


def classify_category(text: str, insights):
    text_lower = text.lower()

    categories = [
        (
            "phishing",
            [
                "verify your account",
                "verify your identity",
                "password",
                "login",
                "sign in",
                "security code",
                "account suspended",
            ],
        ),
        (
            "financial scam",
            [
                "investment",
                "crypto",
                "bitcoin",
                "wire transfer",
                "gift card",
                "bank",
                "refund",
            ],
        ),
        (
            "prize scam",
            [
                "you won",
                "winner",
                "prize",
                "gift",
                "reward",
                "free money",
            ],
        ),
        (
            "delivery scam",
            [
                "package",
                "delivery",
                "shipping",
                "delivery fee",
            ],
        ),
        (
            "tech support scam",
            [
                "computer infected",
                "technical support",
                "virus",
                "malware",
                "call support",
            ],
        ),
    ]

    for category, keywords in categories:
        if any(keyword in text_lower for keyword in keywords):
            return category

    if insights:
        return "suspicious message"

    return "general"


# ============================================================
# TEXT ANALYSIS
# ============================================================

@app.post("/api/analyze")
def analyze_text(data: TextData):
    cleaned_text = data.text.strip()

    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty",
        )

    if model is None or cv is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is unavailable. Retrain or reload the model.",
        )

    try:
        vectorized = cv.transform([cleaned_text])

        probabilities = model.predict_proba(vectorized)[0]

        scam_probability = float(probabilities[1]) * 100

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Model analysis failed: {str(exc)}",
        )

    insights, rule_score = detect_text_indicators(cleaned_text)

    # Combine learned model probability with transparent
    # rule-based indicators.
    final_probability = (
        scam_probability * 0.60
        + rule_score * 0.40
    )

    final_probability = round(
        max(0, min(final_probability, 100)),
        2,
    )

    if final_probability >= 75:
        label = "Scam"
    elif final_probability >= 40:
        label = "Suspicious"
    else:
        label = "Safe"

    category = classify_category(
        cleaned_text,
        insights,
    )

    if label == "Scam":
        recommended_action = (
            "Do not click links, send money, or provide passwords or "
            "verification codes. Contact the organization through an "
            "official channel."
        )
    elif label == "Suspicious":
        recommended_action = (
            "Do not act immediately. Independently verify the sender "
            "and organization before responding."
        )
    else:
        recommended_action = (
            "No major scam indicators were detected. Continue using "
            "normal security precautions."
        )

    return {
        "text": cleaned_text,
        "probability": final_probability,
        "risk_score": final_probability,
        "label": label,
        "category": category,
        "insights": (
            insights
            if insights
            else ["No major scam indicators detected"]
        ),
        "recommended_action": recommended_action,
    }


# ============================================================
# URL ANALYSIS
# ============================================================

SKETCHY_TLDS = {
    ".xyz",
    ".top",
    ".pw",
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    ".biz",
    ".info",
    ".live",
    ".click",
    ".win",
    ".icu",
}


SHORTENERS = {
    "bit.ly",
    "goo.gl",
    "t.co",
    "tinyurl.com",
    "buff.ly",
    "is.gd",
    "ow.ly",
}


# Exact legitimate domains.
# Subdomains of these are allowed.
TRUSTED_DOMAINS = {
    "amazon.com",
    "paypal.com",
    "google.com",
    "microsoft.com",
    "netflix.com",
    "apple.com",
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "binance.com",
    "coinbase.com",
    "github.com",
    "irs.gov",
    "ufl.edu",
}


BRANDS = {
    "amazon",
    "paypal",
    "google",
    "microsoft",
    "netflix",
    "apple",
    "facebook",
    "instagram",
    "linkedin",
    "binance",
    "coinbase",
}


URL_KEYWORDS = {
    "login",
    "verify",
    "secure",
    "bank",
    "update",
    "account",
    "signin",
    "password",
    "gift",
    "prize",
    "claim",
    "suspended",
    "confirm",
}


def is_ip_address(host: str):
    return bool(
        re.fullmatch(
            r"(?:[0-9]{1,3}\.){3}[0-9]{1,3}",
            host,
        )
    )


def is_trusted_domain(domain: str):
    domain = domain.lower().rstrip(".")

    return any(
        domain == trusted
        or domain.endswith("." + trusted)
        for trusted in TRUSTED_DOMAINS
    )


def analyze_url(url: str):
    normalized_url = url.strip()

    if len(normalized_url) > MAX_URL_LENGTH:
        raise HTTPException(
            status_code=400,
            detail="URL is too long",
        )

    parsed_url = urlparse(
        normalized_url
        if "://" in normalized_url
        else f"https://{normalized_url}"
    )

    domain = parsed_url.hostname or ""

    domain = domain.lower().rstrip(".")

    if not domain:
        raise HTTPException(
            status_code=400,
            detail="Invalid URL",
        )

    url_lower = normalized_url.lower()

    risk = 0
    reasons = []

    # --------------------------------------------------------
    # 1. Invalid / unusual host
    # --------------------------------------------------------

    if is_ip_address(domain):
        risk += 30
        reasons.append(
            "Raw IP address used as the website host"
        )

    # --------------------------------------------------------
    # 2. TLD
    # --------------------------------------------------------

    for tld in SKETCHY_TLDS:
        if domain.endswith(tld):
            risk += 20
            reasons.append(
                f"Higher-risk top-level domain detected ({tld})"
            )
            break

    # --------------------------------------------------------
    # 3. Trusted domain handling
    # --------------------------------------------------------

    trusted = is_trusted_domain(domain)

    # Only perform brand impersonation checks when the
    # actual hostname is not a trusted domain/subdomain.
    if not trusted:

        for brand in BRANDS:
            if brand in domain:
                risk += 25
                reasons.append(
                    f"Possible {brand} brand impersonation"
                )
                break

    # --------------------------------------------------------
    # 4. Suspicious URL structure
    # --------------------------------------------------------

    if len(normalized_url) > 100:
        risk += 10
        reasons.append(
            "Unusually long URL"
        )

    if normalized_url.count("-") > 3:
        risk += 10
        reasons.append(
            "Unusually high number of hyphens"
        )

    if "@" in normalized_url:
        risk += 25
        reasons.append(
            "URL contains an @ symbol that can obscure the destination"
        )

    if domain.count(".") > 3:
        risk += 10
        reasons.append(
            "Unusually deep subdomain structure"
        )

    # --------------------------------------------------------
    # 5. Suspicious keywords
    # --------------------------------------------------------

    found_keywords = [
        keyword
        for keyword in URL_KEYWORDS
        if keyword in url_lower
    ]

    if found_keywords:
        risk += 10
        reasons.append(
            "Suspicious security/account keywords: "
            + ", ".join(found_keywords)
        )

    # --------------------------------------------------------
    # 6. HTTPS
    # --------------------------------------------------------

    if parsed_url.scheme.lower() != "https":
        risk += 10
        reasons.append(
            "Connection does not use HTTPS"
        )

    # --------------------------------------------------------
    # 7. URL shortener
    # --------------------------------------------------------

    if domain in SHORTENERS:
        risk += 15
        reasons.append(
            "URL shortener hides the final destination"
        )

    # --------------------------------------------------------
    # 8. Final score
    # --------------------------------------------------------

    risk_score = min(risk, 100)

    if trusted and risk_score < 30:
        label = "Safe"
    elif risk_score >= 70:
        label = "Dangerous"
    elif risk_score >= 30:
        label = "Suspicious"
    else:
        label = "Low Risk"

    if not reasons:
        reasons.append(
            "No known URL threat indicators detected"
        )

    if risk_score >= 70:
        recommended_action = (
            "Do not visit this URL or enter personal information. "
            "Navigate to the organization's official website manually."
        )
    elif risk_score >= 30:
        recommended_action = (
            "Treat this URL cautiously. Verify the domain independently "
            "before continuing."
        )
    else:
        recommended_action = (
            "No major URL indicators were detected. Continue using "
            "normal security precautions."
        )

    return {
        "url": normalized_url,
        "domain": domain,
        "label": label,
        "risk_score": risk_score,
        "trusted_domain": trusted,
        "reasons": reasons,
        "recommended_action": recommended_action,
    }


# ============================================================
# URL API
# ============================================================

@app.post("/api/check-url")
def check_url(data: URLData):
    normalized_url = data.url.strip()

    if not normalized_url:
        raise HTTPException(
            status_code=400,
            detail="URL cannot be empty",
        )

    return analyze_url(normalized_url)


# ============================================================
# FEEDBACK
# ============================================================

@app.post("/api/feedback")
def save_feedback(data: FeedbackData):

    feedbacks = []

    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(
                FEEDBACK_FILE,
                "r",
                encoding="utf-8",
            ) as f:
                feedbacks = json.load(f)

            if not isinstance(feedbacks, list):
                feedbacks = []

        except (
            json.JSONDecodeError,
            OSError,
        ):
            feedbacks = []

    feedback_record = data.model_dump()

    feedback_record["timestamp"] = datetime.now(
        timezone.utc
    ).isoformat()

    feedbacks.append(feedback_record)

    # Keep local feedback storage bounded.
    feedbacks = feedbacks[-10000:]

    temp_file = FEEDBACK_FILE + ".tmp"

    with open(
        temp_file,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            feedbacks,
            f,
            indent=2,
            ensure_ascii=False,
        )

    os.replace(
        temp_file,
        FEEDBACK_FILE,
    )

    return {
        "message": "Feedback received",
        "total_feedback_records": len(feedbacks),
    }


# ============================================================
# SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
    )

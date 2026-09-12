import pandas as pd
import os

def analyze():
    csv_path = os.path.join('..', 'spam.csv')
    df = pd.read_csv(csv_path, encoding='latin-1')
    
    # Clean-up
    df = df.drop(['Unnamed: 2', 'Unnamed: 3', 'Unnamed: 4'], axis=1)
    df = df.rename(columns={'v1': 'label', 'v2': 'message'})
    
    print("--- Dataset Summary ---")
    print(f"Total entries: {len(df)}")
    print(f"Distribution:\n{df['label'].value_counts(normalize=True) * 100}")
    
    print("\n--- Sample Spam Messages ---")
    print(df[df['label'] == 'spam']['message'].head(5))
    
    print("\n--- Common words in Spam (Naive check) ---")
    from collections import Counter
    import re
    
    spam_messages = " ".join(df[df['label'] == 'spam']['message'].tolist()).lower()
    words = re.findall(r'\b\w+\b', spam_messages)
    # Filter common stop words (very basic)
    stop_words = set(['to', 'a', 'the', 'for', 'is', 'in', 'and', 'i', 'you', 'u', 'your', 'of', 'be', 'at', 'on', 'with'])
    filtered_words = [w for w in words if w not in stop_words and len(w) > 2]
    
    top_spam_words = Counter(filtered_words).most_common(10)
    for word, count in top_spam_words:
        print(f"{word}: {count}")

if __name__ == "__main__":
    analyze()

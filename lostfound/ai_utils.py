from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_similarities(target_text, candidate_texts):
    texts = [target_text] + candidate_texts

    vectorizer = TfidfVectorizer(
        stop_words="english",
        lowercase=True
    )

    tfidf = vectorizer.fit_transform(texts)
    sims = cosine_similarity(tfidf[0:1], tfidf[1:])

    return sims[0]


def calculate_score(target, candidate, text_similarity):
    score = 0.0
    reasons = []

    if target.category == candidate.category:
        score += 0.3
        reasons.append("Same category")

    if target.location.lower() == candidate.location.lower():
        score += 0.2
        reasons.append("Same location")

    score += text_similarity * 0.5
    if text_similarity > 0.4:
        reasons.append("Similar description")

    return min(score, 1.0), ", ".join(reasons)


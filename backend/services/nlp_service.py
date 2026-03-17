"""NLP similarity engine for mapping requirements to commits."""

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Lazy-loaded model singleton
_model = None


def _get_model():
    """Load the sentence transformer model (singleton)."""
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def map_requirements_to_commits(
    requirements: list[str],
    commits: list[dict],
    threshold: float = 0.45,
    top_k: int = 5,
) -> list[dict]:
    """
    Map business requirements to commits using semantic similarity.

    Args:
        requirements: List of requirement text strings
        commits: List of commit dicts with sha, message, author, date
        threshold: Minimum similarity score to consider a match (0.45)
        top_k: Maximum number of matched commits per requirement

    Returns:
        List of requirement mapping dicts with confidence and matched commits
    """
    if not requirements or not commits:
        return []

    model = _get_model()

    # Encode all texts
    req_texts = [r.strip() for r in requirements if r.strip()]
    commit_messages = [c.get("message", "") for c in commits]

    if not req_texts or not commit_messages:
        return []

    req_embeddings = model.encode(req_texts, show_progress_bar=False)
    commit_embeddings = model.encode(commit_messages, show_progress_bar=False)

    # Compute similarity matrix: shape (n_requirements, n_commits)
    similarities = cosine_similarity(req_embeddings, commit_embeddings)

    results = []
    for i, req_text in enumerate(req_texts):
        sim_scores = similarities[i]

        # Get indices where similarity >= threshold
        matching_indices = np.where(sim_scores >= threshold)[0]

        # Sort by similarity descending
        matching_indices = matching_indices[np.argsort(-sim_scores[matching_indices])]

        # Take top K
        top_indices = matching_indices[:top_k]

        matched_commits = []
        for idx in top_indices:
            commit = commits[idx]
            score = round(float(sim_scores[idx]) * 100, 1)
            matched_commits.append({
                "sha": commit.get("sha", ""),
                "message": commit.get("message", ""),
                "author": commit.get("author", ""),
                "date": commit.get("date", ""),
                "match_score": score,
            })

        # Overall confidence is the highest match score
        confidence = matched_commits[0]["match_score"] if matched_commits else 0.0

        results.append({
            "requirement": req_text,
            "confidence": confidence,
            "matched_commits": len(matched_commits),
            "commits": matched_commits,
        })

    return results

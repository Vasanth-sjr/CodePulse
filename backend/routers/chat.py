"""ChatBot router — FAQ + optional Gemini AI fallback."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import logging

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Try to load Gemini — but NEVER crash the server if it's missing
# ---------------------------------------------------------------------------
gemini_model = None
try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("Gemini model loaded successfully.")
    else:
        logger.warning("GEMINI_API_KEY not set — chatbot will use FAQ-only mode.")
except ImportError:
    logger.warning("google-generativeai package not installed — chatbot will use FAQ-only mode.")


# ---------------------------------------------------------------------------
# Predefined FAQ knowledge base
# ---------------------------------------------------------------------------
FAQS = {
    "what is codepulse": (
        "CodePulse is an AI-Driven Developer Intelligence Platform. "
        "It analyzes GitHub repositories to measure developer impact, "
        "trace requirements to code, and detect knowledge risks (bus factor)."
    ),
    "how do i connect a repository": (
        "Navigate to the Setup page using the sidebar. Enter your GitHub repository URL "
        "(e.g. owner/repo-name) and optionally paste business requirements. "
        "Then click 'Start Analysis' — CodePulse will fetch commits, map requirements, "
        "calculate impact scores, and detect knowledge risks automatically."
    ),
    "what does developer impact mean": (
        "Developer Impact visualizes how individual contributors affect the codebase. "
        "It tracks commits, additions, deletions, and the structural areas they touch most "
        "frequently — helping you understand who influences which parts of the project."
    ),
    "what is knowledge risk": (
        "Knowledge Risk (Bus Factor) highlights files and modules that are only modified by "
        "one or two developers. If those people leave, critical knowledge could be lost. "
        "The Knowledge Risk page helps you identify these danger zones."
    ),
    "what is requirement mapping": (
        "Requirement Mapping traces your business requirements or tickets to the actual code "
        "functions and files that implement them. It uses AI similarity matching to link human-readable "
        "requirements to commits and code changes."
    ),
    "how does the analysis work": (
        "When you connect a repo, CodePulse: 1) Fetches all commits from the GitHub API, "
        "2) Processes requirements with NLP to find matching code, 3) Calculates impact scores "
        "for each developer, and 4) Detects knowledge risk zones. All results are stored locally "
        "in the SQLite database."
    ),
    "what pages does codepulse have": (
        "CodePulse has the following pages:\n"
        "• Landing Page — Introduction & connect your repo\n"
        "• Setup — Enter repo URL and requirements\n"
        "• Repository Overview — High-level stats and recent activity\n"
        "• Developer Impact — Per-developer contribution analysis\n"
        "• Requirement Mapping — Link requirements to code\n"
        "• Knowledge Risk — Bus factor & brain drain detection"
    ),
}


def find_faq_answer(message: str) -> str | None:
    """Fuzzy-match the user's message against known FAQs."""
    msg_lower = message.lower().strip().rstrip("?").strip()
    for key, answer in FAQS.items():
        if key in msg_lower or msg_lower in key:
            return answer
    # keyword fallback
    keywords_map = {
        ("connect", "repo"): FAQS["how do i connect a repository"],
        ("setup",): FAQS["how do i connect a repository"],
        ("impact",): FAQS["what does developer impact mean"],
        ("risk", "bus"): FAQS["what is knowledge risk"],
        ("knowledge",): FAQS["what is knowledge risk"],
        ("requirement", "mapping"): FAQS["what is requirement mapping"],
        ("analysis", "work"): FAQS["how does the analysis work"],
        ("pages",): FAQS["what pages does codepulse have"],
        ("what", "codepulse"): FAQS["what is codepulse"],
    }
    for kw_set, answer in keywords_map.items():
        if all(k in msg_lower for k in kw_set):
            return answer
    return None


def get_contextual_prompt(path: str) -> str:
    """Generate system instructions based on the user's current route."""
    base = (
        "You are the CodePulse AI Assistant, an expert developer intelligence companion. "
        "CodePulse is a platform for analyzing developer impact, tracing requirement mappings, "
        "and detecting knowledge risks in GitHub repositories. "
        "Keep responses concise (3-5 sentences max). Be helpful and professional. "
    )
    context_map = {
        "overview": "The user is on the Repository Overview page — high-level stats, commits, authors.",
        "impact": "The user is on the Developer Impact page — per-developer contribution analysis.",
        "mapping": "The user is on the Requirement Mapping page — linking requirements to code.",
        "risk": "The user is on the Knowledge Risk page — bus factor and brain drain detection.",
        "setup": "The user is on the Setup page — connecting a GitHub repository.",
    }
    for key, ctx in context_map.items():
        if key in path:
            return base + ctx
    return base + "The user is browsing the CodePulse application."


class ChatRequest(BaseModel):
    message: str
    contextPath: str = ""


@router.post("")
async def chat(request: ChatRequest):
    """Handle chat — FAQ first, then Gemini fallback."""

    # 1. Try FAQ match
    faq_answer = find_faq_answer(request.message)
    if faq_answer:
        return {"response": faq_answer, "source": "faq"}

    # 2. Try Gemini
    if gemini_model:
        try:
            prompt = (
                f"System Context: {get_contextual_prompt(request.contextPath)}\n\n"
                f"User Message: {request.message}"
            )
            response = await gemini_model.generate_content_async(prompt)
            return {"response": response.text, "source": "gemini"}
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            return {
                "response": (
                    "I encountered an issue reaching the AI engine. "
                    "Here's what I can help with right now — try asking:\n"
                    "• What is CodePulse?\n"
                    "• How do I connect a repository?\n"
                    "• What does Developer Impact mean?\n"
                    "• What is Knowledge Risk?"
                ),
                "source": "fallback",
            }

    # 3. No Gemini available — helpful fallback
    return {
        "response": (
            "I don't have an AI engine configured yet, but I can answer common questions! Try:\n"
            "• What is CodePulse?\n"
            "• How do I connect a repository?\n"
            "• What does Developer Impact mean?\n"
            "• What is Knowledge Risk?\n"
            "• What is Requirement Mapping?\n\n"
            "To enable full AI chat, add GEMINI_API_KEY to your backend/.env file."
        ),
        "source": "fallback",
    }

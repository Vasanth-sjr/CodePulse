"""Predictive Risk routes — delivery trajectory, risk flags, tech debt.

Routes:
  GET /api/risk/trajectory — per-issue delivery probability
  GET /api/risk/flags      — auto-detected risk flags
  GET /api/techdebt        — tech debt hotspots
"""

import logging
from datetime import datetime, timedelta
from fastapi import APIRouter

from services import github_predictive as github
from services import jira_predictive as jira
from services.dev_profiles import build_profiles
from services.risk_engine import calculate_trajectory
from services.risk_flags import detect_flags
from services.tech_debt import calculate_tech_debt

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Predictive Risk"])


@router.get("/api/risk/trajectory")
async def get_risk_trajectory():
    """
    Get delivery probability trajectory for all sprint issues.

    Fetches active sprint, sprint issues, and recent commits,
    then calculates per-ticket delivery probability with
    velocity, complexity, and churn analysis.
    """
    try:
        # Fetch sprint data
        sprint = await jira.fetch_active_sprint()
        if not sprint:
            return {"trajectories": [], "message": "No active sprint found"}

        sprint_issues = await jira.fetch_sprint_issues(sprint["id"])
        if not sprint_issues:
            return {"trajectories": [], "message": "No issues in active sprint"}

        # Fetch commits from last 14 days
        since = (datetime.utcnow() - timedelta(days=14)).isoformat() + "Z"
        commits = await github.fetch_commits(since=since)

        # Calculate trajectory for each issue
        trajectories = calculate_trajectory(sprint_issues, commits, sprint)

        return {
            "sprint": sprint.get("name", ""),
            "trajectories": trajectories,
            "total": len(trajectories),
        }
    except Exception as e:
        logger.exception("Risk trajectory error")
        return {"error": True, "message": str(e), "trajectories": []}


@router.get("/api/risk/flags")
async def get_risk_flags():
    """
    Detect active risk flags across the sprint.

    Scans for: DELIVERY_AT_RISK, BURNOUT_AND_DELAY_PROBABLE, REFACTORING_SPIRAL
    """
    try:
        sprint = await jira.fetch_active_sprint()
        if not sprint:
            return {"flags": [], "total": 0, "message": "No active sprint found"}

        sprint_issues = await jira.fetch_sprint_issues(sprint["id"])
        since = (datetime.utcnow() - timedelta(days=14)).isoformat() + "Z"
        commits = await github.fetch_commits(since=since)
        contributors = await github.fetch_contributors()

        # Build required data
        dev_profiles = build_profiles(commits, contributors)
        trajectories = calculate_trajectory(sprint_issues, commits, sprint)

        # Detect flags
        result = detect_flags(trajectories, dev_profiles, sprint, commits)
        return result
    except Exception as e:
        logger.exception("Risk flags error")
        return {"error": True, "message": str(e), "flags": [], "total": 0}


@router.get("/api/techdebt")
async def get_tech_debt():
    """
    Get tech debt analysis sorted by debt score.

    Analyses churn rate, test coverage gaps, and complexity growth
    across all modules in the last 7 days of commits.
    """
    try:
        since = (datetime.utcnow() - timedelta(days=14)).isoformat() + "Z"
        commits = await github.fetch_commits(since=since)
        debt = calculate_tech_debt(commits)
        return {"tech_debt": debt, "total": len(debt)}
    except Exception as e:
        logger.exception("Tech debt error")
        return {"error": True, "message": str(e), "tech_debt": []}

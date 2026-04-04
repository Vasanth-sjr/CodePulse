"""Manager Dashboard route — single-pane aggregated view.

Routes:
  GET /api/dashboard/manager — full manager dashboard
"""

import logging
from fastapi import APIRouter
from services.dashboard_predictive import build_manager_dashboard

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Manager Dashboard"])


@router.get("/api/dashboard/manager")
async def get_manager_dashboard():
    """
    Build the complete manager command center dashboard.

    Aggregates: sprint summary, feature trajectories, risk flags,
    team load, tech debt hotspots, and intervention recommendations.
    """
    try:
        dashboard = await build_manager_dashboard()
        return dashboard
    except Exception as e:
        logger.exception("Manager dashboard error")
        return {
            "error": True,
            "message": str(e),
            "sprint_summary": {},
            "features": [],
            "active_risk_flags": [],
            "team_load": [],
            "tech_debt_hotspots": [],
        }

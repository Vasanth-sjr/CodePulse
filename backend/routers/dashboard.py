"""Dashboard aggregator endpoint."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict
from models.db import get_db, Repository, Commit, Developer, Requirement
from services.impact_service import calculate_impact_scores
from services.risk_service import detect_knowledge_risks

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    repo_id: int = Query(..., description="Repository ID"),
    db: Session = Depends(get_db),
):
    """
    Get unified dashboard summary combining all analysis data.
    """
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Get commits
    db_commits = db.query(Commit).filter(Commit.repo_id == repo_id).order_by(Commit.author_date.desc()).all()
    commits = [
        {
            "sha": c.sha,
            "message": c.message or "",
            "author": c.author_name or "",
            "date": c.author_date.isoformat() if c.author_date else "",
            "files": c.files or [],
            "files_changed": c.files_changed,
        }
        for c in db_commits
    ]

    # Get developers
    db_devs = db.query(Developer).filter(Developer.repo_id == repo_id).all()
    developers = [
        {
            "name": d.name,
            "commits": d.commit_count,
            "files_changed": d.files_changed,
            "lines_changed": d.lines_changed,
            "modules": d.modules or [],
        }
        for d in db_devs
    ]

    # Calculate impact scores
    impact_scores = calculate_impact_scores(developers, commits)

    # Detect risks
    risks = detect_knowledge_risks({}, commits)
    risky_modules = sum(1 for r in risks if r["risk_level"] == "HIGH")

    # Build daily commit activity (last 30 days)
    now = datetime.utcnow()
    daily_counts = defaultdict(int)
    for c in db_commits:
        if c.author_date:
            date_key = c.author_date.date() if hasattr(c.author_date, 'date') else c.author_date
            daily_counts[date_key] += 1

    commit_activity = []
    for i in range(29, -1, -1):
        day = (now - timedelta(days=i)).date()
        commit_activity.append(daily_counts.get(day, 0))

    # Derive module count from risk analysis + developers
    all_modules = set()
    for d in developers:
        mods = d.get("modules", [])
        if isinstance(mods, list):
            all_modules.update(mods)
    for r in risks:
        all_modules.add(r["module"])

    # Build recent activity (latest 10 commits)
    recent_activity = []
    for c in commits[:10]:
        recent_activity.append({
            "sha": c["sha"],
            "message": c["message"],
            "author": c["author"],
            "date": c["date"],
            "files_changed": c.get("files_changed", len(c.get("files", []))),
        })

    # Get requirement mappings
    db_reqs = db.query(Requirement).filter(Requirement.repo_id == repo_id).all()
    requirement_mapping = [r.mapping_data for r in db_reqs if r.mapping_data]

    return {
        "repo_overview": {
            "repo_name": f"{repo.owner}/{repo.name}",
            "total_commits": repo.total_commits,
            "active_developers": len(developers),
            "modules_tracked": len(all_modules) if all_modules else len(risks),
            "risky_modules": risky_modules,
            "commit_activity": commit_activity,
            "recent_activity": recent_activity,
        },
        "developer_impact": impact_scores,
        "requirement_mapping": requirement_mapping,
        "knowledge_risks": risks,
    }

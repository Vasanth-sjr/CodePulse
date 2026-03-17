"""NLP analysis and impact score endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.db import get_db, Repository, Commit, Developer, Requirement
from models.schemas import (
    RequirementsRequest, RequirementMapping, DeveloperImpact, ErrorResponse
)
from services.nlp_service import map_requirements_to_commits
from services.impact_service import calculate_impact_scores

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


@router.post(
    "/requirements",
    response_model=list[RequirementMapping],
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def analyze_requirements(
    request: RequirementsRequest,
    db: Session = Depends(get_db),
):
    """
    Map business requirements to commits using NLP semantic similarity.
    """
    # Get repository
    repo = db.query(Repository).filter(Repository.id == request.repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Get commits
    db_commits = db.query(Commit).filter(Commit.repo_id == request.repo_id).all()
    if not db_commits:
        raise HTTPException(status_code=404, detail="No commits found for this repository")

    commits = [
        {
            "sha": c.sha,
            "message": c.message or "",
            "author": c.author_name or "",
            "date": c.author_date.isoformat() if c.author_date else "",
        }
        for c in db_commits
    ]

    try:
        mappings = map_requirements_to_commits(request.requirements, commits)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"NLP analysis failed: {str(e)}",
        )

    # Save requirements to DB
    # Clear old requirements for this repo
    db.query(Requirement).filter(Requirement.repo_id == request.repo_id).delete()

    for mapping in mappings:
        req = Requirement(
            repo_id=request.repo_id,
            text=mapping["requirement"],
            confidence=mapping["confidence"],
            matched_commits=mapping["matched_commits"],
            mapping_data=mapping,
        )
        db.add(req)

    db.commit()

    return mappings


@router.get(
    "/impact",
    response_model=list[DeveloperImpact],
    responses={404: {"model": ErrorResponse}},
)
async def get_impact_scores(
    repo_id: int = Query(..., description="Repository ID"),
    db: Session = Depends(get_db),
):
    """
    Get developer impact scores for a repository.
    """
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

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

    # Get commits for trend data
    db_commits = db.query(Commit).filter(Commit.repo_id == repo_id).all()
    commits = [
        {
            "sha": c.sha,
            "message": c.message or "",
            "author": c.author_name or "",
            "date": c.author_date.isoformat() if c.author_date else "",
        }
        for c in db_commits
    ]

    results = calculate_impact_scores(developers, commits)

    # Update DB with calculated scores
    for result in results:
        db_dev = db.query(Developer).filter(
            Developer.repo_id == repo_id,
            Developer.name == result["name"],
        ).first()
        if db_dev:
            db_dev.impact_score = result["impact_score"]
            db_dev.risk_label = result["risk_label"]

    db.commit()

    return results


@router.get(
    "/risks",
    responses={404: {"model": ErrorResponse}},
)
async def get_knowledge_risks(
    repo_id: int = Query(..., description="Repository ID"),
    db: Session = Depends(get_db),
):
    """
    Get knowledge concentration risks per module.
    """
    from services.risk_service import detect_knowledge_risks

    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Get commits with file data to derive modules
    db_commits = db.query(Commit).filter(Commit.repo_id == repo_id).all()
    commits = [
        {
            "sha": c.sha,
            "message": c.message or "",
            "author": c.author_name or "",
            "date": c.author_date.isoformat() if c.author_date else "",
            "files": c.files or [],
        }
        for c in db_commits
    ]

    # Derive module structure from commits
    risks = detect_knowledge_risks({}, commits)
    return risks

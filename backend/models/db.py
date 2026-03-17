"""SQLAlchemy database models for CodePulse."""

import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Text, DateTime,
    ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./codepulse.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    repo_url = Column(String(500), nullable=False)
    owner = Column(String(200), nullable=False)
    name = Column(String(200), nullable=False)
    total_commits = Column(Integer, default=0)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    commits = relationship("Commit", back_populates="repository", cascade="all, delete-orphan")
    developers = relationship("Developer", back_populates="repository", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="repository", cascade="all, delete-orphan")


class Commit(Base):
    __tablename__ = "commits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    sha = Column(String(40), nullable=False)
    message = Column(Text, nullable=True)
    author_name = Column(String(200), nullable=True)
    author_date = Column(DateTime, nullable=True)
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    files_changed = Column(Integer, default=0)
    files = Column(JSON, nullable=True)  # list of {filename, additions, deletions, changes}

    repository = relationship("Repository", back_populates="commits")


class Developer(Base):
    __tablename__ = "developers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    name = Column(String(200), nullable=False)
    commit_count = Column(Integer, default=0)
    files_changed = Column(Integer, default=0)
    lines_changed = Column(Integer, default=0)
    modules = Column(JSON, nullable=True)  # list of module names
    impact_score = Column(Float, default=0.0)
    risk_label = Column(String(20), nullable=True)

    repository = relationship("Repository", back_populates="developers")


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    text = Column(Text, nullable=False)
    confidence = Column(Float, default=0.0)
    matched_commits = Column(Integer, default=0)
    mapping_data = Column(JSON, nullable=True)  # full mapping result

    repository = relationship("Repository", back_populates="requirements")


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for FastAPI to get a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

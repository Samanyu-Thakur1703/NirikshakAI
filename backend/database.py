"""
Database setup for NirikshakAI using SQLite + SQLAlchemy.
Provides persistent storage for disaster reports, clustered incidents, and ingestion logs.
"""

import json
from pathlib import Path
from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, Index
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timezone

# Ensure database directory exists
DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "nirikshak.db"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite with FastAPI multi-threading
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class ReportDB(Base):
    __tablename__ = "reports"

    report_id = Column(String(64), primary_key=True, index=True)
    platform = Column(String(32), index=True, nullable=False)
    domain = Column(String(128), default="")
    hazard = Column(String(32), index=True, nullable=False)
    claimed_place = Column(String(256), default="")
    claimed_time = Column(String(64), nullable=False)
    text = Column(Text, nullable=False)
    lat = Column(Float, nullable=True, index=True)
    lon = Column(Float, nullable=True, index=True)
    district = Column(String(128), index=True, default="")
    score = Column(Float, default=0.0, index=True)
    verdict = Column(String(32), index=True, default="review")  # verified, review, rejected
    full_data = Column(Text, nullable=False)  # Complete JSON serialized DisasterReport
    created_at = Column(String(64), index=True)
    updated_at = Column(String(64))

    __table_args__ = (
        Index("idx_reports_verdict_score", "verdict", "score"),
        Index("idx_reports_geo", "lat", "lon"),
    )


class IncidentDB(Base):
    __tablename__ = "incidents"

    incident_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    disaster_type = Column(String(64), index=True, nullable=False)
    district = Column(String(128), index=True, default="")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    source_count = Column(Integer, default=1)
    confidence_score = Column(Float, default=0.0)
    priority = Column(String(32), default="MEDIUM")
    status = Column(String(32), default="active")
    full_data = Column(Text, nullable=False)  # Complete JSON serialized Incident
    created_at = Column(String(64))
    updated_at = Column(String(64))


class IngestionLogDB(Base):
    __tablename__ = "ingestion_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(64), index=True, nullable=False)
    fetched_count = Column(Integer, default=0)
    ingested_count = Column(Integer, default=0)
    status = Column(String(32), default="success")
    error_message = Column(Text, nullable=True)
    timestamp = Column(String(64), default=lambda: datetime.now(timezone.utc).isoformat())


def init_db():
    """Create all tables in SQLite database."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency helper for FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

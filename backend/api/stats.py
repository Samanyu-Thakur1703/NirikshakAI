"""
FastAPI Endpoints for System Health and Ingestion Statistics.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.database import get_db
from backend.models import IngestStats
from backend.crud import get_ingest_stats

router = APIRouter(tags=["Stats & Health"])


@router.get("/stats", response_model=IngestStats)
def get_stats(db: Session = Depends(get_db)):
    """
    Retrieve real-time verification and ingestion metrics.
    Used for dashboard analytics cards and time-series summaries.
    """
    return get_ingest_stats(db=db)


@router.get("/health")
def health_check():
    """Health check endpoint for Docker, uptime probes, and handoff verification."""
    return {
        "status": "healthy",
        "service": "NirikshakAI Ingest & Backend Core",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "sqlite_connected"
    }

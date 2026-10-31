"""
API Routers for NirikshakAI backend.
"""

from backend.api.reports import router as reports_router
from backend.api.incidents import router as incidents_router
from backend.api.stats import router as stats_router

__all__ = ["reports_router", "incidents_router", "stats_router"]

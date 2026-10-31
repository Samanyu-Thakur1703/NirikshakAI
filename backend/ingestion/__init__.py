"""
NirikshakAI Ingestion Package
Provides tools and connectors for polling, normalizing, and filtering multi-source disaster reports.
"""

from backend.ingestion.normalizer import normalize_report
from backend.ingestion.relevance_filter import classify_relevance, is_relevant, detect_hazard
from backend.ingestion.sachet_client import fetch_sachet_alerts
from backend.ingestion.imd_client import fetch_imd_alerts
from backend.ingestion.gdacs_client import fetch_gdacs_alerts
from backend.ingestion.gdelt_client import fetch_gdelt_news
from backend.ingestion.openmeteo_client import fetch_openmeteo_rainfall, geocode_place
from backend.ingestion.bluesky_client import fetch_bluesky_posts
from backend.ingestion.youtube_client import fetch_youtube_disaster_videos
from backend.ingestion.mock_generator import generate_mock_reports, get_mock_reports

__all__ = [
    "normalize_report",
    "classify_relevance",
    "is_relevant",
    "detect_hazard",
    "fetch_sachet_alerts",
    "fetch_imd_alerts",
    "fetch_gdacs_alerts",
    "fetch_gdelt_news",
    "fetch_openmeteo_rainfall",
    "geocode_place",
    "fetch_bluesky_posts",
    "fetch_youtube_disaster_videos",
    "generate_mock_reports",
    "get_mock_reports",
]

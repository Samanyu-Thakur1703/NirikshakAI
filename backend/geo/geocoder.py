"""Geocoding and district assignment facade."""

from typing import Any, Dict, Optional

from backend.ingestion.openmeteo_client import geocode_place as _geocode_place
from backend.verification.forensics_agent import geo_locator


async def geocode_place(place_name: str) -> Optional[Dict[str, Any]]:
    """Resolve a place through the shared Open-Meteo/gazetteer client."""
    return await _geocode_place(place_name)


def assign_district(lat: float, lon: float) -> Dict[str, Any]:
    """Assign coordinates to the nearest known Indian district."""
    return geo_locator.assign_district(lat, lon)


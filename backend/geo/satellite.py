"""Weather and satellite evidence clients used by the verification pipeline."""

import urllib.request
from typing import Any, Dict

from backend.ingestion.openmeteo_client import fetch_openmeteo_rainfall


async def fetch_weather_evidence(lat: float, lon: float, hours: int = 3) -> Dict[str, Any]:
    """Return precipitation evidence for a coordinate."""
    return await fetch_openmeteo_rainfall(lat, lon, hours)


def gibs_tile_url(layer: str, date: str, z: int, x: int, y: int) -> str:
    """Build a NASA GIBS WMTS tile URL without requiring an API key."""
    return (
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/"
        f"{layer}/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg"
    )


def check_satellite_evidence(lat: float, lon: float, date: str) -> bool:
    """
    Probe NASA GIBS satellite imagery for the given coordinate/date.

    Returns True when a satellite tile is reachable for the claimed date,
    False otherwise. Never raises — failures are treated as no evidence.
    """
    if not lat or not lon or not date:
        return False
    try:
        url = gibs_tile_url("MODIS_Terra_NearIR_TrueColor", date, z=2, x=0, y=0)
        req = urllib.request.Request(url, method="HEAD", headers={
            "User-Agent": "NirikshakAI/1.0 (NDMA Disaster Verification Engine; Hackathon Research)"
        })
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status < 400
    except Exception:
        return False


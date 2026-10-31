"""Weather and satellite evidence clients used by the verification pipeline."""

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


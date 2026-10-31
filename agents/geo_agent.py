"""Agent wrapper for C4 location verification."""

from typing import Any, Dict

from backend.geo.geocoder import assign_district, geocode_place


async def verify_location(report: Any) -> Dict[str, Any]:
    """Resolve the claimed place and assign a district where coordinates exist."""
    claim = getattr(report, "claim", None)
    geo = getattr(report, "geo", None)
    place = getattr(claim, "claimed_place", "") if claim else ""
    result: Dict[str, Any] = {
        "report_id": getattr(report, "report_id", ""),
        "extracted_places": [place] if place else [],
        "geocoded_lat": None,
        "geocoded_lon": None,
        "district": "",
        "location_confidence": 0.0,
        "contradictions": [],
        "reasons": [],
    }
    if place:
        match = await geocode_place(place)
        if match:
            result.update({
                "geocoded_lat": match["lat"],
                "geocoded_lon": match["lon"],
                "location_confidence": match.get("confidence", 0.0),
            })
            result["reasons"].append(f"Geocoded '{place}' using {match.get('method', 'unknown')}.")
    lat = result["geocoded_lat"] or (getattr(geo, "lat", None) if geo else None)
    lon = result["geocoded_lon"] or (getattr(geo, "lon", None) if geo else None)
    if lat is not None and lon is not None:
        result["district"] = assign_district(lat, lon).get("district", "")
    return result


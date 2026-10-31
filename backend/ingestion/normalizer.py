"""
Report Normalizer for NirikshakAI.
Converts heterogeneous data payloads from 8+ sources into the standard DisasterReport schema.
Guarantees schema compliance and preserves all media URLs and raw metadata.
"""

import hashlib
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from dateutil import parser as date_parser

from backend.models import (
    DisasterReport, Source, Claim, MediaItem, ArchiveMatch,
    ExifData, ExifGps, GeoLocation, Checks, OfficialCheck,
    PhysicalCheck, ProvenanceCheck, LocationCheck, CorroborationCheck,
    get_utc_now_iso
)
from backend.ingestion.relevance_filter import detect_hazard


PLATFORM_REPUTATIONS = {
    "sachet": 0.95,
    "imd": 0.95,
    "gdacs": 0.90,
    "gdelt": 0.75,
    "news": 0.75,
    "mock": 0.65,
    "youtube": 0.45,
    "bluesky": 0.40,
    "citizen": 0.35,
}

PLATFORM_DOMAINS = {
    "sachet": "sachet.ndma.gov.in",
    "imd": "imd.gov.in",
    "gdacs": "gdacs.org",
    "gdelt": "gdeltproject.org",
    "news": "news.google.com",
    "mock": "synthetic.nirikshakai.internal",
    "youtube": "youtube.com",
    "bluesky": "bsky.app",
    "citizen": "public.web",
}


def parse_iso_utc(timestamp_str: Optional[str]) -> str:
    """Normalize any date format string into ISO 8601 UTC."""
    if not timestamp_str:
        return get_utc_now_iso()
    try:
        dt = date_parser.parse(str(timestamp_str))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.isoformat()
    except Exception:
        return get_utc_now_iso()


def generate_report_id(prefix: str, unique_text: str) -> str:
    """Deterministic, collision-resistant report ID e.g. r_a1b2c3d4."""
    digest = hashlib.md5(unique_text.encode("utf-8", errors="ignore")).hexdigest()[:8]
    return f"r_{digest}"


def clean_coordinate(val: Any) -> Optional[float]:
    """Parse coordinate float; return None if invalid or out of range."""
    if val is None:
        return None
    try:
        f_val = float(val)
        if -90.0 <= f_val <= 90.0 or -180.0 <= f_val <= 180.0:
            return round(f_val, 6)
    except (ValueError, TypeError):
        pass
    return None


def normalize_report(raw_data: Dict[str, Any], source_platform: str) -> DisasterReport:
    """
    Transform raw data dict into a strictly validated DisasterReport instance.
    """
    # Unpack nested objects if already partially structured
    claim_dict = raw_data.get("claim", {}) if isinstance(raw_data.get("claim"), dict) else {}
    source_dict = raw_data.get("source", {}) if isinstance(raw_data.get("source"), dict) else {}
    geo_dict = raw_data.get("geo", {}) if isinstance(raw_data.get("geo"), dict) else {}

    platform = (source_dict.get("platform") or source_platform or "mock").lower()

    # 1. Extract and sanitize text
    text = (
        claim_dict.get("text")
        or raw_data.get("text")
        or raw_data.get("description")
        or raw_data.get("title")
        or raw_data.get("summary")
        or ""
    ).strip()

    # 2. Extract hazard
    hazard = claim_dict.get("hazard") or raw_data.get("hazard") or raw_data.get("disaster_type")
    if not hazard or hazard == "unknown":
        hazard = detect_hazard(text)
    if hazard not in ("flood", "fire", "storm", "heatwave", "earthquake", "landslide"):
        hazard = "unknown"

    # 3. Location extraction
    claimed_place = str(
        claim_dict.get("claimed_place")
        or raw_data.get("claimed_place")
        or raw_data.get("place")
        or raw_data.get("location")
        or raw_data.get("district")
        or ""
    ).strip()

    district = str(geo_dict.get("district") or raw_data.get("district") or claimed_place.split(",")[0]).strip()

    lat = clean_coordinate(geo_dict.get("lat") if "lat" in geo_dict else (raw_data.get("lat") or raw_data.get("latitude")))
    lon = clean_coordinate(geo_dict.get("lon") if "lon" in geo_dict else (raw_data.get("lon") or raw_data.get("longitude")))

    # Determine location resolution method
    if lat is not None and lon is not None:
        method = geo_dict.get("method") or raw_data.get("method") or ("official_polygon" if platform in ("sachet", "imd", "gdacs") else "text_geocode")
        geo_confidence = float(geo_dict.get("confidence", raw_data.get("geo_confidence", 0.7 if platform in ("sachet", "imd") else 0.5)))
    else:
        method = "unresolved"
        geo_confidence = 0.0

    # 4. Media Extraction
    media_items: List[MediaItem] = []
    raw_media = raw_data.get("media") or []
    if isinstance(raw_media, list):
        for m in raw_media:
            if isinstance(m, dict) and m.get("url"):
                exif_gps_raw = m.get("exif", {}).get("gps") if isinstance(m.get("exif"), dict) else None
                exif_gps = None
                if isinstance(exif_gps_raw, dict):
                    exif_gps = ExifGps(
                        lat=clean_coordinate(exif_gps_raw.get("lat")),
                        lon=clean_coordinate(exif_gps_raw.get("lon"))
                    )

                media_items.append(
                    MediaItem(
                        url=m.get("url"),
                        phash=m.get("phash", ""),
                        archive_match=ArchiveMatch(
                            score=float(m.get("archive_match", {}).get("score", 0.0)),
                            matched_id=str(m.get("archive_match", {}).get("matched_id", "")),
                            matched_date=str(m.get("archive_match", {}).get("matched_date", ""))
                        ),
                        exif=ExifData(
                            gps=exif_gps,
                            datetime=m.get("exif", {}).get("datetime") if isinstance(m.get("exif"), dict) else None,
                            camera=m.get("exif", {}).get("camera") if isinstance(m.get("exif"), dict) else None
                        )
                    )
                )
    # Direct image_url field support
    if not media_items and raw_data.get("image_url"):
        media_items.append(
            MediaItem(
                url=str(raw_data["image_url"]),
                phash=str(raw_data.get("phash", "")),
                archive_match=ArchiveMatch(),
                exif=ExifData()
            )
        )

    # 5. Timestamp parsing
    claimed_time = parse_iso_utc(
        raw_data.get("claimed_time")
        or raw_data.get("timestamp")
        or raw_data.get("pubDate")
        or raw_data.get("published_at")
    )

    # 6. Generate report_id
    id_seed = f"{platform}_{claimed_time}_{text[:40]}"
    report_id = raw_data.get("report_id") or generate_report_id("r", id_seed)

    # 7. Source metadata
    reputation = float(raw_data.get("reputation", PLATFORM_REPUTATIONS.get(platform, 0.5)))
    domain = raw_data.get("domain") or PLATFORM_DOMAINS.get(platform, "web")
    account = raw_data.get("account") or raw_data.get("author") or raw_data.get("source_name") or ""

    # 8. Initial checks object
    checks = Checks(
        official=OfficialCheck(
            c1_result=raw_data.get("checks", {}).get("official", {}).get("c1_result", "unknown"),
            alert_ids=raw_data.get("checks", {}).get("official", {}).get("alert_ids", []),
            details=raw_data.get("checks", {}).get("official", {}).get("details", "")
        ),
        physical=PhysicalCheck(
            c2_result=raw_data.get("checks", {}).get("physical", {}).get("c2_result", "unknown"),
            rainfall_mm=float(raw_data.get("checks", {}).get("physical", {}).get("rainfall_mm", 0.0)),
            satellite_evidence=bool(raw_data.get("checks", {}).get("physical", {}).get("satellite_evidence", False)),
            details=raw_data.get("checks", {}).get("physical", {}).get("details", "")
        ),
        provenance=ProvenanceCheck(
            c3_result=raw_data.get("checks", {}).get("provenance", {}).get("c3_result", "unknown"),
            recycled=bool(raw_data.get("checks", {}).get("provenance", {}).get("recycled", False)),
            archive_match_score=float(raw_data.get("checks", {}).get("provenance", {}).get("archive_match_score", 0.0)),
            details=raw_data.get("checks", {}).get("provenance", {}).get("details", "")
        ),
        location=LocationCheck(
            c4_result=raw_data.get("checks", {}).get("location", {}).get("c4_result", "unknown"),
            contradictions=raw_data.get("checks", {}).get("location", {}).get("contradictions", []),
            details=raw_data.get("checks", {}).get("location", {}).get("details", "")
        ),
        corroboration=CorroborationCheck(
            c5_result=raw_data.get("checks", {}).get("corroboration", {}).get("c5_result", "unknown"),
            independent_sources=int(raw_data.get("checks", {}).get("corroboration", {}).get("independent_sources", 0)),
            details=raw_data.get("checks", {}).get("corroboration", {}).get("details", "")
        )
    )

    score = float(raw_data.get("score", 0.0))
    verdict = raw_data.get("verdict", "review")
    if verdict not in ("verified", "review", "rejected"):
        verdict = "review"

    reasons = raw_data.get("reasons", [])
    if isinstance(reasons, str):
        reasons = [reasons]

    return DisasterReport(
        report_id=report_id,
        source=Source(
            platform=platform,
            domain=domain,
            account=account,
            reputation=reputation
        ),
        claim=Claim(
            hazard=hazard,
            text=text,
            claimed_place=claimed_place,
            claimed_time=claimed_time
        ),
        media=media_items,
        geo=GeoLocation(
            lat=lat,
            lon=lon,
            radius_km=float(raw_data.get("radius_km", 5.0)),
            method=method,
            confidence=geo_confidence,
            district=district
        ),
        checks=checks,
        score=score,
        verdict=verdict,
        reasons=reasons,
        created_at=parse_iso_utc(raw_data.get("created_at")),
        updated_at=get_utc_now_iso(),
        raw_source_data=raw_data
    )

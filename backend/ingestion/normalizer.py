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


def run_verification_pipeline(report: DisasterReport) -> tuple:
    """
    Run C1-C5 verification checks on a normalized report and return
    (score, verdict, checks, reasons).

    C1 Official  - matches an official alert feed (sachet/imd/gdacs or alert ids)
    C2 Physical  - rainfall / satellite evidence for the claimed hazard
    C3 Provenance- not recycled media (archive match / duplicate detection)
    C4 Location  - claimed district matches the coordinates
    C5 Corroboration - corroborated by >=1 independent source
    """
    checks = report.checks
    reasons: list = list(report.reasons)
    hazard = report.claim.hazard
    platform = report.source.platform

    # ---- C1: Official check -------------------------------------------------
    official_alerts = bool(checks.official.alert_ids) or platform in ("sachet", "imd", "gdacs")
    if official_alerts:
        checks.official.c1_result = "pass"
        checks.official.details = f"Official alert feed matched ({platform})"
    else:
        checks.official.c1_result = "unknown"
        checks.official.details = "No official alert feed match"

    # ---- C2: Physical check -------------------------------------------------
    rainfall = checks.physical.rainfall_mm
    satellite = checks.physical.satellite_evidence
    if rainfall > 0 or satellite:
        checks.physical.c2_result = "pass"
        checks.physical.details = f"Rainfall {rainfall}mm, satellite={satellite}"
    else:
        checks.physical.c2_result = "unknown"
        checks.physical.details = "No physical telemetry available"

    # ---- C3: Provenance check ----------------------------------------------
    archive_score = 0.0
    for media in report.media:
        archive_score = max(archive_score, float(media.archive_match.score or 0.0))
    if archive_score >= 0.9:
        checks.provenance.c3_result = "fail"
        checks.provenance.recycled = True
        checks.provenance.archive_match_score = archive_score
        checks.provenance.details = f"Recycled media (archive match {archive_score:.2f})"
    elif report.media:
        checks.provenance.c3_result = "pass"
        checks.provenance.archive_match_score = archive_score
        checks.provenance.details = "No recycled media detected"
    else:
        checks.provenance.c3_result = "unknown"
        checks.provenance.details = "No media to verify"

    # ---- C4: Location check -------------------------------------------------
    lat, lon = report.geo.lat, report.geo.lon
    claimed_district = (report.geo.district or "").strip()
    if lat is not None and lon is not None:
        try:
            from backend.verification.forensics_agent import geo_locator
            assigned = geo_locator.assign_district(lat, lon)
            assigned_district = (assigned.get("district") or "").strip()
            if assigned_district and (
                not claimed_district
                or claimed_district.lower() in assigned_district.lower()
                or assigned_district.lower() in claimed_district.lower()
            ):
                checks.location.c4_result = "pass"
                checks.location.details = f"Coordinates map to {assigned_district}, {assigned.get('state')}"
            else:
                checks.location.c4_result = "fail"
                checks.location.contradictions = [
                    f"Claimed '{claimed_district}' but coordinates map to {assigned_district}"
                ]
                checks.location.details = "District/coordinate mismatch"
        except Exception as exc:
            checks.location.c4_result = "unknown"
            checks.location.details = f"District assignment failed: {exc}"
    elif claimed_district:
        checks.location.c4_result = "pass"
        checks.location.details = f"District claimed from text: {claimed_district}"
    else:
        checks.location.c4_result = "unknown"
        checks.location.details = "No location data"

    # ---- C5: Corroboration check -------------------------------------------
    independent = int(checks.corroboration.independent_sources or 0)
    raw_sources = report.raw_source_data.get("sources") if report.raw_source_data else None
    if isinstance(raw_sources, list):
        independent = max(independent, len(set(raw_sources)))
    checks.corroboration.independent_sources = independent
    if independent >= 1:
        checks.corroboration.c5_result = "pass"
        checks.corroboration.details = f"Corroborated by {independent} independent source(s)"
    else:
        checks.corroboration.c5_result = "unknown"
        checks.corroboration.details = "Single-source report"

    # ---- Score --------------------------------------------------------------
    score = report.source.reputation * 0.5  # base: platform trust
    score += 0.15 if checks.official.c1_result == "pass" else (-0.20 if checks.official.c1_result == "fail" else 0.0)
    score += 0.10 if checks.physical.c2_result == "pass" else 0.0
    score += 0.10 if checks.provenance.c3_result == "pass" else (-0.25 if checks.provenance.c3_result == "fail" else 0.0)
    score += 0.15 if checks.location.c4_result == "pass" else (-0.15 if checks.location.c4_result == "fail" else 0.0)
    score += 0.10 if checks.corroboration.c5_result == "pass" else 0.0
    score = round(max(0.0, min(1.0, score)), 3)

    fails = [c for c in ("c1_result", "c2_result", "c3_result", "c4_result", "c5_result")
             if getattr(checks.official if c == "c1_result" else
                        checks.physical if c == "c2_result" else
                        checks.provenance if c == "c3_result" else
                        checks.location if c == "c4_result" else
                        checks.corroboration, c) == "fail"]
    if fails:
        verdict = "rejected"
    elif score >= 0.6:
        verdict = "verified"
    else:
        verdict = "review"

    reasons.append(f"Verification score {score} (C1={checks.official.c1_result}, C2={checks.physical.c2_result}, "
                   f"C3={checks.provenance.c3_result}, C4={checks.location.c4_result}, C5={checks.corroboration.c5_result})")
    return score, verdict, checks, reasons


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

    report = DisasterReport(
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
        score=float(raw_data.get("score", 0.0)),
        verdict=raw_data.get("verdict", "review") if raw_data.get("verdict") in ("verified", "review", "rejected") else "review",
        reasons=raw_data.get("reasons", []),
        created_at=parse_iso_utc(raw_data.get("created_at")),
        updated_at=get_utc_now_iso(),
        raw_source_data=raw_data
    )

    # Run C1-C5 verification checks and set a real score/verdict
    score, verdict, checks, reasons = run_verification_pipeline(report)
    report.score = score
    report.verdict = verdict
    report.checks = checks
    report.reasons = reasons
    report.updated_at = get_utc_now_iso()
    return report

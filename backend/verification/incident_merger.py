"""
Incident Merger for NirikshakAI Dedup Agent.
Merges duplicates and clustered reports into standardized, high-confidence Incident objects.
"""

from collections import Counter
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import numpy as np

from backend.models import Incident, DisasterReport, get_utc_now_iso
from backend.verification.clusterer import haversine_distance_km


def generate_cap_12_xml(
    incident_id: str,
    disaster_type: str,
    district: str,
    lat: float,
    lon: float,
    radius_km: float,
    severity: str,
    operator_summary: str
) -> str:
    """Generate CAP 1.2 XML compliant with NDMA SACHET alerting format."""
    now_iso = get_utc_now_iso()
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>NirikshakAI-{incident_id}</identifier>
  <sender>NirikshakAI-Verification-Engine</sender>
  <sent>{now_iso}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>{disaster_type.capitalize()}</event>
    <urgency>Immediate</urgency>
    <severity>{severity}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>NDMA-CAP-1.2</valueName>
      <value>{disaster_type.upper()}</value>
    </eventCode>
    <headline>{disaster_type.capitalize()} alert in {district}</headline>
    <description>{operator_summary}</description>
    <area>
      <areaDesc>{district}</areaDesc>
      <circle>{lat:.4f},{lon:.4f},{radius_km:.1f}</circle>
    </area>
  </info>
</alert>"""


def build_incident_from_cluster(
    cluster_report_ids: List[str],
    reports_by_id: Dict[str, DisasterReport],
    incident_index: int = 1
) -> Incident:
    """
    Merge a group of clustered DisasterReport objects into a single parent Incident.
    """
    member_reports = [reports_by_id[r_id] for r_id in cluster_report_ids if r_id in reports_by_id]
    if not member_reports:
        raise ValueError("Cannot create incident from empty cluster")

    # 1. Centroid calculation
    valid_coords = [(r.geo.lat, r.geo.lon) for r in member_reports if r.geo.lat is not None and r.geo.lon is not None]
    if valid_coords:
        centroid_lat = float(np.mean([c[0] for c in valid_coords]))
        centroid_lon = float(np.mean([c[1] for c in valid_coords]))
        # Calculate cluster radius (max distance from centroid)
        max_dist = max(haversine_distance_km(centroid_lat, centroid_lon, c[0], c[1]) for c in valid_coords)
        radius_km = max(1.5, round(max_dist, 2))
    else:
        centroid_lat = 0.0
        centroid_lon = 0.0
        radius_km = 5.0

    # 2. Majority vote for hazard / disaster_type
    hazards = [r.claim.hazard for r in member_reports if r.claim.hazard != "unknown"]
    disaster_type = Counter(hazards).most_common(1)[0][0] if hazards else "flood"

    # 3. District assignment (most frequent non-empty district)
    districts = [r.geo.district for r in member_reports if r.geo.district]
    district = Counter(districts).most_common(1)[0][0] if districts else "Unknown District"

    # 4. Sources aggregation
    sources = list(set(r.source.platform for r in member_reports))

    # 5. Timestamp bounds
    timestamps = [r.claim.claimed_time for r in member_reports if r.claim.claimed_time]
    timestamps.sort()
    ts_first = timestamps[0] if timestamps else get_utc_now_iso()
    ts_last = timestamps[-1] if timestamps else get_utc_now_iso()

    # 6. Confidence score calculation (average + 15% cluster boost)
    raw_scores = [r.score for r in member_reports]
    base_score = float(np.mean(raw_scores)) if raw_scores else 0.5
    is_clustered = len(member_reports) > 1

    # Boost confidence of clustered incidents by +15%
    if is_clustered:
        boosted_score = min(0.98, base_score + 0.15)
    else:
        boosted_score = base_score

    # Convert to 0-100 scale for output consistency
    confidence_pct = round(boosted_score * 100.0, 1)

    # 7. Priority determination
    size = len(member_reports)
    if size >= 5:
        priority = "CRITICAL"
        severity = "Extreme"
    elif size >= 3:
        priority = "HIGH"
        severity = "Severe"
    else:
        priority = "MEDIUM"
        severity = "Moderate"

    incident_id = f"INC-{incident_index:03d}"
    title = f"{disaster_type.capitalize()} Cluster in {district}"

    reasons = [
        f"{len(sources)} independent sources ({', '.join(sources)})",
        f"Clustered {size} reports within {radius_km}km radius",
        f"Confidence boosted by +15% to {confidence_pct}%" if is_clustered else "Single-source report"
    ]

    operator_summary = (
        f"{disaster_type.capitalize()} reported near {district}. "
        f"{len(sources)} independent sources across {size} reports, {confidence_pct}% confidence. "
        f"{priority} priority."
    )

    cap_xml = generate_cap_12_xml(
        incident_id=incident_id,
        disaster_type=disaster_type,
        district=district,
        lat=centroid_lat,
        lon=centroid_lon,
        radius_km=radius_km,
        severity=severity,
        operator_summary=operator_summary
    )

    return Incident(
        incident_id=incident_id,
        title=title,
        disaster_type=disaster_type,
        district=district,
        lat=round(centroid_lat, 6),
        lon=round(centroid_lon, 6),
        radius_km=radius_km,
        report_ids=[r.report_id for r in member_reports],
        source_count=len(sources),
        confidence_score=confidence_pct,
        status="active",
        priority=priority,
        is_clustered=is_clustered,
        cluster_size=size,
        duplicate_of=None,
        duplicate_match_type=None,
        sources=sources,
        timestamp_first=ts_first,
        timestamp_last=ts_last,
        reasons=reasons,
        cap_xml=cap_xml,
        operator_summary=operator_summary,
        created_at=ts_first,
        updated_at=get_utc_now_iso(),
        member_reports=member_reports
    )

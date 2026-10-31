"""
Pydantic Models for NirikshakAI
Strictly compliant with SPEC.md and GroundTruth Ingest Agent schemas.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone


def get_utc_now_iso() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Source Metadata
# ---------------------------------------------------------------------------
class Source(BaseModel):
    platform: Literal[
        "sachet", "imd", "gdacs", "gdelt", "news", "bluesky", "youtube", "mock", "citizen"
    ] = Field(..., description="Platform or data source type")
    domain: str = Field(default="", description="Source domain e.g. imd.gov.in, bsky.app")
    account: str = Field(default="", description="Account handle or agency name")
    reputation: float = Field(default=0.5, ge=0.0, le=1.0, description="Source reliability score (0.0 to 1.0)")


# ---------------------------------------------------------------------------
# Claim Details
# ---------------------------------------------------------------------------
class Claim(BaseModel):
    hazard: Literal[
        "flood", "fire", "storm", "heatwave", "earthquake", "landslide", "unknown"
    ] = Field(default="unknown", description="Type of disaster hazard")
    text: str = Field(..., description="Raw post text or alert description")
    claimed_place: str = Field(default="", description="Location mentioned in the claim")
    claimed_time: str = Field(default_factory=get_utc_now_iso, description="ISO8601 timestamp of claimed occurrence")


# ---------------------------------------------------------------------------
# Media & Forensics Info
# ---------------------------------------------------------------------------
class ArchiveMatch(BaseModel):
    score: float = Field(default=0.0, ge=0.0, le=1.0, description="Similarity score against historical archives")
    matched_id: str = Field(default="", description="Archive report or news ID matched")
    matched_date: str = Field(default="", description="Date of historical matched incident")


class ExifGps(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None


class ExifData(BaseModel):
    gps: Optional[ExifGps] = None
    datetime: Optional[str] = None
    camera: Optional[str] = None


class MediaItem(BaseModel):
    url: str = Field(..., description="Image or video URL")
    phash: str = Field(default="", description="Perceptual hash string (hex)")
    archive_match: ArchiveMatch = Field(default_factory=ArchiveMatch)
    exif: ExifData = Field(default_factory=ExifData)


# ---------------------------------------------------------------------------
# Geographic Information
# ---------------------------------------------------------------------------
class GeoLocation(BaseModel):
    lat: Optional[float] = Field(default=None, description="Latitude (null if unverified)")
    lon: Optional[float] = Field(default=None, description="Longitude (null if unverified)")
    radius_km: float = Field(default=5.0, description="Uncertainty radius in kilometers")
    method: Literal[
        "text_geocode", "vlm_landmark", "exif", "official_polygon", "unresolved"
    ] = Field(default="unresolved", description="Method used to determine location")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Location certainty score")
    district: str = Field(default="", description="Indian administrative district name")


# ---------------------------------------------------------------------------
# Verification Checks (C1 - C5)
# ---------------------------------------------------------------------------
class OfficialCheck(BaseModel):
    c1_result: Literal["pass", "fail", "unknown"] = "unknown"
    alert_ids: List[str] = Field(default_factory=list)
    details: str = Field(default="")


class PhysicalCheck(BaseModel):
    c2_result: Literal["pass", "fail", "unknown"] = "unknown"
    rainfall_mm: float = Field(default=0.0)
    satellite_evidence: bool = Field(default=False)
    details: str = Field(default="")


class ProvenanceCheck(BaseModel):
    c3_result: Literal["pass", "fail", "unknown"] = "unknown"
    recycled: bool = Field(default=False)
    archive_match_score: float = Field(default=0.0)
    details: str = Field(default="")


class LocationCheck(BaseModel):
    c4_result: Literal["pass", "fail", "unknown"] = "unknown"
    contradictions: List[str] = Field(default_factory=list)
    details: str = Field(default="")


class CorroborationCheck(BaseModel):
    c5_result: Literal["pass", "fail", "unknown"] = "unknown"
    independent_sources: int = Field(default=0)
    details: str = Field(default="")


class Checks(BaseModel):
    official: OfficialCheck = Field(default_factory=OfficialCheck)
    physical: PhysicalCheck = Field(default_factory=PhysicalCheck)
    provenance: ProvenanceCheck = Field(default_factory=ProvenanceCheck)
    location: LocationCheck = Field(default_factory=LocationCheck)
    corroboration: CorroborationCheck = Field(default_factory=CorroborationCheck)


# ---------------------------------------------------------------------------
# Main DisasterReport Schema
# ---------------------------------------------------------------------------
class DisasterReport(BaseModel):
    report_id: str = Field(..., description="Unique identifier e.g. r_0192")
    source: Source
    claim: Claim
    media: List[MediaItem] = Field(default_factory=list)
    geo: GeoLocation = Field(default_factory=GeoLocation)
    checks: Checks = Field(default_factory=Checks)
    score: float = Field(default=0.0, ge=0.0, le=1.0, description="Verification confidence score")
    verdict: Literal["verified", "review", "rejected"] = Field(
        default="review", description="Three-lane operational verdict"
    )
    reasons: List[str] = Field(default_factory=list, description="Audit trail explaining score and verdict")
    created_at: str = Field(default_factory=get_utc_now_iso)
    updated_at: str = Field(default_factory=get_utc_now_iso)
    raw_source_data: Optional[Dict[str, Any]] = Field(default=None, description="Original un-normalized payload")


# ---------------------------------------------------------------------------
# Clustered Incident Schema (Output of Dedup / Dispatch)
# ---------------------------------------------------------------------------
class Incident(BaseModel):
    incident_id: str = Field(..., description="Unique cluster ID e.g. inc_punjab_flood_01")
    title: str = Field(..., description="Brief title of incident")
    disaster_type: str = Field(..., description="Primary hazard classification")
    district: str = Field(default="")
    lat: float
    lon: float
    radius_km: float = 5.0
    report_ids: List[str] = Field(default_factory=list)
    source_count: int = 1
    confidence_score: float = 0.0
    status: Literal["active", "contained", "archived"] = "active"
    priority: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "MEDIUM"
    is_clustered: bool = Field(default=False, description="True if formed from multiple clustered reports")
    cluster_size: int = Field(default=1, description="Number of reports in cluster")
    duplicate_of: Optional[str] = Field(default=None, description="Primary report ID if this was merged as duplicate")
    duplicate_match_type: Optional[str] = Field(default=None, description="exact | perceptual | semantic | None")
    sources: List[str] = Field(default_factory=list, description="Unique source platforms in this incident")
    timestamp_first: Optional[str] = Field(default=None, description="ISO timestamp of earliest report")
    timestamp_last: Optional[str] = Field(default=None, description="ISO timestamp of latest report")
    reasons: List[str] = Field(default_factory=list, description="Corroboration and clustering audit reasons")
    cap_xml: Optional[str] = Field(default=None, description="Drafted CAP 1.2 XML alert")
    operator_summary: str = Field(default="")
    created_at: str = Field(default_factory=get_utc_now_iso)
    updated_at: str = Field(default_factory=get_utc_now_iso)
    member_reports: Optional[List[DisasterReport]] = Field(default=None, description="Full DisasterReport objects when queried")


class DedupStats(BaseModel):
    total_processed: int
    exact_duplicates: int
    perceptual_duplicates: int
    semantic_duplicates: int
    total_duplicates: int
    unique_incidents: int
    clustered_incidents: int
    single_report_incidents: int


class DedupResponse(BaseModel):
    status: str
    processed_count: int
    unique_count: int
    duplicate_count: int
    incident_count: int
    stats: DedupStats
    incidents: List[Incident]


# ---------------------------------------------------------------------------
# API Request / Response Models
# ---------------------------------------------------------------------------
class IngestRequest(BaseModel):
    reports: List[DisasterReport] = Field(..., description="List of reports to ingest")


class IngestResponse(BaseModel):
    status: str
    ingested_count: int
    duplicates_filtered: int
    rejected_count: int
    report_ids: List[str]
    message: str


class TriggerIngestRequest(BaseModel):
    sources: List[str] = Field(
        default=["sachet", "imd", "gdelt", "openmeteo", "mock"],
        description="Sources to poll: sachet, imd, gdacs, gdelt, openmeteo, bluesky, youtube, mock"
    )
    mock_count: int = Field(default=25, ge=1, le=250, description="Mock reports to generate if 'mock' in sources")
    state_or_district: str = Field(default="Punjab", description="State or district to focus ingestion on")


class IngestStats(BaseModel):
    total_reports: int
    verified_reports: int
    review_reports: int
    rejected_reports: int
    total_incidents: int
    by_source: Dict[str, int]
    by_hazard: Dict[str, int]
    average_score: float
    last_ingestion_time: Optional[str]

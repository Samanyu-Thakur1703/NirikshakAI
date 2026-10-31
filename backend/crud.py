"""
CRUD operations for NirikshakAI reports, incidents, and logs.
"""

import json
from typing import List, Optional, Tuple, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.database import ReportDB, IncidentDB, IngestionLogDB
from backend.models import DisasterReport, Incident, IngestStats


def upsert_report(db: Session, report: DisasterReport) -> Tuple[ReportDB, bool]:
    """
    Insert or update a DisasterReport.
    Returns (db_record, is_new: bool).
    """
    report_dict = report.model_dump()
    full_json = json.dumps(report_dict, ensure_ascii=False)

    existing = db.query(ReportDB).filter(ReportDB.report_id == report.report_id).first()
    if existing:
        existing.platform = report.source.platform
        existing.domain = report.source.domain
        existing.hazard = report.claim.hazard
        existing.claimed_place = report.claim.claimed_place
        existing.claimed_time = report.claim.claimed_time
        existing.text = report.claim.text
        existing.lat = report.geo.lat
        existing.lon = report.geo.lon
        existing.district = report.geo.district
        existing.score = report.score
        existing.verdict = report.verdict
        existing.full_data = full_json
        existing.updated_at = report.updated_at
        db.commit()
        db.refresh(existing)
        return existing, False
    else:
        new_record = ReportDB(
            report_id=report.report_id,
            platform=report.source.platform,
            domain=report.source.domain,
            hazard=report.claim.hazard,
            claimed_place=report.claim.claimed_place,
            claimed_time=report.claim.claimed_time,
            text=report.claim.text,
            lat=report.geo.lat,
            lon=report.geo.lon,
            district=report.geo.district,
            score=report.score,
            verdict=report.verdict,
            full_data=full_json,
            created_at=report.created_at,
            updated_at=report.updated_at,
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record, True


def bulk_upsert_reports(db: Session, reports: List[DisasterReport]) -> Tuple[int, int]:
    """
    Bulk insert or update reports.
    Returns (created_count, updated_count).
    """
    created = 0
    updated = 0
    for r in reports:
        _, is_new = upsert_report(db, r)
        if is_new:
            created += 1
        else:
            updated += 1
    return created, updated


def get_report_by_id(db: Session, report_id: str) -> Optional[DisasterReport]:
    """Retrieve single DisasterReport by ID."""
    row = db.query(ReportDB).filter(ReportDB.report_id == report_id).first()
    if not row:
        return None
    data = json.loads(row.full_data)
    return DisasterReport(**data)


def list_reports(
    db: Session,
    verdict: Optional[str] = None,
    hazard: Optional[str] = None,
    district: Optional[str] = None,
    platform: Optional[str] = None,
    min_score: Optional[float] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[DisasterReport]:
    """Query list of DisasterReports with optional filters."""
    query = db.query(ReportDB)

    if verdict and isinstance(verdict, str):
        query = query.filter(ReportDB.verdict == verdict.lower())
    if hazard and isinstance(hazard, str):
        query = query.filter(ReportDB.hazard == hazard.lower())
    if district and isinstance(district, str):
        query = query.filter(ReportDB.district.ilike(f"%{district}%"))
    if platform and isinstance(platform, str):
        query = query.filter(ReportDB.platform == platform.lower())
    if min_score is not None and isinstance(min_score, (int, float)):
        query = query.filter(ReportDB.score >= min_score)

    try:
        limit_val = int(limit)
    except Exception:
        limit_val = 100
    try:
        offset_val = int(offset)
    except Exception:
        offset_val = 0

    query = query.order_by(desc(ReportDB.created_at)).offset(offset_val).limit(limit_val)
    rows = query.all()

    results = []
    for r in rows:
        try:
            data = json.loads(r.full_data)
            results.append(DisasterReport(**data))
        except Exception:
            continue
    return results


def count_reports(db: Session, verdict: Optional[str] = None, hazard: Optional[str] = None) -> int:
    """Count reports matching criteria."""
    query = db.query(func.count(ReportDB.report_id))
    if verdict:
        query = query.filter(ReportDB.verdict == verdict.lower())
    if hazard:
        query = query.filter(ReportDB.hazard == hazard.lower())
    return query.scalar() or 0


def upsert_incident(db: Session, incident: Incident) -> IncidentDB:
    """Insert or update an Incident."""
    incident_dict = incident.model_dump()
    full_json = json.dumps(incident_dict, ensure_ascii=False)

    existing = db.query(IncidentDB).filter(IncidentDB.incident_id == incident.incident_id).first()
    if existing:
        existing.title = incident.title
        existing.disaster_type = incident.disaster_type
        existing.district = incident.district
        existing.lat = incident.lat
        existing.lon = incident.lon
        existing.source_count = incident.source_count
        existing.confidence_score = incident.confidence_score
        existing.priority = incident.priority
        existing.status = incident.status
        existing.full_data = full_json
        existing.updated_at = incident.updated_at
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_inc = IncidentDB(
            incident_id=incident.incident_id,
            title=incident.title,
            disaster_type=incident.disaster_type,
            district=incident.district,
            lat=incident.lat,
            lon=incident.lon,
            source_count=incident.source_count,
            confidence_score=incident.confidence_score,
            priority=incident.priority,
            status=incident.status,
            full_data=full_json,
            created_at=incident.created_at,
            updated_at=incident.updated_at,
        )
        db.add(new_inc)
        db.commit()
        db.refresh(new_inc)
        return new_inc


def list_incidents(db: Session, status: Optional[str] = None, limit: int = 100) -> List[Incident]:
    """Retrieve all clustered incidents."""
    query = db.query(IncidentDB)
    if status and isinstance(status, str):
        query = query.filter(IncidentDB.status == status.lower())
    try:
        limit_val = int(limit)
    except Exception:
        limit_val = 100
    query = query.order_by(desc(IncidentDB.updated_at)).limit(limit_val)
    rows = query.all()

    incidents = []
    for r in rows:
        try:
            data = json.loads(r.full_data)
            incidents.append(Incident(**data))
        except Exception:
            continue
    return incidents


def get_incident_by_id(db: Session, incident_id: str) -> Optional[Incident]:
    """Retrieve single incident by ID."""
    row = db.query(IncidentDB).filter(IncidentDB.incident_id == incident_id).first()
    if not row:
        return None
    data = json.loads(row.full_data)
    return Incident(**data)


def log_ingestion(
    db: Session, source: str, fetched: int, ingested: int, status: str = "success", error_message: Optional[str] = None
):
    """Record an ingestion log entry."""
    entry = IngestionLogDB(
        source=source,
        fetched_count=fetched,
        ingested_count=ingested,
        status=status,
        error_message=error_message,
    )
    db.add(entry)
    db.commit()


def get_ingest_stats(db: Session) -> IngestStats:
    """Calculate aggregated stats across all reports."""
    total = db.query(func.count(ReportDB.report_id)).scalar() or 0
    verified = db.query(func.count(ReportDB.report_id)).filter(ReportDB.verdict == "verified").scalar() or 0
    review = db.query(func.count(ReportDB.report_id)).filter(ReportDB.verdict == "review").scalar() or 0
    rejected = db.query(func.count(ReportDB.report_id)).filter(ReportDB.verdict == "rejected").scalar() or 0
    incidents_count = db.query(func.count(IncidentDB.incident_id)).scalar() or 0

    # Count by platform
    platform_rows = db.query(ReportDB.platform, func.count(ReportDB.report_id)).group_by(ReportDB.platform).all()
    by_source = {p: count for p, count in platform_rows}

    # Count by hazard
    hazard_rows = db.query(ReportDB.hazard, func.count(ReportDB.report_id)).group_by(ReportDB.hazard).all()
    by_hazard = {h: count for h, count in hazard_rows}

    # Average score
    avg_score_val = db.query(func.avg(ReportDB.score)).scalar() or 0.0

    # Last ingestion
    last_log = db.query(IngestionLogDB).order_by(desc(IngestionLogDB.timestamp)).first()
    last_time = last_log.timestamp if last_log else None

    return IngestStats(
        total_reports=total,
        verified_reports=verified,
        review_reports=review,
        rejected_reports=rejected,
        total_incidents=incidents_count,
        by_source=by_source,
        by_hazard=by_hazard,
        average_score=round(float(avg_score_val), 3),
        last_ingestion_time=last_time,
    )

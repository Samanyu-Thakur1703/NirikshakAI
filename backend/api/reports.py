"""
FastAPI Endpoints for Disaster Reports Ingestion, Filtering, and Retrieval.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import asyncio

from backend.database import get_db
from backend.models import (
    DisasterReport, IngestRequest, IngestResponse, TriggerIngestRequest
)
from backend.crud import (
    upsert_report, get_report_by_id, list_reports,
    count_reports, log_ingestion
)
from backend.ingestion import (
    normalize_report, classify_relevance, is_relevant,
    fetch_sachet_alerts, fetch_imd_alerts, fetch_gdacs_alerts,
    fetch_gdelt_news, fetch_bluesky_posts, fetch_youtube_disaster_videos,
    get_mock_reports
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=List[DisasterReport])
def get_reports(
    verdict: Optional[str] = Query(None, description="Filter by lane: verified | review | rejected"),
    hazard: Optional[str] = Query(None, description="Filter by hazard: flood | storm | landslide | fire | earthquake | heatwave"),
    district: Optional[str] = Query(None, description="Filter by district name substring"),
    platform: Optional[str] = Query(None, description="Filter by platform: sachet | imd | gdelt | bluesky | mock"),
    min_score: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum verification score"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieve list of normalized disaster reports with flexible query filtering.
    """
    return list_reports(
        db=db,
        verdict=verdict,
        hazard=hazard,
        district=district,
        platform=platform,
        min_score=min_score,
        limit=limit,
        offset=offset
    )


@router.get("/{report_id}", response_model=DisasterReport)
def get_single_report(report_id: str, db: Session = Depends(get_db)):
    """Retrieve details and audit checks for a single report by ID."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id '{report_id}' not found"
        )
    return report


@router.post("/ingest", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def ingest_single_report(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Ingest a single raw or pre-structured report.
    Applies relevance filtering (relevance_score > 0.7) and normalizes into DisasterReport schema.
    """
    platform = payload.get("source", {}).get("platform") if isinstance(payload.get("source"), dict) else payload.get("platform", "citizen")
    text = payload.get("claim", {}).get("text") if isinstance(payload.get("claim"), dict) else payload.get("text", "")
    domain = payload.get("source", {}).get("domain") if isinstance(payload.get("source"), dict) else payload.get("domain", "")
    image_url = payload.get("image_url") or (payload.get("media", [{}])[0].get("url") if payload.get("media") else None)

    # Calculate relevance
    relevance = classify_relevance(text=text, image_url=image_url, platform=platform, domain=domain)

    # Decision rule: filter reports with relevance <= 0.7 unless it is an official alert
    if platform not in ("sachet", "imd", "gdacs") and not is_relevant(relevance):
        return {
            "status": "filtered",
            "report_id": None,
            "relevance_score": relevance,
            "message": "Report discarded: relevance_score does not exceed 0.7 threshold"
        }

    # Normalize into standard DisasterReport schema
    report = normalize_report(payload, source_platform=platform)
    db_record, is_new = upsert_report(db, report)

    return {
        "status": "ingested",
        "is_new": is_new,
        "report_id": report.report_id,
        "relevance_score": relevance,
        "verdict": report.verdict,
        "score": report.score
    }


@router.post("/batch-ingest", response_model=IngestResponse)
def batch_ingest_reports(request: IngestRequest, db: Session = Depends(get_db)):
    """
    Ingest a batch of already-normalized DisasterReport objects.
    """
    ingested_ids = []
    rejected_count = 0

    for rep in request.reports:
        _, is_new = upsert_report(db, rep)
        ingested_ids.append(rep.report_id)
        if rep.verdict == "rejected":
            rejected_count += 1

    log_ingestion(
        db,
        source="batch_api",
        fetched=len(request.reports),
        ingested=len(ingested_ids),
        status="success"
    )

    return IngestResponse(
        status="success",
        ingested_count=len(ingested_ids),
        duplicates_filtered=0,
        rejected_count=rejected_count,
        report_ids=ingested_ids,
        message=f"Successfully ingested {len(ingested_ids)} reports into database"
    )


@router.post("/trigger", response_model=Dict[str, Any])
async def trigger_live_ingestion(
    request: TriggerIngestRequest = TriggerIngestRequest(),
    db: Session = Depends(get_db)
):
    """
    Trigger real-time polling across official, physical, news, social, and mock sources.
    Normalizes and ingests all emitted signals.
    """
    collected_raw: List[Dict[str, Any]] = []
    source_stats = {}

    tasks = []
    selected_sources = [s.lower() for s in request.sources]

    # 1. Official Sources
    if "sachet" in selected_sources:
        tasks.append(("sachet", fetch_sachet_alerts(state=request.state_or_district)))
    if "imd" in selected_sources:
        tasks.append(("imd", fetch_imd_alerts(district=request.state_or_district)))
    if "gdacs" in selected_sources:
        tasks.append(("gdacs", fetch_gdacs_alerts(country="India")))

    # 2. News Sources
    if "gdelt" in selected_sources:
        tasks.append(("gdelt", fetch_gdelt_news()))

    # 3. Social Sources
    if "bluesky" in selected_sources:
        tasks.append(("bluesky", fetch_bluesky_posts()))
    if "youtube" in selected_sources:
        tasks.append(("youtube", fetch_youtube_disaster_videos()))

    # Run network/cached source fetchers concurrently
    if tasks:
        results = await asyncio.gather(*(t[1] for t in tasks), return_exceptions=True)
        for i, (source_name, _) in enumerate(tasks):
            res = results[i]
            if isinstance(res, Exception):
                source_stats[source_name] = {"status": "error", "error": str(res), "count": 0}
            elif isinstance(res, list):
                source_stats[source_name] = {"status": "success", "count": len(res)}
                for item in res:
                    item["_source_tag"] = source_name
                    collected_raw.append(item)

    # 4. Mock Generator fallback
    if "mock" in selected_sources:
        mock_items = get_mock_reports()[:request.mock_count]
        for m in mock_items:
            m["_source_tag"] = m.get("platform", "mock")
            collected_raw.append(m)
        source_stats["mock"] = {"status": "success", "count": len(mock_items)}

    # Normalize, filter and insert into database
    ingested_reports = []
    discarded_count = 0

    for item in collected_raw:
        source_platform = item.get("_source_tag", item.get("platform", "mock"))
        text = item.get("text") or item.get("description") or item.get("title") or ""
        
        # Relevance gate
        rel = classify_relevance(text=text, platform=source_platform)
        if source_platform not in ("sachet", "imd", "gdacs") and not is_relevant(rel):
            discarded_count += 1
            continue

        normalized = normalize_report(item, source_platform=source_platform)
        upsert_report(db, normalized)
        ingested_reports.append(normalized.report_id)

    # Log ingestion run
    log_ingestion(
        db,
        source=",".join(selected_sources),
        fetched=len(collected_raw),
        ingested=len(ingested_reports),
        status="success"
    )

    return {
        "status": "completed",
        "total_fetched": len(collected_raw),
        "total_ingested": len(ingested_reports),
        "total_discarded": discarded_count,
        "sources": source_stats,
        "sample_report_ids": ingested_reports[:10]
    }

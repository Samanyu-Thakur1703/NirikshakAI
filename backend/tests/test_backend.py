"""
Self-contained Unit and Integration Tests for NirikshakAI Backend and Ingest Agent.
Tests database, CRUD, normalizer, relevance filter, mock generator, and API route handlers.
"""

import json
from backend.database import init_db, SessionLocal
from backend.models import DisasterReport, TriggerIngestRequest
from backend.crud import (
    upsert_report, get_report_by_id, list_reports,
    count_reports, get_ingest_stats, list_incidents
)
from backend.ingestion import (
    normalize_report, classify_relevance, is_relevant, detect_hazard,
    get_mock_reports, generate_mock_reports
)
from backend.api.reports import (
    get_reports, get_single_report, ingest_single_report, trigger_live_ingestion
)
from backend.api.incidents import get_incidents
from backend.api.stats import get_stats, health_check
from backend.main import lifespan, app


def run_all_tests():
    print("--- 1. Testing Database & Schema Initialization ---")
    init_db()
    db = SessionLocal()
    try:
        report_count = count_reports(db)
        print(f"Initial report count: {report_count}")

        print("--- 2. Testing Relevance Filter & Hazard Classifier ---")
        disaster_text = "Severe flash flood and waterlogging in Mohali Sector 62! Buses submerged, NDRF called."
        noise_text = "Watch this new movie trailer! 50% discount sale on cricket shoes."

        hazard = detect_hazard(disaster_text)
        assert hazard == "flood", f"Expected flood, got {hazard}"
        print(f"Hazard detection: '{hazard}' -> PASS")

        disaster_rel = classify_relevance(disaster_text, platform="citizen")
        noise_rel = classify_relevance(noise_text, platform="citizen")
        print(f"Disaster relevance: {disaster_rel}, Noise relevance: {noise_rel}")
        assert is_relevant(disaster_rel), f"Disaster text should be relevant: {disaster_rel}"
        assert not is_relevant(noise_rel), f"Noise text should be filtered: {noise_rel}"
        print("Relevance gate -> PASS")

        print("--- 3. Testing Normalizer ---")
        raw_sample = {
            "platform": "sachet",
            "text": "NDMA Warning: Extreme rainfall over SAS Nagar Mohali",
            "claimed_place": "Mohali, Punjab",
            "lat": 30.7046,
            "lon": 76.7179,
            "media": [{"url": "https://example.com/test.jpg"}]
        }
        normalized = normalize_report(raw_sample, source_platform="sachet")
        assert normalized.report_id.startswith("r_"), "Report ID should start with r_"
        assert normalized.claim.hazard in ("flood", "storm"), f"Unexpected hazard: {normalized.claim.hazard}"
        assert normalized.source.platform == "sachet"
        assert normalized.geo.lat == 30.7046
        assert len(normalized.media) == 1
        print("Normalizer -> PASS")

        print("--- 4. Testing Mock Generator (250 reports) ---")
        mock_reports = generate_mock_reports(250)
        assert len(mock_reports) == 250, f"Expected 250 reports, got {len(mock_reports)}"
        
        # Verify lane distribution
        verdicts = [r["verdict"] for r in mock_reports]
        verified_cnt = verdicts.count("verified")
        review_cnt = verdicts.count("review")
        rejected_cnt = verdicts.count("rejected")
        print(f"Generated 250 reports: Verified={verified_cnt}, Review={review_cnt}, Rejected={rejected_cnt}")
        assert verified_cnt > 0 and review_cnt > 0 and rejected_cnt > 0
        print("Mock generator distribution -> PASS")

        print("--- 5. Testing Seeding and CRUD Operations ---")
        for m in mock_reports[:60]:
            r_obj = DisasterReport(**m)
            upsert_report(db, r_obj)

        total_in_db = count_reports(db)
        assert total_in_db >= 60, f"Expected >= 60 in db, got {total_in_db}"
        print(f"Total reports in database after seeding: {total_in_db}")

        verified_list = list_reports(db, verdict="verified", limit=10)
        assert len(verified_list) > 0
        assert all(r.verdict == "verified" for r in verified_list)
        print(f"Filtered verified reports count: {len(verified_list)} -> PASS")

        rejected_list = list_reports(db, verdict="rejected", limit=10)
        assert len(rejected_list) > 0
        assert all(r.verdict == "rejected" for r in rejected_list)
        print(f"Filtered rejected reports count: {len(rejected_list)} -> PASS")

        single_rep = get_report_by_id(db, verified_list[0].report_id)
        assert single_rep is not None
        assert len(single_rep.reasons) > 0
        print(f"Retrieved report {single_rep.report_id} with reasons: {single_rep.reasons[0]} -> PASS")

        print("--- 6. Testing API Route Handlers Directly ---")
        health = health_check()
        assert health["status"] == "healthy"
        print("Health Check API -> PASS")

        stats = get_stats(db)
        assert stats.total_reports >= 60
        assert stats.verified_reports > 0
        assert stats.rejected_reports > 0
        print(f"Stats API: Total={stats.total_reports}, Verified={stats.verified_reports}, Rejected={stats.rejected_reports}, AvgScore={stats.average_score} -> PASS")

        # Test single ingest API
        ingest_res = ingest_single_report(
            payload={
                "platform": "citizen",
                "text": "Huge waterlogging on Airport Road Mohali! Vehicles stranded, traffic at standstill.",
                "claimed_place": "Mohali, Punjab",
                "lat": 30.7046,
                "lon": 76.7179,
                "image_url": "https://images.unsplash.com/photo-1547683905"
            },
            db=db
        )
        assert ingest_res["status"] == "ingested"
        print(f"Ingest API output: {ingest_res} -> PASS")

        # Test noise filter via API
        noise_res = ingest_single_report(
            payload={
                "platform": "citizen",
                "text": "Discount sale on cricket bats! Buy 1 get 1 free shopping weekend.",
                "claimed_place": "Delhi",
                "lat": 28.6139,
                "lon": 77.2090
            },
            db=db
        )
        assert noise_res["status"] == "filtered"
        print(f"Noise rejection API output: {noise_res} -> PASS")

        print("\n========================================================")
        print(" ALL NIRIKSHAKAI BACKEND TESTS COMPLETED SUCCESSFULLY! ")
        print("========================================================")
    finally:
        db.close()


if __name__ == "__main__":
    run_all_tests()

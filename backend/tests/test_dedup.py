"""
Integration and Unit Tests for NirikshakAI Dedup Agent (Agent 2 of 7).
Tests 3-tier duplicate detection (exact, perceptual, semantic), DBSCAN clustering, and incident merging.
"""

from backend.database import init_db, SessionLocal
from backend.models import DisasterReport, Incident
from backend.crud import upsert_report, list_reports, list_incidents
from backend.verification.duplicate_detector import (
    DuplicateDetector, compute_md5, hamming_distance
)
from backend.verification.clusterer import (
    cluster_reports, haversine_distance_km
)
from backend.verification.incident_merger import build_incident_from_cluster
from agents.dedup_agent import DedupAgent, get_dedup_agent
from backend.api.incidents import (
    trigger_deduplication, get_clustered_incidents,
    get_all_incidents, get_single_incident, get_dedup_stats
)


def test_tier1_exact_match():
    print("--- 1. Testing Tier 1: Exact Match (MD5) ---")
    detector = DuplicateDetector()
    detector.exact_db.clear()

    # Case A: Same Image URL
    img_url = "https://images.unsplash.com/photo-1547683905-exact-test"
    res1 = detector.exact_match("r_orig_1", image_url=img_url)
    assert not res1["is_duplicate"]

    res2 = detector.exact_match("r_dup_1", image_url=img_url)
    assert res2["is_duplicate"]
    assert res2["match_id"] == "r_orig_1"
    assert res2["match_type"] == "exact"
    print("Exact image URL duplicate caught -> PASS")

    # Case B: Identical Text
    txt = "Severe flood water entering homes in Sector 62 Mohali! Need immediate evacuation."
    res3 = detector.exact_match("r_orig_2", text=txt)
    assert not res3["is_duplicate"]

    res4 = detector.exact_match("r_dup_2", text=txt)
    assert res4["is_duplicate"]
    assert res4["match_id"] == "r_orig_2"
    assert res4["match_type"] == "exact"
    print("Exact text duplicate caught -> PASS")


def test_tier2_perceptual_match():
    print("--- 2. Testing Tier 2: Perceptual Hash (Hamming distance) ---")
    detector = DuplicateDetector()
    detector.phash_db.clear()

    base_phash = "a7b3c2d1e0f98877"
    # Create near-duplicate with 3 bit differences (Hamming distance = 3 <= 8)
    # 'a' (1010) vs 'b' (1011) has 1 bit difference
    near_phash = "b7b3c2d1e0f98877"
    dist = hamming_distance(base_phash, near_phash)
    assert dist <= 8, f"Expected distance <= 8, got {dist}"

    res1 = detector.perceptual_match("r_p_orig", phash_str=base_phash)
    assert not res1["is_duplicate"]

    res2 = detector.perceptual_match("r_p_dup", phash_str=near_phash)
    assert res2["is_duplicate"]
    assert res2["match_id"] == "r_p_orig"
    assert res2["match_type"] == "perceptual"
    assert res2["distance"] <= 8
    print(f"Perceptual duplicate caught (Hamming distance = {res2['distance']}) -> PASS")


def test_tier3_semantic_match():
    print("--- 3. Testing Tier 3: Semantic Similarity ---")
    detector = DuplicateDetector()
    detector.semantic_db.clear()

    txt1 = "Heavy continuous downpour inundated low lying areas of Mohali phase 7, roads completely blocked."
    txt2 = "Incessant heavy rainfall inundated low lying areas in Mohali phase 7, roads blocked completely."

    res1 = detector.semantic_match("r_sem_1", text=txt1)
    assert not res1["is_duplicate"]

    res2 = detector.semantic_match("r_sem_2", text=txt2)
    assert res2["is_duplicate"] or res2.get("flag_review")
    print(f"Semantic similarity match: {res2} -> PASS")


def test_dbscan_clustering():
    print("--- 4. Testing Spatio-Temporal DBSCAN Clustering ---")
    # Hotspot 1: Mohali Sector 62 (within 1-2km of each other, same time)
    mohali_1 = {
        "report_id": "rep_m1",
        "geo": {"lat": 30.7046, "lon": 76.7179},
        "claim": {"hazard": "flood", "claimed_time": "2026-10-31T08:00:00Z"}
    }
    mohali_2 = {
        "report_id": "rep_m2",
        "geo": {"lat": 30.7080, "lon": 76.7210},  # ~0.5 km away
        "claim": {"hazard": "flood", "claimed_time": "2026-10-31T08:15:00Z"}  # 15 min later
    }
    mohali_3 = {
        "report_id": "rep_m3",
        "geo": {"lat": 30.7020, "lon": 76.7150},  # ~0.4 km away
        "claim": {"hazard": "flood", "claimed_time": "2026-10-31T08:20:00Z"}  # 20 min later
    }

    # Hotspot 2: Chennai Velachery (1700km away)
    chennai_1 = {
        "report_id": "rep_c1",
        "geo": {"lat": 13.0827, "lon": 80.2707},
        "claim": {"hazard": "flood", "claimed_time": "2026-10-31T08:00:00Z"}
    }

    cluster_res = cluster_reports([mohali_1, mohali_2, mohali_3, chennai_1], eps_km=5.0, time_window_min=45)
    clusters = cluster_res["clusters"]
    outliers = cluster_res["outliers"]

    assert len(clusters) == 1, f"Expected 1 Mohali cluster, got {len(clusters)}"
    assert len(clusters[0]) == 3, f"Expected 3 reports in Mohali cluster, got {len(clusters[0])}"
    assert "rep_c1" in outliers, "Chennai report should be an outlier"
    print(f"DBSCAN correctly formed 1 cluster of 3 Mohali reports and 1 outlier -> PASS")


def test_incident_merging():
    print("--- 5. Testing Incident Merging & CAP 1.2 XML Generation ---")
    db = SessionLocal()
    try:
        # Fetch 3 existing reports
        all_reps = list_reports(db, limit=10)
        reps_map = {r.report_id: r for r in all_reps}
        cluster_ids = [r.report_id for r in all_reps[:3]]

        incident = build_incident_from_cluster(cluster_ids, reps_map, incident_index=99)
        assert incident.incident_id == "INC-099"
        assert incident.is_clustered == True
        assert incident.cluster_size == 3
        assert incident.confidence_score > 0
        assert incident.cap_xml is not None
        assert "<alert" in incident.cap_xml
        assert "<circle>" in incident.cap_xml
        assert incident.radius_km >= 1.0
        print(f"Built Incident {incident.incident_id} with CAP 1.2 XML, radius {incident.radius_km}km, confidence {incident.confidence_score}% -> PASS")
    finally:
        db.close()


def test_api_dedup_workflow():
    print("--- 6. Testing Dedup API & Controller Endpoints ---")
    db = SessionLocal()
    try:
        dedup_response = trigger_deduplication(eps_km=5.0, time_window_min=45, limit=50, db=db)
        assert dedup_response.status == "success"
        assert dedup_response.processed_count > 0
        assert dedup_response.incident_count > 0
        print(f"Trigger Dedup API: Processed={dedup_response.processed_count}, Unique={dedup_response.unique_count}, Duplicates={dedup_response.duplicate_count}, Incidents={dedup_response.incident_count} -> PASS")

        all_incidents = get_all_incidents(db=db)
        assert len(all_incidents) > 0
        print(f"GET /incidents: Retrieved {len(all_incidents)} incidents -> PASS")

        clustered_incidents = get_clustered_incidents(db=db)
        print(f"GET /incidents/clusters: Retrieved {len(clustered_incidents)} clustered incidents -> PASS")

        stats = get_dedup_stats(db=db)
        assert stats.unique_incidents > 0
        print(f"GET /stats/dedup: Unique={stats.unique_incidents}, Exact={stats.exact_duplicates}, Clustered={stats.clustered_incidents} -> PASS")

        # Test single incident retrieval with member reports
        first_inc = all_incidents[0]
        detailed_inc = get_single_incident(first_inc.incident_id, db=db)
        assert detailed_inc.incident_id == first_inc.incident_id
        assert detailed_inc.member_reports is not None
        assert len(detailed_inc.member_reports) > 0
        print(f"GET /incidents/{first_inc.incident_id}: Member reports count={len(detailed_inc.member_reports)} -> PASS")

    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    test_tier1_exact_match()
    test_tier2_perceptual_match()
    test_tier3_semantic_match()
    test_dbscan_clustering()
    test_incident_merging()
    test_api_dedup_workflow()
    print("\n========================================================")
    print(" ALL NIRIKSHAKAI DEDUP AGENT TESTS PASSED SUCCESSFULLY! ")
    print("========================================================")

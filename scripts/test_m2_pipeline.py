"""Quick test of the existing M2 pipeline to find real gaps."""
import sys
sys.path.insert(0, "F:/CGC/disasterwatch-ai")

print("=== Testing imports ===")
try:
    from backend.verification.forensics_agent import CLIPArchive, compute_phash, compute_clip_embedding
    print("OK: forensics_agent imports")
except Exception as e:
    print(f"FAIL: forensics_agent: {e}")

try:
    from backend.verification.forensics import check_media
    print("OK: forensics wrapper imports")
except Exception as e:
    print(f"FAIL: forensics wrapper: {e}")

try:
    from backend.geo.geocoder import assign_district, geocode_place
    print("OK: geocoder imports")
except Exception as e:
    print(f"FAIL: geocoder: {e}")

try:
    from backend.verification.duplicate_detector import DuplicateDetector
    print("OK: duplicate_detector imports")
except Exception as e:
    print(f"FAIL: duplicate_detector: {e}")

try:
    from agents.orchestrator import run_pipeline
    print("OK: orchestrator imports")
except Exception as e:
    print(f"FAIL: orchestrator: {e}")

try:
    from backend.ingestion.normalizer import normalize_report
    print("OK: normalizer imports")
except Exception as e:
    print(f"FAIL: normalizer: {e}")

print("\n=== Testing CLIPArchive init ===")
try:
    archive = CLIPArchive()
    print(f"Model: {archive.model}")
    print(f"Index: {archive.index}")
    print(f"Metadata count: {len(archive.metadata)}")
except Exception as e:
    print(f"FAIL: CLIPArchive init: {e}")

print("\n=== Testing pHash on MEDIC image ===")
try:
    from pathlib import Path
    test_img = Path("F:/CGC/disasterwatch-ai/data/medic_subset/medic_0000_ASONAM2017.jpg")
    if test_img.exists():
        phash = compute_phash(str(test_img))
        print(f"pHash: {phash}")
    else:
        print("MEDIC image not found")
except Exception as e:
    print(f"FAIL: pHash: {e}")

print("\n=== Testing assign_district ===")
try:
    result = assign_district(13.0827, 80.2707)
    print(f"Chennai district: {result}")
    result2 = assign_district(30.7046, 76.7179)
    print(f"Mohali district: {result2}")
except Exception as e:
    print(f"FAIL: assign_district: {e}")

print("\n=== Testing duplicate_detector ===")
try:
    det = DuplicateDetector()
    print(f"Exact DB: {len(det.exact_db)} entries")
    print(f"pHash DB: {len(det.phash_db)} entries")
    print(f"Semantic DB: {len(det.semantic_db)} entries")
except Exception as e:
    print(f"FAIL: DuplicateDetector: {e}")

print("\n=== Testing normalizer ===")
try:
    raw = {"text": "Flash flood in Chennai", "platform": "mock"}
    report = normalize_report(raw, source_platform="mock")
    print(f"Normalized report_id: {report.report_id}")
    print(f"Verdict: {report.verdict}")
    print(f"Score: {report.score}")
except Exception as e:
    print(f"FAIL: normalizer: {e}")

print("\n=== Done ===")

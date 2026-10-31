"""
Mock Report Generator for NirikshakAI.
Generates 250 diverse, schema-compliant, realistic Indian disaster reports for demo guarantees.
Includes realistic distributions across Verified, Under Review, and Rejected lanes.
"""

import json
import random
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

from backend.models import DisasterReport
from backend.ingestion.normalizer import normalize_report

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
MOCK_FILE_PATH = DATA_DIR / "mock_reports.json"

HOTSPOTS = [
    {
        "city": "Mohali",
        "district": "SAS Nagar (Mohali)",
        "state": "Punjab",
        "lat": 30.7046,
        "lon": 76.7179,
        "landmarks": ["Phase 8 Industrial Area", "Sector 62", "Sector 70", "Sohana", "Kharar Road", "Airport Road"]
    },
    {
        "city": "Chandigarh",
        "district": "Chandigarh",
        "state": "Chandigarh",
        "lat": 30.7333,
        "lon": 76.7794,
        "landmarks": ["Sector 17 Plaza", "Sukhna Lake", "Sector 35 Roundabout", "Tribune Chowk", "PGI Chandigarh"]
    },
    {
        "city": "Chennai",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "lat": 13.0827,
        "lon": 80.2707,
        "landmarks": ["Velachery Bypass", "Tambaram Flyover", "Marina Beach Promenade", "Madipakkam", "Kotturpuram Bridge"]
    },
    {
        "city": "Guwahati",
        "district": "Kamrup Metropolitan",
        "state": "Assam",
        "lat": 26.1445,
        "lon": 91.7362,
        "landmarks": ["Brahmaputra Riverside", "GS Road", "Zoo Road Tiniali", "Jalukbari Chowk", "Maligaon"]
    },
    {
        "city": "Mumbai",
        "district": "Mumbai Suburban",
        "state": "Maharashtra",
        "lat": 19.0760,
        "lon": 72.8777,
        "landmarks": ["Hindmata Cinema", "Milan Subway", "Andheri Subway", "Kurla West Station", "Sion Circle"]
    },
    {
        "city": "Solan",
        "district": "Solan",
        "state": "Himachal Pradesh",
        "lat": 30.9045,
        "lon": 77.0967,
        "landmarks": ["NH-5 Bypass", "Jabli Rockfall Zone", "Kumarhatti", "Chambaghat", "Dharampur"]
    },
    {
        "city": "Bengaluru",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "lat": 12.9716,
        "lon": 77.5946,
        "landmarks": ["Silk Board Junction", "Outer Ring Road Bellandur", "Ecospace tech park", "Electronic City flyover"]
    },
    {
        "city": "Wayanad",
        "district": "Wayanad",
        "state": "Kerala",
        "lat": 11.6854,
        "lon": 76.1320,
        "landmarks": ["Chooralmala", "Meppadi Bridge", "Mundakkai tea estate", "Vythiri ghat"]
    }
]

IMAGE_URLS = [
    "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
]

FLOOD_TEMPLATES = [
    "Severe waterlogging at {landmark}, {city}. Water levels reaching 3 feet, traffic completely stopped.",
    "Buses and cars submerged near {landmark}. Drainage overflow reported. Urgent NDRF rescue needed.",
    "Ground report: Incessant rain causing flood-like situation across {landmark}, {district}. Power supply cut.",
    "Continuous downpour since 5 AM. Roads turned into rivers in {city} near {landmark}.",
    "Flash flood alert! Water rushing into residential basements around {landmark}, {city}."
]

STORM_TEMPLATES = [
    "Violent thunderstorm and squall winds uprooted trees near {landmark}, {city}. Road blocked.",
    "Intense lightning and torrential downpour hitting {landmark}. High wind gusts causing roof damage.",
    "Cyclone alert: Heavy storm conditions over {district}. Stay indoors!"
]

LANDSLIDE_TEMPLATES = [
    "Major landslide triggered by heavy rain near {landmark}, {city}. Heavy boulders blocking highway.",
    "Slope collapse and mudslide reported at {landmark}. Traffic halted on both directions.",
    "Hill debris fallen on {landmark}. Emergency road clearance underway."
]


def generate_mock_reports(n: int = 250) -> List[Dict[str, Any]]:
    """
    Generate n realistic disaster reports covering verified, review, and rejected scenarios.
    """
    now = datetime.now(timezone.utc)
    reports = []

    # Distribution: ~35% verified, ~40% review, ~25% rejected
    num_verified = int(n * 0.35)
    num_rejected = int(n * 0.25)
    num_review = n - num_verified - num_rejected

    report_counter = 1

    for category, count in [("verified", num_verified), ("review", num_review), ("rejected", num_rejected)]:
        for _ in range(count):
            loc = random.choice(HOTSPOTS)
            landmark = random.choice(loc["landmarks"])
            
            # 80% flood/storm, 15% landslide, 5% other
            hazard_roll = random.random()
            if hazard_roll < 0.65:
                hazard = "flood"
                text = random.choice(FLOOD_TEMPLATES).format(landmark=landmark, city=loc["city"], district=loc["district"])
            elif hazard_roll < 0.85:
                hazard = "storm"
                text = random.choice(STORM_TEMPLATES).format(landmark=landmark, city=loc["city"], district=loc["district"])
            else:
                hazard = "landslide"
                text = random.choice(LANDSLIDE_TEMPLATES).format(landmark=landmark, city=loc["city"], district=loc["district"])

            # Random time in the past 12 hours
            time_offset_min = random.randint(5, 720)
            claimed_dt = now - timedelta(minutes=time_offset_min)
            claimed_time = claimed_dt.isoformat()

            # Random coordinate jitter within 3km of hotspot centroid
            lat_jitter = loc["lat"] + random.uniform(-0.025, 0.025)
            lon_jitter = loc["lon"] + random.uniform(-0.025, 0.025)

            image_url = random.choice(IMAGE_URLS)
            has_media = random.random() > 0.15

            # Setup specifics according to verification category
            if category == "verified":
                platform = random.choice(["sachet", "imd", "news", "gdelt", "bluesky"])
                score = round(random.uniform(0.78, 0.96), 2)
                verdict = "verified"
                rainfall = round(random.uniform(55.0, 115.0), 1)
                alert_id = f"SACHET-{loc['state'][:2].upper()}-2026-0{random.randint(100, 999)}"
                reasons = [
                    f"Corroborated by active official alert {alert_id}",
                    f"Physical weather sensor confirms {rainfall}mm rainfall in past 3h",
                    "Original media verified with no recycled matches",
                    "Geocoded location matches reported district"
                ]
                checks = {
                    "official": {"c1_result": "pass", "alert_ids": [alert_id], "details": "Active IMD/SACHET warning"},
                    "physical": {"c2_result": "pass", "rainfall_mm": rainfall, "satellite_evidence": True, "details": f"{rainfall}mm measured"},
                    "provenance": {"c3_result": "pass", "recycled": False, "archive_match_score": 0.05, "details": "Media appears original"},
                    "location": {"c4_result": "pass", "contradictions": [], "details": "Coordinates match text"},
                    "corroboration": {"c5_result": "pass", "independent_sources": random.randint(2, 6), "details": "Multi-source corroboration"}
                }

            elif category == "review":
                platform = random.choice(["bluesky", "citizen", "youtube", "news"])
                score = round(random.uniform(0.42, 0.72), 2)
                verdict = "review"
                rainfall = round(random.uniform(15.0, 45.0), 1)
                reasons = [
                    "Single unverified eyewitness signal",
                    f"Moderate rainfall ({rainfall}mm) recorded; monitoring for escalation",
                    "Awaiting second independent corroborating source"
                ]
                checks = {
                    "official": {"c1_result": "unknown", "alert_ids": [], "details": "No active red alert yet"},
                    "physical": {"c2_result": "unknown", "rainfall_mm": rainfall, "satellite_evidence": False, "details": "Moderate rain"},
                    "provenance": {"c3_result": "unknown", "recycled": False, "archive_match_score": 0.15, "details": "No archive match"},
                    "location": {"c4_result": "pass", "contradictions": [], "details": "Location approximate"},
                    "corroboration": {"c5_result": "unknown", "independent_sources": 1, "details": "Single report"}
                }

            else:  # rejected
                platform = random.choice(["bluesky", "citizen", "mock"])
                score = round(random.uniform(0.12, 0.38), 2)
                verdict = "rejected"
                
                # Assign specific hard-fail reason
                sub_case = random.choice(["recycled_media", "location_mismatch", "weather_contradiction"])
                if sub_case == "recycled_media":
                    archive_id = f"ARCHIVE_{random.choice([2019, 2021, 2023])}_FLOOD_0{random.randint(10, 99)}"
                    reasons = [
                        f"REJECTED: Recycled media detected! Archive match score 0.95 with {archive_id}",
                        "Visual pHash matches historical disaster footage"
                    ]
                    checks = {
                        "official": {"c1_result": "unknown", "alert_ids": [], "details": "N/A"},
                        "physical": {"c2_result": "unknown", "rainfall_mm": 5.0, "satellite_evidence": False, "details": "Low rain"},
                        "provenance": {"c3_result": "fail", "recycled": True, "archive_match_score": 0.95, "details": f"Matches {archive_id}"},
                        "location": {"c4_result": "unknown", "contradictions": [], "details": "Unverified"},
                        "corroboration": {"c5_result": "fail", "independent_sources": 0, "details": "Uncorroborated"}
                    }
                elif sub_case == "location_mismatch":
                    reasons = [
                        "REJECTED: Location contradiction! Text claims Chandigarh but VLM/EXIF identifies Kolkata landmarks",
                        "Distance discrepancy > 1200 km"
                    ]
                    checks = {
                        "official": {"c1_result": "fail", "alert_ids": [], "details": "District mismatch"},
                        "physical": {"c2_result": "unknown", "rainfall_mm": 0.0, "satellite_evidence": False, "details": "N/A"},
                        "provenance": {"c3_result": "unknown", "recycled": False, "archive_match_score": 0.2, "details": "N/A"},
                        "location": {"c4_result": "fail", "contradictions": ["Claimed Chandigarh, photo shows Kolkata Howrah Bridge"], "details": "Critical location mismatch"},
                        "corroboration": {"c5_result": "fail", "independent_sources": 0, "details": "None"}
                    }
                else:  # weather_contradiction
                    reasons = [
                        "REJECTED: Physical contradiction! Claims severe flooding but physical sensor recorded 0.0mm rain",
                        "Official IMD nowcast indicates completely clear weather"
                    ]
                    checks = {
                        "official": {"c1_result": "fail", "alert_ids": [], "details": "IMD confirms clear weather"},
                        "physical": {"c2_result": "fail", "rainfall_mm": 0.0, "satellite_evidence": False, "details": "0.0mm precipitation"},
                        "provenance": {"c3_result": "unknown", "recycled": False, "archive_match_score": 0.1, "details": "N/A"},
                        "location": {"c4_result": "pass", "contradictions": [], "details": "Location resolved"},
                        "corroboration": {"c5_result": "fail", "independent_sources": 0, "details": "None"}
                    }

            media_list = []
            if has_media:
                media_list.append({
                    "url": image_url,
                    "phash": f"hash_{category}_{report_counter:04d}",
                    "archive_match": {
                        "score": checks["provenance"]["archive_match_score"],
                        "matched_id": "ARCHIVE_MATCH" if checks["provenance"]["recycled"] else "",
                        "matched_date": "2021-08-15" if checks["provenance"]["recycled"] else ""
                    },
                    "exif": {
                        "gps": {"lat": lat_jitter, "lon": lon_jitter},
                        "datetime": claimed_time
                    }
                })

            structured_report = {
                "report_id": f"r_{report_counter:04d}",
                "source": {
                    "platform": platform,
                    "domain": f"{platform}.com" if "gov" not in platform else f"{platform}.gov.in",
                    "account": f"user_{report_counter}",
                    "reputation": 0.95 if platform in ("sachet", "imd") else (0.75 if platform in ("news", "gdelt") else 0.50)
                },
                "claim": {
                    "hazard": hazard,
                    "text": text,
                    "claimed_place": f"{landmark}, {loc['city']}, {loc['state']}",
                    "claimed_time": claimed_time
                },
                "media": media_list,
                "geo": {
                    "lat": lat_jitter,
                    "lon": lon_jitter,
                    "radius_km": 5.0,
                    "method": "official_polygon" if platform in ("sachet", "imd") else "text_geocode",
                    "confidence": 0.85,
                    "district": loc["district"]
                },
                "checks": checks,
                "score": score,
                "verdict": verdict,
                "reasons": reasons,
                "created_at": claimed_time,
                "updated_at": claimed_time
            }

            reports.append(structured_report)
            report_counter += 1

    # Shuffle for realistic stream arrival
    random.shuffle(reports)

    # Save to disk as pre-generated mock file
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(MOCK_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2, ensure_ascii=False)

    print(f"[Mock Generator] Successfully created {len(reports)} mock disaster reports in {MOCK_FILE_PATH}")
    return reports


def get_mock_reports() -> List[Dict[str, Any]]:
    """Retrieve pre-generated mock reports, or create them if missing."""
    if MOCK_FILE_PATH.exists():
        try:
            with open(MOCK_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return generate_mock_reports(250)

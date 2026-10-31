"""
NirikshakAI — Forensics + Geo Agent Pipeline
Owner: Samanyu (M2 phase: Hours 0-10)

You are a combined Forensics + Geo verification engine.
You receive incidents from the Dedup Agent and return GeoReports to the Evidence Agent.
"""

import os
import sys
import json
import hashlib
import asyncio
from datetime import datetime
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
CACHE_DIR = DATA_DIR / "cache"
MEDIC_DIR = DATA_DIR / "medic_subset"
CRISIS_MMD_DIR = DATA_DIR / "crisis_mmd_subset"
INDIAN_IMAGES_DIR = DATA_DIR / "indian_disaster_images"

# Ensure directories exist
for d in [CACHE_DIR, MEDIC_DIR, CRISIS_MMD_DIR, INDIAN_IMAGES_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ============================================================================
# TOOL 1: PERCEPTUAL HASH (pHash)
# ============================================================================

def compute_phash(image_path: str) -> str:
    """Compute 64-bit perceptual hash of an image."""
    import imagehash
    from PIL import Image
    img = Image.open(image_path)
    return str(imagehash.phash(img))

def hamming_distance(hash1: str, hash2: str) -> int:
    """Calculate Hamming distance between two pHashes."""
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

# ============================================================================
# TOOL 2: CLIP EMBEDDINGS + FAISS
# ============================================================================

class CLIPArchive:
    """CLIP embedding archive for semantic similarity search."""

    def __init__(self, index_path: str = None):
        self.index_path = index_path or str(DATA_DIR / "clip_index.faiss")
        self.metadata_path = str(DATA_DIR / "clip_metadata.json")
        self.model = None
        self.index = None
        self.metadata = []
        self._load_or_init()

    def _load_or_init(self):
        """Load existing FAISS index or create new one."""
        try:
            import faiss
            import clip
            import torch

            # Load model
            self.model, self.preprocess = clip.load("ViT-B/32", device="cpu")

            # Load or create index
            if os.path.exists(self.index_path):
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, 'r') as f:
                    self.metadata = json.load(f)
            else:
                self.index = faiss.IndexFlatL2(512)  # CLIP ViT-B/32 = 512 dim
                self.metadata = []
        except Exception as e:
            print(f"[CLIPArchive] Init warning: {e}")
            self.index = None
            self.metadata = []

    def add_embedding(self, embedding, metadata: dict):
        """Add embedding to index."""
        if self.index is None:
            return
        import numpy as np
        self.index.add(embedding.reshape(1, -1).astype('float32'))
        self.metadata.append(metadata)

    def search(self, embedding, k: int = 5, threshold: float = 0.92):
        """Search for similar embeddings. Returns list of (match, similarity)."""
        if self.index is None or self.index.ntotal == 0:
            return []

        import numpy as np
        distances, indices = self.index.search(embedding.reshape(1, -1).astype('float32'), k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            # Convert L2 distance to cosine similarity (approximate)
            similarity = 1.0 - (dist / 2.0)
            if similarity >= threshold:
                results.append({
                    "match_id": self.metadata[idx].get("id"),
                    "similarity": float(similarity),
                    "matched_date": self.metadata[idx].get("date"),
                    "match_type": "semantic"
                })
        return results

    def save(self):
        """Save index and metadata to disk."""
        if self.index is None:
            return
        import faiss
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'w') as f:
            json.dump(self.metadata, f)

# Global CLIP archive instance
clip_archive = CLIPArchive()

def compute_clip_embedding(image_path: str) -> 'np.ndarray':
    """Compute CLIP embedding for an image."""
    if clip_archive.model is None or clip_archive.preprocess is None:
        return None
    import torch
    from PIL import Image

    img = Image.open(image_path).convert("RGB")
    img_tensor = clip_archive.preprocess(img).unsqueeze(0)
    with torch.no_grad():
        embedding = clip_archive.model.encode_image(img_tensor)
    return embedding.cpu().numpy()[0]

# ============================================================================
# TOOL 3: EXIF PARSER
# ============================================================================

def parse_exif(image_path: str) -> dict:
    """Extract EXIF data from image."""
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS, GPSTAGS
        img = Image.open(image_path)
        exif_data = img._getexif()
        if not exif_data:
            return {"gps": None, "datetime": None, "camera": None}

        result = {"gps": None, "datetime": None, "camera": None}
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == "DateTimeOriginal":
                result["datetime"] = value
            elif tag == "Make" or tag == "Model":
                result["camera"] = f"{exif_data.get(TAGS.get(274, 'Make'), '')} {exif_data.get(TAGS.get(271, 'Model'), '')}".strip()
            elif tag == "GPSInfo":
                gps_data = {}
                for gps_tag_id, gps_value in value.items():
                    gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                    gps_data[gps_tag] = gps_value
                if "GPSLatitude" in gps_data and "GPSLongitude" in gps_data:
                    result["gps"] = {
                        "lat": _convert_to_degrees(gps_data["GPSLatitude"]),
                        "lon": _convert_to_degrees(gps_data["GPSLongitude"])
                    }
        return result
    except Exception as e:
        return {"gps": None, "datetime": None, "camera": None, "error": str(e)}

def _convert_to_degrees(dms):
    """Convert GPS DMS to decimal degrees."""
    d = float(dms[0])
    m = float(dms[1])
    s = float(dms[2])
    return d + m/60 + s/3600

# ============================================================================
# TOOL 4: GEMINI VLM (Optional)
# ============================================================================

def gemini_vlm_analysis(image_path: str, prompt: str = None) -> dict:
    """Analyze image with Gemini Flash VLM."""
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"landmarks": [], "signs": [], "scripts": [], "description": "", "error": "no_api_key"}

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        img = Image.open(image_path).convert("RGB")
        response = model.generate_content([
            f"Analyze this disaster image. Extract: (1) landmarks, (2) shop signs or text, (3) language scripts, (4) estimated city/region. Be concise. {prompt or ''}",
            img
        ])

        text = response.text
        return {
            "landmarks": _extract_list(text, "landmark"),
            "signs": _extract_list(text, "sign"),
            "scripts": _extract_list(text, "script"),
            "description": text[:500]
        }
    except Exception as e:
        return {"landmarks": [], "signs": [], "scripts": [], "description": "", "error": str(e)}

def _extract_list(text: str, keyword: str) -> list[str]:
    """Simple extraction from VLM response."""
    lines = text.split('\n')
    results = []
    for line in lines:
        if keyword.lower() in line.lower():
            clean = line.strip('- ').strip()
            if clean:
                results.append(clean)
    return results

# ============================================================================
# TOOL 5: GEOLOCATION + DISTRICT ASSIGNMENT
# ============================================================================

def _point_in_polygon(lat: float, lon: float, ring: list) -> bool:
    """Ray-casting point-in-polygon test. ring is a list of [lon, lat] pairs."""
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        if (y1 > lat) != (y2 > lat):
            x_intersect = x1 + (lat - y1) * (x2 - x1) / (y2 - y1)
            if x_intersect > lon:
                inside = not inside
    return inside


class GeoLocator:
    """Geocoding and district assignment engine."""

    def __init__(self):
        self.cache_dir = CACHE_DIR / "geocode"
        self.cache_dir.mkdir(exist_ok=True)
        self.gazetteer_path = DATA_DIR / "indian_gazetteer.json"
        self.districts_path = DATA_DIR / "india-districts.geojson"
        self._load_gazetteer()

    def _load_gazetteer(self):
        """Load offline gazetteer and district polygons."""
        # Load real district GeoJSON for point-in-polygon assignment
        self._districts = []
        if self.districts_path.exists():
            try:
                with open(self.districts_path, 'r', encoding='utf-8') as f:
                    self._districts = json.load(f).get("features", [])
            except Exception:
                self._districts = []

        if self.gazetteer_path.exists():
            with open(self.gazetteer_path, 'r', encoding='utf-8') as f:
                self.gazetteer = json.load(f)
        else:
            self.gazetteer = {
                "chennai": {"district": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707},
                "mumbai": {"district": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
                "kolkata": {"district": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639},
                "guwahati": {"district": "Kamrup", "state": "Assam", "lat": 26.1445, "lon": 91.7362},
                "delhi": {"district": "New Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090},
                "bangalore": {"district": "Bangalore Urban", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
                "hyderabad": {"district": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867},
                "coimbatore": {"district": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558}
            }
            self._save_gazetteer()

    def _save_gazetteer(self):
        with open(self.gazetteer_path, 'w', encoding='utf-8') as f:
            json.dump(self.gazetteer, f, indent=2, ensure_ascii=False)

    def _nearest_city(self, lat: float, lon: float) -> dict:
        """Fallback: assign the nearest known city when no polygon contains the point."""
        known_cities = [
            (13.0827, 80.2707, "Chennai", "Tamil Nadu"),
            (19.0760, 72.8777, "Mumbai", "Maharashtra"),
            (22.5726, 88.3639, "Kolkata", "West Bengal"),
            (26.1445, 91.7362, "Guwahati", "Assam"),
            (28.6139, 77.2090, "New Delhi", "Delhi"),
            (12.9716, 77.5946, "Bangalore Urban", "Karnataka"),
            (17.3850, 78.4867, "Hyderabad", "Telangana"),
            (11.0168, 76.9558, "Coimbatore", "Tamil Nadu"),
        ]
        min_dist = float('inf')
        closest = (None, None)
        for city_lat, city_lon, district, state in known_cities:
            dist = ((lat - city_lat)**2 + (lon - city_lon)**2)**0.5
            if dist < min_dist:
                min_dist = dist
                closest = (district, state)
        if min_dist < 1.0:  # Within ~100km
            return {"district": closest[0], "state": closest[1], "method": "nearest_city"}
        return {"district": "Unknown", "state": "Unknown", "method": "fallback"}

    def geocode(self, place_name: str) -> dict:
        """Geocode a place name using Open-Meteo (cached)."""
        cache_file = self.cache_dir / f"{hashlib.md5(place_name.encode()).hexdigest()}.json"

        # Check cache
        if cache_file.exists():
            with open(cache_file, 'r') as f:
                data = json.load(f)
                if data.get("timestamp", 0) > datetime.now().timestamp() - 86400:
                    return data

        # Check offline gazetteer
        key = place_name.lower().strip()
        if key in self.gazetteer:
            result = {**self.gazetteer[key], "method": "gazetteer", "cached": True}
            with open(cache_file, 'w') as f:
                json.dump({**result, "timestamp": datetime.now().timestamp()}, f)
            return result

        # Call Open-Meteo API
        try:
            import requests
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={place_name}&count=1&language=en&format=json"
            resp = requests.get(url, timeout=5)
            data = resp.json()
            if data.get("results"):
                r = data["results"][0]
                result = {
                    "lat": r["latitude"],
                    "lon": r["longitude"],
                    "district": r.get("admin2", ""),
                    "state": r.get("admin1", ""),
                    "country": r.get("country", ""),
                    "method": "openmeteo",
                    "cached": False
                }
                with open(cache_file, 'w') as f:
                    json.dump({**result, "timestamp": datetime.now().timestamp()}, f)
                return result
        except Exception as e:
            print(f"[GeoLocator] Geocoding failed for {place_name}: {e}")

        return {"lat": None, "lon": None, "district": None, "method": "failed"}

    def assign_district(self, lat: float, lon: float) -> dict:
        """Assign lat/lon to Indian district using point-in-polygon on real GeoJSON."""
        if not lat or not lon:
            return {"district": None, "state": None}

        if not self._districts:
            return {"district": None, "state": None, "method": "no_geojson"}

        # Fast point-in-polygon check across all district polygons
        for feature in self._districts:
            props = feature.get("properties", {})
            geom = feature.get("geometry")
            if not geom or geom.get("type") != "Polygon":
                continue
            ring = geom["coordinates"][0]
            if _point_in_polygon(lat, lon, ring):
                return {
                    "district": props.get("district"),
                    "state": props.get("state"),
                    "method": "geojson_polygon"
                }

        # Fallback: nearest city if no polygon contains the point
        return self._nearest_city(lat, lon)

# Global geo locator instance
geo_locator = GeoLocator()

# ============================================================================
# MAIN PIPELINE: process_incident()
# ============================================================================

def process_incident(incident: dict) -> dict:
    """
    Main pipeline: process one incident through Forensics + Geo agents.
    Returns a GeoReport with all findings.
    """
    report_id = incident.get("incident_id", "unknown")
    results = {
        "report_id": report_id,
        "forensics": [],
        "geo": {
            "extracted_places": [],
            "geocoded_lat": None,
            "geocoded_lon": None,
            "district": None,
            "state": None,
            "location_confidence": 0.0,
            "location_method": "none",
            "contradictions": [],
            "verdict": "unverified",
            "reasons": []
        }
    }

    # -----------------------------------------------------------------------
    # STEP 1: FORENSICS (C3) — Process all media in incident
    # -----------------------------------------------------------------------
    for media_item in incident.get("media", []):
        media_url = media_item.get("url")
        if not media_url:
            continue

        # Download image (or use local path)
        image_path = _download_image(media_url)
        if not image_path:
            continue

        forensics_finding = {
            "media_index": len(results["forensics"]),
            "phash": None,
            "archive_match": {"found": False, "score": 0.0, "matched_id": "", "matched_date": ""},
            "exif_data": parse_exif(image_path),
            "vlm_analysis": {"landmarks": [], "signs": [], "scripts": [], "description": ""},
            "verdict": "provenance_verified",
            "confidence_delta": 0.0,
            "reasons": []
        }

        # pHash
        try:
            phash = compute_phash(image_path)
            forensics_finding["phash"] = phash
            # TODO: search pHash archive (Lakshay+Tushar will provide pHash DB)
        except Exception as e:
            forensics_finding["reasons"].append(f"pHash failed: {e}")

        # CLIP embedding
        try:
            embedding = compute_clip_embedding(image_path)
            if embedding is not None and clip_archive.index is not None:
                matches = clip_archive.search(embedding, k=5, threshold=0.92)
                if matches:
                    best = matches[0]
                    forensics_finding["archive_match"] = {
                        "found": True,
                        "score": best["similarity"],
                        "matched_id": best["match_id"],
                        "matched_date": best["matched_date"],
                        "match_type": "semantic"
                    }
                    forensics_finding["verdict"] = "recycled"
                    forensics_finding["confidence_delta"] = -0.5
                    forensics_finding["reasons"].append(f"Recycled media: matched {best['matched_id']} from {best['matched_date']} (similarity {best['similarity']:.2f})")
        except Exception as e:
            forensics_finding["reasons"].append(f"CLIP failed: {e}")

        # EXIF analysis
        exif = forensics_finding["exif_data"]
        if exif.get("gps"):
            forensics_finding["reasons"].append(f"EXIF GPS found: {exif['gps']['lat']:.4f}, {exif['gps']['lon']:.4f}")
        else:
            forensics_finding["reasons"].append("No EXIF GPS data")
            forensics_finding["confidence_delta"] = max(forensics_finding["confidence_delta"], -0.1)

        # Gemini VLM (optional, best effort)
        try:
            vlm_result = gemini_vlm_analysis(image_path)
            forensics_finding["vlm_analysis"] = vlm_result
            if vlm_result.get("landmarks"):
                forensics_finding["reasons"].append(f"VLM landmarks: {', '.join(vlm_result['landmarks'][:3])}")
        except Exception as e:
            forensics_finding["reasons"].append(f"VLM skipped: {e}")

        results["forensics"].append(forensics_finding)

    # -----------------------------------------------------------------------
    # STEP 2: GEO (C4) — Location verification
    # -----------------------------------------------------------------------
    claim_text = incident.get("claim", {}).get("text", "")
    claimed_lat = incident.get("geo", {}).get("lat")
    claimed_lon = incident.get("geo", {}).get("lon")
    claimed_place = incident.get("claim", {}).get("claimed_place", "")

    # C4A: Text-based place extraction + geocoding
    # TODO: Integrate spaCy/IndicNER (build in Hour 5-6)
    if claimed_place:
        geocoded = geo_locator.geocode(claimed_place)
        if geocoded.get("lat"):
            results["geo"]["geocoded_lat"] = geocoded["lat"]
            results["geo"]["geocoded_lon"] = geocoded["lon"]
            results["geo"]["location_method"] = geocoded.get("method", "text_geocode")
            results["geo"]["reasons"].append(f"Text geocoded '{claimed_place}' → {geocoded['lat']:.4f}, {geocoded['lon']:.4f}")

            # Check distance from claimed location
            if claimed_lat and claimed_lon:
                dist = _haversine(claimed_lat, claimed_lon, geocoded["lat"], geocoded["lon"])
                if dist > 20:
                    results["geo"]["contradictions"].append(f"Location mismatch: text says '{claimed_place}' but claim says {claimed_lat:.4f},{claimed_lon:.4f} (distance {dist:.1f}km)")

    # C4B: VLM landmark verification
    for f in results["forensics"]:
        vlm_landmarks = f.get("vlm_analysis", {}).get("landmarks", [])
        if vlm_landmarks:
            # TODO: Build landmark→district gazetteer (Hour 7-8)
            results["geo"]["reasons"].append(f"VLM landmarks found: {', '.join(vlm_landmarks[:3])}")

    # C4C: EXIF GPS verification
    for f in results["forensics"]:
        exif_gps = f.get("exif_data", {}).get("gps")
        if exif_gps and claimed_lat and claimed_lon:
            dist = _haversine(exif_gps["lat"], exif_gps["lon"], claimed_lat, claimed_lon)
            if dist > 5:
                results["geo"]["contradictions"].append(f"EXIF mismatch: GPS shows {exif_gps['lat']:.4f},{exif_gps['lon']:.4f} but claim says {claimed_lat:.4f},{claimed_lon:.4f} (distance {dist:.1f}km)")
                results["geo"]["location_confidence"] = max(0, results["geo"]["location_confidence"] - 0.3)
            else:
                results["geo"]["location_confidence"] += 0.2
                results["geo"]["reasons"].append(f"EXIF GPS matches claim (±{dist:.1f}km)")

    # C4D: District assignment
    lat_to_assign = results["geo"]["geocoded_lat"] or claimed_lat
    lon_to_assign = results["geo"]["geocoded_lon"] or claimed_lon
    if lat_to_assign and lon_to_assign:
        district_info = geo_locator.assign_district(lat_to_assign, lon_to_assign)
        results["geo"]["district"] = district_info.get("district")
        results["geo"]["state"] = district_info.get("state")
        results["geo"]["reasons"].append(f"Assigned to {district_info.get('district')}, {district_info.get('state')}")

    # Finalize geo verdict
    if results["geo"]["contradictions"]:
        results["geo"]["verdict"] = "mismatch"
        results["geo"]["location_confidence"] = max(0, results["geo"]["location_confidence"] - 0.3)
    elif results["geo"]["district"]:
        results["geo"]["verdict"] = "verified"
        results["geo"]["location_confidence"] = min(1.0, results["geo"]["location_confidence"] + 0.3)
    else:
        results["geo"]["verdict"] = "unverified"

    return results

def _download_image(url: str) -> str:
    """Download image to local cache. Returns local path or None."""
    if url.startswith("http"):
        cache_path = CACHE_DIR / "images" / hashlib.md5(url.encode()).hexdigest()[:16]
        if cache_path.exists():
            return str(cache_path)
        try:
            import requests
            resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200 and len(resp.content) > 1000:
                cache_path.parent.mkdir(parents=True, exist_ok=True)
                cache_path.write_bytes(resp.content)
                return str(cache_path)
        except Exception:
            pass
        return None
    return url if os.path.exists(url) else None

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine distance in km."""
    import math
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Test with a sample incident
    test_incident = {
        "incident_id": "INC-TEST-001",
        "media": [
            {"url": "https://picsum.photos/seed/disaster1/400/300"}
        ],
        "claim": {
            "hazard": "flood",
            "text": "Flash flood in Chennai. Roads completely waterlogged!",
            "claimed_place": "Chennai",
            "claimed_time": "2026-10-31T08:30:00Z"
        },
        "geo": {
            "lat": 13.0827,
            "lon": 80.2707,
            "radius_km": 5
        }
    }

    print("Testing Forensics + Geo pipeline...")
    result = process_incident(test_incident)
    print(json.dumps(result, indent=2, ensure_ascii=False))

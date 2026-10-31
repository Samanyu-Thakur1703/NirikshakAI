import json
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SOURCES = [
    ("india_districts.geojson", "https://raw.githubusercontent.com/yashveeeeeeer/india-geodata/main/data/datameet/Admin2.geojson"),
    ("india-composite.geojson", "https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson"),
]

print("Downloading India boundary/geojson data...")
downloaded_any = False

for filename, url in SOURCES:
    out_path = DATA_DIR / filename
    if out_path.exists() and out_path.stat().st_size > 100:
        print(f"{filename} already exists ({out_path.stat().st_size:,} bytes), skipping.")
        downloaded_any = True
        continue

    print(f"Trying {url}...")
    try:
        r = requests.get(url, timeout=60)
        print(f"  Status: {r.status_code}, Size: {len(r.content):,}")
        if r.status_code == 200 and len(r.content) > 100:
            out_path.write_bytes(r.content)
            print(f"  Saved to {out_path}")
            downloaded_any = True
            break
        else:
            print(f"  Skipping (bad response)")
    except Exception as e:
        print(f"  FAILED: {e}")

if not downloaded_any:
    print("\nNo remote source worked. Creating minimal fallback geojson...")
    fallback = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"DISTRICT": "Chennai", "ST_NM": "Tamil Nadu", "CEN_CODE": 603},
                "geometry": {"type": "Polygon", "coordinates": [[[80.1, 12.9], [80.4, 12.9], [80.4, 13.3], [80.1, 13.3], [80.1, 12.9]]]},
            },
            {
                "type": "Feature",
                "properties": {"DISTRICT": "Mumbai", "ST_NM": "Maharashtra", "CEN_CODE": 400},
                "geometry": {"type": "Polygon", "coordinates": [[[72.7, 18.9], [73.0, 18.9], [73.0, 19.2], [72.7, 19.2], [72.7, 18.9]]]},
            },
            {
                "type": "Feature",
                "properties": {"DISTRICT": "Kolkata", "ST_NM": "West Bengal", "CEN_CODE": 700},
                "geometry": {"type": "Polygon", "coordinates": [[[88.3, 22.4], [88.4, 22.4], [88.4, 22.7], [88.3, 22.7], [88.3, 22.4]]]},
            },
            {
                "type": "Feature",
                "properties": {"DISTRICT": "Guwahati", "ST_NM": "Assam", "CEN_CODE": 781},
                "geometry": {"type": "Polygon", "coordinates": [[[91.5, 25.9], [91.8, 25.9], [91.8, 26.3], [91.5, 26.3], [91.5, 25.9]]]},
            },
            {
                "type": "Feature",
                "properties": {"DISTRICT": "New Delhi", "ST_NM": "Delhi", "CEN_CODE": 110},
                "geometry": {"type": "Polygon", "coordinates": [[[77.0, 28.4], [77.4, 28.4], [77.4, 28.8], [77.0, 28.8], [77.0, 28.4]]]},
            },
        ]
    }
    out_path = DATA_DIR / "india-districts-fallback.geojson"
    out_path.write_text(json.dumps(fallback, indent=2), encoding="utf-8")
    print(f"Created fallback: {out_path}")

print("\nVerifying downloaded files...")
for f in sorted(DATA_DIR.glob("*.geojson")):
    try:
        data = json.load(open(f, encoding="utf-8"))
        features = data.get("features", [])
        print(f"  {f.name}: {len(features)} features")
        if features:
            props = features[0].get("properties", {})
            print(f"    Keys: {list(props.keys())[:6]}")
    except Exception as e:
        print(f"  {f.name}: INVALID JSON - {e}")

print("\nDone.")

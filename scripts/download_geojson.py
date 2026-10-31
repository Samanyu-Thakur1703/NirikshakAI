import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

urls = {
    "india-soi.geojson": "https://raw.githubusercontent.com/datameet/maps/master/Survey-of-India-Index-Maps/Boundaries/india-soi.geojson",
    "india-composite.geojson": "https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson",
}

for filename, url in urls.items():
    out_path = DATA_DIR / filename
    if out_path.exists():
        print(f"{filename} already exists, skipping.")
        continue
    print(f"Downloading {filename}...")
    try:
        r = requests.get(url, timeout=60)
        r.raise_for_status()
        out_path.write_bytes(r.content)
        print(f"  Saved to {out_path} ({len(r.content):,} bytes)")
    except Exception as e:
        print(f"  FAILED: {e}")

print("Done.")

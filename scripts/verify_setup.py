import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

print("=" * 60)
print("NIRIKSHAKAI SETUP VERIFICATION")
print("=" * 60)

# Check MEDIC
medic_dir = DATA_DIR / "medic_subset"
images = list(medic_dir.glob("*.jpg"))
metadata = list(medic_dir.glob("*.json"))
print(f"\n[MEDIC]")
print(f"  Images: {len(images)}")
print(f"  Metadata: {len(metadata)}")
if metadata:
    sample = json.load(open(metadata[0], encoding="utf-8"))
    print(f"  Sample: {sample}")

# Check GeoJSON
print(f"\n[GEOJSON]")
for name in ["india-soi.geojson", "india-composite.geojson"]:
    p = DATA_DIR / name
    if p.exists():
        data = json.load(open(p, encoding="utf-8"))
        features = data.get("features", [])
        print(f"  {name}: {len(features)} features")
        if features:
            props = features[0].get("properties", {})
            print(f"    Sample props: {list(props.keys())[:5]}")
    else:
        print(f"  {name}: MISSING")

# Check Indian images
indian_dir = DATA_DIR / "indian_disaster_images"
imgs = list(indian_dir.glob("*.jpg")) + list(indian_dir.glob("*.png"))
print(f"\n[INDIAN IMAGES]")
print(f"  Collected: {len(imgs)} (target: 30-50)")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)

import os
import json
from pathlib import Path
from datasets import load_dataset

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUT_DIR = DATA_DIR / "medic_subset"
OUT_DIR.mkdir(parents=True, exist_ok=True)

print(f"Downloading MEDIC dataset (500-image subset)...")
ds = load_dataset("QCRI/MEDIC", split="train")
subset = ds.select(range(500))

print(f"Saving {len(subset)} images to {OUT_DIR}")
for i, item in enumerate(subset):
    img = item["image"]
    image_id = item.get("image_id", f"img_{i:04d}")
    stem = f"medic_{i:04d}_{image_id}"

    img_path = OUT_DIR / f"{stem}.jpg"
    img.save(img_path, "JPEG")

    meta_path = OUT_DIR / f"{stem}.json"
    meta = {
        "image_id": item.get("image_id"),
        "event_name": item.get("event_name"),
        "image_path": str(item.get("image_path", "")),
        "damage_severity": item.get("damage_severity"),
        "informative": item.get("informative"),
        "humanitarian": item.get("humanitarian"),
        "disaster_types": item.get("disaster_types"),
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

print(f"Done. Saved {len(subset)} images + metadata files.")

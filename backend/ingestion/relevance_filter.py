"""
Relevance Filter and Hazard Classifier for NirikshakAI Ingest Agent.
Evaluates incoming text and metadata against disaster dictionaries.
Enforces decision rule: emit only reports with relevance_score > 0.7.
"""

import json
import re
from pathlib import Path
from typing import Optional, Tuple, Dict, List

# Load keyword dictionary
KEYWORDS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "disaster_keywords.json"

DEFAULT_KEYWORDS = {
    "hazards": {
        "flood": ["flood", "flooding", "waterlogging", "submerged", "inundation", "baadh", "jal-jamaav", "flash flood"],
        "storm": ["cyclone", "storm", "thunderstorm", "lightning", "cloudburst", "heavy rain", "toofan", "downpour"],
        "landslide": ["landslide", "mudslide", "rockfall", "debris flow", "hill collapse", "bhoo-skhalan"],
        "earthquake": ["earthquake", "tremor", "aftershock", "quake", "seismic", "bhookamp"],
        "fire": ["wildfire", "forest fire", "bushfire", "jungle fire", "blaze"],
        "heatwave": ["heatwave", "extreme heat", "sunstroke", "loo", "scorching"]
    },
    "emergency_indicators": [
        "ndrf", "sdrf", "rescue", "evacuation", "red alert", "orange alert",
        "yellow alert", "sachet", "imd warning", "casualties", "submerged vehicles"
    ],
    "negative_keywords": [
        "movie", "trailer", "cricket", "bollywood", "sale", "discount", "shopping", "advertisement"
    ]
}

try:
    if KEYWORDS_FILE.exists():
        with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
            KEYWORD_CONFIG = json.load(f)
    else:
        KEYWORD_CONFIG = DEFAULT_KEYWORDS
except Exception:
    KEYWORD_CONFIG = DEFAULT_KEYWORDS


def detect_hazard(text: str) -> str:
    """
    Detect primary hazard category from text.
    Returns: flood | fire | storm | heatwave | earthquake | landslide | unknown
    """
    if not text:
        return "unknown"
    
    text_lower = text.lower()
    hazard_counts = {}

    for hazard, words in KEYWORD_CONFIG.get("hazards", {}).items():
        count = sum(1 for w in words if re.search(r'\b' + re.escape(w) + r'\b', text_lower))
        if count > 0:
            hazard_counts[hazard] = count

    if not hazard_counts:
        return "unknown"

    # Return hazard with highest keyword occurrences
    return max(hazard_counts.items(), key=lambda x: x[1])[0]


def classify_relevance(
    text: str,
    image_url: Optional[str] = None,
    platform: str = "social",
    domain: str = ""
) -> float:
    """
    Compute relevance score (0.0 to 1.0).
    Rule: Emitted downstream only if relevance_score > 0.7.
    """
    if not text:
        return 0.0

    text_lower = text.lower()
    score = 0.0

    # 1. Negative keywords check (immediate heavy penalty)
    negative_hits = sum(1 for nw in KEYWORD_CONFIG.get("negative_keywords", []) if nw in text_lower)
    if negative_hits > 0:
        score -= (0.45 * negative_hits)

    # 2. Hazard keyword matches (+0.40 for first hit, +0.10 for each extra)
    hazard_matches = 0
    for words in KEYWORD_CONFIG.get("hazards", {}).values():
        for w in words:
            if re.search(r'\b' + re.escape(w) + r'\b', text_lower):
                hazard_matches += 1

    if hazard_matches > 0:
        score += min(0.60, 0.40 + (hazard_matches - 1) * 0.10)

    # 3. Emergency & Official alert terms (+0.20 per hit up to +0.35)
    emergency_hits = sum(1 for ew in KEYWORD_CONFIG.get("emergency_indicators", []) if ew in text_lower)
    if emergency_hits > 0:
        score += min(0.35, emergency_hits * 0.20)

    # 4. Source Platform Trust weighting
    platform_lower = platform.lower()
    if platform_lower in ("sachet", "imd", "gdacs"):
        score += 0.35  # Official alerts are intrinsically relevant
    elif platform_lower in ("gdelt", "news"):
        score += 0.20
    elif platform_lower in ("bluesky", "youtube", "citizen"):
        score += 0.10

    # 5. Domain reputation boost
    if domain and any(d in domain.lower() for d in ["gov.in", "nic.in", "imd.", "ndma."]):
        score += 0.20

    # 6. Specificity cues: location/infrastructure keywords or numbers
    infra_cues = ["sector", "district", "village", "near", "road", "street", "bridge", "underpass", "subway", "flyover", "station", "area", "colony", "vehicles", "cars", "traffic", "river"]
    cues_found = sum(1 for tok in infra_cues if tok in text_lower)
    if cues_found > 0:
        score += min(0.20, cues_found * 0.08)

    has_numbers = bool(re.search(r'\d+', text))
    if has_numbers:
        score += 0.05

    # 7. Media presence boost
    if image_url and len(image_url) > 5:
        score += 0.08

    # Clamp score to [0.0, 1.0]
    final_score = max(0.0, min(1.0, score))
    return round(final_score, 3)


def is_relevant(score: float, threshold: float = 0.7) -> bool:
    """Decision rule gate: return True if score > threshold."""
    return score > threshold

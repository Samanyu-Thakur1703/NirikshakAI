"""
3-Tier Duplicate Detection Engine for NirikshakAI Dedup Agent.
Tier 1: Exact Match (MD5 hash of URL / text)
Tier 2: Perceptual Hash (DCT pHash, Hamming distance <= 8)
Tier 3: Semantic Similarity (Cosine similarity >= 0.92)
"""

import hashlib
import json
import re
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import numpy as np
from PIL import Image
import io

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
EXACT_DB_PATH = DATA_DIR / "exact_match_db.json"
PHASH_DB_PATH = DATA_DIR / "phash_db.json"
SEMANTIC_DB_PATH = DATA_DIR / "semantic_db.json"


def compute_md5(content: str) -> str:
    """Compute standard MD5 hash for exact matching."""
    return hashlib.md5(content.strip().encode("utf-8", errors="ignore")).hexdigest()


def compute_dct_phash(img: Image.Image) -> str:
    """
    Compute 64-bit Perceptual Hash (pHash) using 32x32 DCT.
    Compatible with industry-standard pHash algorithms.
    """
    try:
        # 1. Reduce size to 32x32 and grayscale
        img = img.convert("L").resize((32, 32), Image.Resampling.LANCZOS)
        pixels = np.asarray(img, dtype=np.float32)

        # 2. Compute 2D DCT using scipy.fftpack if available, else fast separable DCT
        try:
            from scipy.fftpack import dct
            dct_rows = dct(pixels, axis=0, norm="ortho")
            dct_2d = dct(dct_rows, axis=1, norm="ortho")
        except Exception:
            # Fallback pure-numpy DCT-II
            N = 32
            k = np.arange(N)[:, None]
            n = np.arange(N)[None, :]
            M = np.cos(np.pi / N * (n + 0.5) * k)
            M[0, :] *= 1 / np.sqrt(2)
            M *= np.sqrt(2 / N)
            dct_2d = M @ pixels @ M.T

        # 3. Extract top-left 8x8 low frequencies (excluding DC component [0, 0])
        low_freq = dct_2d[:8, :8]
        median_val = np.median(low_freq[1:, 1:])

        # 4. Generate 64-bit hash
        diff = low_freq > median_val
        hash_int = 0
        for bit in diff.flatten():
            hash_int = (hash_int << 1) | int(bit)

        return f"{hash_int:016x}"
    except Exception as e:
        print(f"[pHash Error] Failed to compute pHash: {e}")
        return ""


def hamming_distance(h1: str, h2: str) -> int:
    """
    Calculate Hamming distance (number of bit differences) between two hex hash strings.
    """
    if not h1 or not h2:
        return 64
    try:
        val1 = int(h1, 16)
        val2 = int(h2, 16)
        return bin(val1 ^ val2).count("1")
    except ValueError:
        # Fallback character level
        return sum(c1 != c2 for c1, c2 in zip(h1, h2)) + abs(len(h1) - len(h2))


class DuplicateDetector:
    """
    Stateful 3-Tier duplicate detection engine with disk persistence.
    """

    def __init__(self):
        self.exact_db: Dict[str, str] = {}    # hash -> report_id
        self.phash_db: Dict[str, str] = {}    # phash_hex -> report_id
        self.semantic_db: Dict[str, List[float]] = {}  # report_id -> normalized vector
        self.load_databases()

    def load_databases(self):
        """Load persistent hash records from disk."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if EXACT_DB_PATH.exists():
            try:
                with open(EXACT_DB_PATH, "r", encoding="utf-8") as f:
                    self.exact_db = json.load(f)
            except Exception:
                self.exact_db = {}

        if PHASH_DB_PATH.exists():
            try:
                with open(PHASH_DB_PATH, "r", encoding="utf-8") as f:
                    self.phash_db = json.load(f)
            except Exception:
                self.phash_db = {}

        if SEMANTIC_DB_PATH.exists():
            try:
                with open(SEMANTIC_DB_PATH, "r", encoding="utf-8") as f:
                    self.semantic_db = json.load(f)
            except Exception:
                self.semantic_db = {}

    def save_databases(self):
        """Persist hash records to disk."""
        try:
            with open(EXACT_DB_PATH, "w", encoding="utf-8") as f:
                json.dump(self.exact_db, f, indent=2)
            with open(PHASH_DB_PATH, "w", encoding="utf-8") as f:
                json.dump(self.phash_db, f, indent=2)
            with open(SEMANTIC_DB_PATH, "w", encoding="utf-8") as f:
                json.dump(self.semantic_db, f, indent=2)
        except Exception as e:
            print(f"[DuplicateDetector Warning] Failed to persist hash databases: {e}")

    # -----------------------------------------------------------------------
    # TIER 1: Exact Match (MD5)
    # -----------------------------------------------------------------------
    def exact_match(
        self,
        report_id: str,
        image_url: Optional[str] = None,
        text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Check for identical content using MD5.
        Returns: {'is_duplicate': bool, 'match_id': str, 'match_type': 'exact'}
        """
        keys_to_check = []
        if image_url and len(image_url) > 5:
            keys_to_check.append(f"img_{compute_md5(image_url)}")

        if text and len(text) > 10:
            # Clean punctuation and extra spaces
            norm_text = re.sub(r'\s+', ' ', re.sub(r'[^\w\s]', '', text.lower())).strip()
            keys_to_check.append(f"txt_{compute_md5(norm_text)}")

        for k in keys_to_check:
            if k in self.exact_db:
                existing_id = self.exact_db[k]
                if existing_id != report_id:
                    return {
                        "is_duplicate": True,
                        "match_id": existing_id,
                        "match_type": "exact",
                        "hash_key": k
                    }

        # If not duplicate, register keys
        for k in keys_to_check:
            self.exact_db[k] = report_id

        return {"is_duplicate": False, "match_id": None, "match_type": None}

    # -----------------------------------------------------------------------
    # TIER 2: Perceptual Hash (Hamming distance <= 8)
    # -----------------------------------------------------------------------
    def perceptual_match(
        self,
        report_id: str,
        image_url: Optional[str] = None,
        phash_str: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Check for visual near-duplicates using perceptual hash.
        Hamming <= 8: duplicate.
        Hamming 9-15: flag for Tier 3 review.
        """
        target_phash = phash_str
        if not target_phash and image_url:
            # If phash is not precomputed, generate deterministic mock or perceptual hash
            target_phash = f"{compute_md5(image_url)[:16]}"

        if not target_phash:
            return {"is_duplicate": False, "match_id": None, "match_type": "no_media", "distance": 64}

        min_dist = 64
        matched_id = None

        for existing_phash, existing_id in self.phash_db.items():
            if existing_id == report_id:
                continue
            dist = hamming_distance(target_phash, existing_phash)
            if dist < min_dist:
                min_dist = dist
                matched_id = existing_id

        # Tier 2 Decision Rules
        if min_dist <= 8 and matched_id:
            return {
                "is_duplicate": True,
                "match_id": matched_id,
                "match_type": "perceptual",
                "distance": min_dist
            }

        # Save to DB if novel
        self.phash_db[target_phash] = report_id

        if 9 <= min_dist <= 15 and matched_id:
            return {
                "is_duplicate": False,
                "match_id": matched_id,
                "flag_review": True,
                "match_type": "perceptual_review",
                "distance": min_dist
            }

        return {"is_duplicate": False, "match_id": None, "match_type": None, "distance": min_dist}

    # -----------------------------------------------------------------------
    # TIER 3: Semantic Similarity (Cosine similarity >= 0.92)
    # -----------------------------------------------------------------------
    def _embed_text(self, text: str) -> np.ndarray:
        """
        Create normalized feature representation for text.
        Uses character and word n-gram bag-of-words hashing into a 128-dimensional dense vector.
        """
        vec = np.zeros(128, dtype=np.float32)
        if not text:
            return vec

        words = re.findall(r'\w+', text.lower())
        for w in words:
            idx = int(hashlib.md5(w.encode()).hexdigest(), 16) % 128
            vec[idx] += 1.0

        # Character trigrams for typo resilience
        for i in range(len(text) - 2):
            tri = text[i:i+3].lower()
            idx = int(hashlib.md5(tri.encode()).hexdigest(), 16) % 128
            vec[idx] += 0.5

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec

    def semantic_match(
        self,
        report_id: str,
        text: Optional[str] = None,
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Check for semantic duplicates (different photos or syndicated text of same incident).
        Cosine similarity >= 0.92: duplicate.
        Cosine similarity 0.85 - 0.92: likely duplicate.
        """
        target_vec = self._embed_text(text or "")
        if np.linalg.norm(target_vec) == 0:
            return {"is_duplicate": False, "match_id": None, "match_type": "no_text", "similarity": 0.0}

        max_sim = 0.0
        matched_id = None

        for existing_id, raw_vec in self.semantic_db.items():
            if existing_id == report_id:
                continue
            e_vec = np.array(raw_vec, dtype=np.float32)
            sim = float(np.dot(target_vec, e_vec))
            if sim > max_sim:
                max_sim = sim
                matched_id = existing_id

        # Tier 3 Decision Rules
        if max_sim >= 0.92 and matched_id:
            return {
                "is_duplicate": True,
                "match_id": matched_id,
                "match_type": "semantic",
                "similarity": round(max_sim, 3)
            }

        # Store in semantic DB
        self.semantic_db[report_id] = target_vec.tolist()

        if 0.85 <= max_sim < 0.92 and matched_id:
            return {
                "is_duplicate": False,
                "match_id": matched_id,
                "flag_review": True,
                "match_type": "likely_duplicate",
                "similarity": round(max_sim, 3)
            }

        return {"is_duplicate": False, "match_id": None, "match_type": None, "similarity": round(max_sim, 3)}

    # -----------------------------------------------------------------------
    # Comprehensive Check
    # -----------------------------------------------------------------------
    def process_report(self, report_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run 3-tier duplicate detection in order:
        1. Exact Match -> 2. Perceptual Hash -> 3. Semantic Similarity
        """
        report_id = report_dict.get("report_id", "")
        claim = report_dict.get("claim", {})
        text = claim.get("text", "") if isinstance(claim, dict) else report_dict.get("text", "")
        
        media_list = report_dict.get("media", [])
        image_url = None
        phash_str = None
        if media_list and isinstance(media_list, list) and len(media_list) > 0:
            first_media = media_list[0]
            if isinstance(first_media, dict):
                image_url = first_media.get("url")
                phash_str = first_media.get("phash")

        # 1. Tier 1: Exact Match
        t1 = self.exact_match(report_id, image_url=image_url, text=text)
        if t1["is_duplicate"]:
            self.save_databases()
            return {
                "report_id": report_id,
                "is_duplicate": True,
                "match_id": t1["match_id"],
                "match_type": "exact",
                "tier": 1
            }

        # 2. Tier 2: Perceptual Hash
        t2 = self.perceptual_match(report_id, image_url=image_url, phash_str=phash_str)
        if t2["is_duplicate"]:
            self.save_databases()
            return {
                "report_id": report_id,
                "is_duplicate": True,
                "match_id": t2["match_id"],
                "match_type": "perceptual",
                "tier": 2,
                "distance": t2.get("distance")
            }

        # 3. Tier 3: Semantic Similarity
        t3 = self.semantic_match(report_id, text=text, image_url=image_url)
        if t3["is_duplicate"]:
            self.save_databases()
            return {
                "report_id": report_id,
                "is_duplicate": True,
                "match_id": t3["match_id"],
                "match_type": "semantic",
                "tier": 3,
                "similarity": t3.get("similarity")
            }

        self.save_databases()
        return {
            "report_id": report_id,
            "is_duplicate": False,
            "match_id": None,
            "match_type": None,
            "tier": None
        }


# Global detector singleton
_detector_instance: Optional[DuplicateDetector] = None

def get_duplicate_detector() -> DuplicateDetector:
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = DuplicateDetector()
    return _detector_instance

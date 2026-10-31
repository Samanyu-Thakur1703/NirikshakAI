"""
NirikshakAI — Judge Agent (C5: Scoring + Verdict)

Reads all 5 verification checks from a DisasterReport, computes the weighted
confidence score defined in CONTRACTS.md, applies verdict rules (including
hard-fail flags), and writes the result back onto the same report object.

Formula (from CONTRACTS.md §4):
    score = 0.30 * official + 0.25 * physical + 0.20 * corroboration
          + 0.15 * provenance + 0.10 * location ± source_reputation_adj

Verdict rules:
    verified : score >= 0.75 AND (C1 == pass OR C2 == pass)
    review   : 0.40 <= score < 0.75
    rejected : score < 0.40  OR  hard-fail flag triggered
               Hard-fail flags:
                 • provenance.recycled == True  (recycled media)
                 • any location contradiction string contains a distance > 50 km
"""

from __future__ import annotations

import logging
import re
from typing import Literal

from backend.models import DisasterReport

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_CHECK_SCORE: dict[str, float] = {"pass": 1.0, "fail": 0.0, "unknown": 0.5}


def _check_val(result: str) -> float:
    """Convert a three-way result literal to a numeric weight."""
    return _CHECK_SCORE.get(result, 0.5)


def _source_reputation_adj(reputation: float) -> float:
    """±0.05 reputation nudge per CONTRACTS.md."""
    if reputation >= 0.8:
        return +0.05
    if reputation < 0.2:
        return -0.05
    return 0.0


_KM_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*km", re.IGNORECASE)


def _has_location_contradiction_over_50km(contradictions: list[str]) -> bool:
    """
    Return True if any contradiction string mentions a distance > 50 km.
    Strings typically look like '… distance 73.4km …'.
    """
    for text in contradictions:
        for match in _KM_PATTERN.finditer(text):
            if float(match.group(1)) > 50.0:
                return True
    return False


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def apply_judgment(report: DisasterReport) -> DisasterReport:
    """
    Compute the weighted verification score and assign a verdict to *report*.

    Mutates and returns the same ``DisasterReport`` instance with:
      • ``report.score``   — clamped float in [0.0, 1.0]
      • ``report.verdict`` — "verified" | "review" | "rejected"
      • ``report.reasons`` — human-readable audit trail appended
    """
    checks = report.checks

    # ------------------------------------------------------------------
    # 1. Extract per-check results
    # ------------------------------------------------------------------
    c1 = checks.official.c1_result       # official
    c2 = checks.physical.c2_result       # physical
    c3 = checks.provenance.c3_result     # provenance
    c4 = checks.location.c4_result       # location
    c5 = checks.corroboration.c5_result  # corroboration

    # ------------------------------------------------------------------
    # 2. Weighted score
    # ------------------------------------------------------------------
    raw_score = (
        0.30 * _check_val(c1)
        + 0.25 * _check_val(c2)
        + 0.20 * _check_val(c5)
        + 0.15 * _check_val(c3)
        + 0.10 * _check_val(c4)
    )

    rep_adj = _source_reputation_adj(report.source.reputation)
    score = max(0.0, min(1.0, raw_score + rep_adj))

    # ------------------------------------------------------------------
    # 3. Hard-fail flags
    # ------------------------------------------------------------------
    recycled_flag = checks.provenance.recycled
    location_contradiction_flag = _has_location_contradiction_over_50km(
        checks.location.contradictions
    )

    # ------------------------------------------------------------------
    # 4. Verdict determination
    # ------------------------------------------------------------------
    hard_fail = recycled_flag or location_contradiction_flag

    if hard_fail or score < 0.40:
        verdict: Literal["verified", "review", "rejected"] = "rejected"
    elif score >= 0.75 and (c1 == "pass" or c2 == "pass"):
        verdict = "verified"
    elif score >= 0.40:
        verdict = "review"
    else:
        verdict = "rejected"

    # ------------------------------------------------------------------
    # 5. Build human-readable reasons
    # ------------------------------------------------------------------
    reasons: list[str] = []

    # C1 — Official
    if c1 == "pass":
        alert_summary = (
            f"{len(checks.official.alert_ids)} alert(s)"
            if checks.official.alert_ids
            else "alerts matched"
        )
        reasons.append(f"C1 pass ({alert_summary})")
    elif c1 == "fail":
        reasons.append(f"C1 fail — {checks.official.details or 'no official alert matched'}")
    else:
        reasons.append("C1 unknown — official check inconclusive")

    # C2 — Physical
    if c2 == "pass":
        reasons.append(
            f"C2 pass (rainfall {checks.physical.rainfall_mm:.1f}mm"
            + (", satellite evidence" if checks.physical.satellite_evidence else "")
            + ")"
        )
    elif c2 == "fail":
        reasons.append(
            f"C2 fail (rainfall {checks.physical.rainfall_mm:.1f}mm"
            + (", no satellite evidence" if not checks.physical.satellite_evidence else "")
            + ")"
        )
    else:
        reasons.append("C2 unknown — physical check inconclusive")

    # C3 — Provenance
    if recycled_flag:
        reasons.append(
            f"C3 hard-fail — recycled media detected"
            + (f" (archive score {checks.provenance.archive_match_score:.2f})" if checks.provenance.archive_match_score else "")
        )
    elif c3 == "pass":
        reasons.append("C3 pass — provenance verified (no recycled content)")
    elif c3 == "fail":
        reasons.append(f"C3 fail — {checks.provenance.details or 'provenance check failed'}")
    else:
        reasons.append("C3 unknown — provenance check inconclusive")

    # C4 — Location
    if location_contradiction_flag:
        reasons.append(
            "C4 hard-fail — location contradiction > 50 km: "
            + "; ".join(checks.location.contradictions)
        )
    elif c4 == "pass":
        reasons.append("C4 pass — location verified")
    elif c4 == "fail":
        reasons.append(
            f"C4 fail — {checks.location.details or 'location check failed'}"
            + (f" ({len(checks.location.contradictions)} contradiction(s))" if checks.location.contradictions else "")
        )
    else:
        reasons.append("C4 unknown — location check inconclusive")

    # C5 — Corroboration
    if c5 == "pass":
        reasons.append(
            f"C5 pass ({checks.corroboration.independent_sources} independent source(s))"
        )
    elif c5 == "fail":
        reasons.append(
            f"C5 fail — {checks.corroboration.details or 'insufficient corroboration'}"
            + f" ({checks.corroboration.independent_sources} independent source(s))"
        )
    else:
        reasons.append("C5 unknown — corroboration check inconclusive")

    # Score + reputation adjustment
    reasons.append(
        f"Score: {score:.3f} (raw {raw_score:.3f}"
        + (f", rep_adj {rep_adj:+.2f}" if rep_adj != 0.0 else "")
        + ")"
    )

    if rep_adj > 0:
        reasons.append(
            f"Source reputation bonus +0.05 (reputation={report.source.reputation:.2f})"
        )
    elif rep_adj < 0:
        reasons.append(
            f"Source reputation penalty -0.05 (reputation={report.source.reputation:.2f})"
        )

    # Hard-fail explanations
    if hard_fail:
        reasons.append(f"Verdict: rejected (hard-fail)")
    else:
        reasons.append(f"Verdict: {verdict}")

    # ------------------------------------------------------------------
    # 6. Write back to report
    # ------------------------------------------------------------------
    report.score = round(score, 4)
    report.verdict = verdict
    report.reasons.extend(reasons)

    logger.info(
        "[JudgeAgent] report=%s verdict=%s score=%.3f hard_fail=%s",
        report.report_id,
        verdict,
        score,
        hard_fail,
    )

    return report

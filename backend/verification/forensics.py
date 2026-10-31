"""Stable forensics API built on the existing media-analysis pipeline."""

from typing import Any, Dict

from backend.verification.forensics_agent import (
    compute_clip_embedding,
    compute_phash,
    gemini_vlm_analysis,
    parse_exif,
)


def check_media(report: Any) -> Dict[str, Any]:
    """Run available media checks for a report and return contract-shaped findings."""
    media_items = getattr(report, "media", None)
    if media_items is None and isinstance(report, dict):
        media_items = report.get("media", [])

    findings = []
    for media in media_items or []:
        image_path = media.get("url") if isinstance(media, dict) else getattr(media, "url", "")
        if not image_path or image_path.startswith(("http://", "https://")):
            findings.append({
                "phash": "",
                "archive_match": {"score": 0.0, "matched_id": "", "matched_date": ""},
                "exif_data": {},
                "vlm_analysis": {},
                "reasons": ["Remote media requires download before local analysis."],
            })
            continue

        finding: Dict[str, Any] = {
            "phash": "",
            "archive_match": {"score": 0.0, "matched_id": "", "matched_date": ""},
            "exif_data": parse_exif(image_path),
            "vlm_analysis": gemini_vlm_analysis(image_path),
            "reasons": [],
        }
        try:
            finding["phash"] = compute_phash(image_path)
        except (OSError, ValueError) as exc:
            finding["reasons"].append(f"pHash failed: {exc}")
        try:
            embedding = compute_clip_embedding(image_path)
            finding["clip_embedding_available"] = embedding is not None
        except (OSError, ValueError, RuntimeError) as exc:
            finding["reasons"].append(f"CLIP analysis failed: {exc}")
        findings.append(finding)

    report_id = getattr(report, "report_id", None)
    if report_id is None and isinstance(report, dict):
        report_id = report.get("report_id", "")
    return {"report_id": report_id or "", "media": findings}


__all__ = ["check_media", "compute_clip_embedding", "compute_phash", "gemini_vlm_analysis", "parse_exif"]


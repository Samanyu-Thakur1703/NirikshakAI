"""Agent wrapper for C3 media provenance checks."""

from typing import Any, Dict

from backend.verification.forensics import check_media


def run(report: Any) -> Dict[str, Any]:
    """Check report media and return a forensics result."""
    return check_media(report)


"""Synchronous entry point for the report verification workflow."""

import asyncio
from typing import Any, Dict, Iterable, List

from agents.dedup_agent import get_dedup_agent
from agents.forensics_agent import run as run_forensics
from agents.geo_agent import verify_location


def run_pipeline(reports: Iterable[Any]) -> Dict[str, List[Any]]:
    """Deduplicate reports, then attach forensics and geolocation results."""
    report_list = list(reports)
    dedup_result = get_dedup_agent().run(report_list)
    forensics = [run_forensics(report) for report in report_list]
    geo = [asyncio.run(verify_location(report)) for report in report_list]
    return {
        "incidents": dedup_result.incidents,
        "forensics_reports": forensics,
        "geo_reports": geo,
    }


__all__ = ["run_pipeline"]

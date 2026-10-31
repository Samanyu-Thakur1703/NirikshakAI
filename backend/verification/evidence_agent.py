"""
NirikshakAI — Evidence Agent (C1 Official + C2 Physical checks).

Populates the official and physical verification checks for a DisasterReport
by querying SACHET/IMD alerts and Open-Meteo rainfall + satellite evidence.
Only the `official` and `physical` fields of `Checks` are filled here;
provenance, location, and corroboration are owned by other agents.
"""

import asyncio
from datetime import datetime, timezone
from typing import List, Optional

from backend.models import Checks, DisasterReport, OfficialCheck, PhysicalCheck
from backend.ingestion.sachet_client import fetch_sachet_alerts
from backend.ingestion.imd_client import fetch_imd_alerts
from backend.ingestion.openmeteo_client import fetch_openmeteo_rainfall
from backend.geo.satellite import check_satellite_evidence


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_time(value: str) -> Optional[datetime]:
    """Parse an ISO8601 timestamp to a tz-aware datetime (None on failure)."""
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def _alert_timestamp(alert: dict) -> Optional[datetime]:
    """Extract the most relevant timestamp from an alert dict."""
    for key in ("timestamp", "issued_time", "valid_until", "claimed_time", "pubDate"):
        val = alert.get(key)
        if val:
            dt = _parse_time(val)
            if dt:
                return dt
    return None


def _district_matches(alert: dict, district: str) -> bool:
    """Case-insensitive substring match between alert and report district."""
    alert_district = (alert.get("district") or "").strip().lower()
    report_district = (district or "").strip().lower()
    if not alert_district or not report_district:
        return False
    return report_district in alert_district or alert_district in report_district


def _alert_in_window(alert: dict, claimed_dt: datetime, window_hours: float = 3.0) -> bool:
    """True if the alert's timestamp falls within ±window_hours of the claim."""
    alert_dt = _alert_timestamp(alert)
    if not alert_dt:
        return False
    delta = abs((alert_dt - claimed_dt).total_seconds()) / 3600.0
    return delta <= window_hours


def _alert_id(alert: dict) -> str:
    """Best-effort identifier for an alert."""
    return (
        alert.get("identifier")
        or alert.get("warning_id")
        or alert.get("id")
        or ""
    )


async def _fetch_official(state: str, district: str) -> tuple:
    """Run SACHET + IMD fetchers concurrently in one event loop."""
    sachet_alerts, imd_alerts = await asyncio.gather(
        fetch_sachet_alerts(state=state),
        fetch_imd_alerts(district=district),
        return_exceptions=True,
    )
    # Normalize exceptions to empty lists so callers see a uniform type.
    if isinstance(sachet_alerts, Exception):
        sachet_alerts = []
    if isinstance(imd_alerts, Exception):
        imd_alerts = []
    return sachet_alerts or [], imd_alerts or []


async def _fetch_rainfall(lat: float, lon: float) -> dict:
    """Run the Open-Meteo rainfall fetcher."""
    result = await fetch_openmeteo_rainfall(lat, lon, hours=3)
    return result or {}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate_evidence(report: DisasterReport) -> Checks:
    """
    Run C1 (official) and C2 (physical) checks for a single report.

    Returns a `Checks` object with only `official` and `physical` populated;
    all other check fields remain at their defaults.
    """
    official = OfficialCheck()
    physical = PhysicalCheck()

    # --- C1: Official check ----------------------------------------------
    district = report.geo.district
    if district:
        try:
            # GeoLocation has no `state` field; pass the district as the
            # SACHET state filter (offline fallback returns all alerts if
            # the substring does not match, so this is safe).
            sachet_alerts, imd_alerts = asyncio.run(
                _fetch_official(district, district)
            )
            fetch_error = None
        except Exception as exc:  # noqa: BLE001 - never raise from evidence agent
            sachet_alerts, imd_alerts = [], []
            fetch_error = exc

        if fetch_error is not None:
            official.c1_result = "unknown"
            official.details = f"Official fetch error: {fetch_error}"
        else:
            claimed_dt = _parse_time(report.claim.claimed_time) or datetime.now(timezone.utc)
            matching_ids: List[str] = []
            for alert in sachet_alerts + imd_alerts:
                if _district_matches(alert, district) and _alert_in_window(alert, claimed_dt):
                    alert_id = _alert_id(alert)
                    if alert_id and alert_id not in matching_ids:
                        matching_ids.append(alert_id)

            if matching_ids:
                official.c1_result = "pass"
                official.alert_ids = matching_ids
                official.details = (
                    f"Official alert(s) match district '{district}' within ±3h"
                )
            elif sachet_alerts or imd_alerts:
                official.c1_result = "fail"
                official.details = (
                    f"No official alert matched district '{district}' within ±3h "
                    f"({len(sachet_alerts)} SACHET, {len(imd_alerts)} IMD alerts returned)"
                )
            else:
                official.c1_result = "fail"
                official.details = "No official alerts returned for district"

    # --- C2: Physical check ----------------------------------------------
    lat = report.geo.lat
    lon = report.geo.lon
    if lat is not None and lon is not None:
        claimed_dt = _parse_time(report.claim.claimed_time) or datetime.now(timezone.utc)
        date_str = claimed_dt.strftime("%Y-%m-%d")

        try:
            rainfall = asyncio.run(_fetch_rainfall(lat, lon))
            rainfall_mm = float(rainfall.get("rainfall_mm", 0.0))
            physical.rainfall_mm = rainfall_mm
            if rainfall_mm > 10.0:
                physical.c2_result = "pass"
                physical.details = (
                    f"Open-Meteo recorded {rainfall_mm}mm rainfall in 3h window"
                )
            else:
                physical.c2_result = "fail"
                physical.details = (
                    f"Rainfall {rainfall_mm}mm below 10mm threshold in 3h window"
                )
        except Exception as exc:  # noqa: BLE001
            physical.c2_result = "unknown"
            physical.details = f"Rainfall fetch error: {exc}"
            rainfall_mm = 0.0

        try:
            if check_satellite_evidence(lat, lon, date_str):
                physical.satellite_evidence = True
                physical.details = (
                    f"{physical.details}; satellite evidence: True"
                    if physical.details
                    else "Satellite evidence: True"
                )
        except Exception as exc:  # noqa: BLE001
            physical.details = (
                f"{physical.details}; satellite check error: {exc}"
                if physical.details
                else f"Satellite check error: {exc}"
            )

    return Checks(official=official, physical=physical)
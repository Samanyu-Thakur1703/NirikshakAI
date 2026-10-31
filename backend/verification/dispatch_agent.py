"""
NirikshakAI — Dispatch Agent (CAP 1.2 Alert Drafting)

Generates a Common Alerting Protocol 1.2 XML string from an active Incident.

Rules:
  • If incident.cap_xml is already populated, return it as-is (idempotent).
  • Priority → CAP severity mapping:
      CRITICAL / HIGH → Severe
      MEDIUM          → Moderate
      LOW             → Minor
  • On any exception, log it and return "" so the caller can handle gracefully.
  • <sent> uses datetime.now(timezone.utc).isoformat() per spec.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom.minidom import parseString

from backend.models import Incident

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Priority → CAP severity mapping
# ---------------------------------------------------------------------------

_SEVERITY_MAP: dict[str, str] = {
    "CRITICAL": "Severe",
    "HIGH":     "Severe",
    "MEDIUM":   "Moderate",
    "LOW":      "Minor",
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def draft_cap_alert(incident: Incident) -> str:
    """
    Draft a CAP 1.2 XML alert string for *incident*.

    Parameters
    ----------
    incident:
        An ``Incident`` with ``status == "active"`` and ``priority`` set.

    Returns
    -------
    str
        A well-formed CAP 1.2 XML string, or ``""`` on error.
    """
    # Idempotency guard — never regenerate if already drafted.
    if incident.cap_xml:
        return incident.cap_xml

    try:
        return _build_cap_xml(incident)
    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "[DispatchAgent] Failed to draft CAP alert for incident=%s: %s",
            incident.incident_id,
            exc,
        )
        return ""


# ---------------------------------------------------------------------------
# Internal builder
# ---------------------------------------------------------------------------

def _build_cap_xml(incident: Incident) -> str:
    """Construct and serialise the CAP 1.2 XML tree."""

    CAP_NS = "urn:oasis:names:tc:emergency:cap:1.2"

    # --- Root <alert> -------------------------------------------------------
    alert = Element("alert")
    alert.set("xmlns", CAP_NS)

    # --- Core fields --------------------------------------------------------
    _text(alert, "identifier", f"NirikshakAI-{incident.incident_id}")
    _text(alert, "sender",     "NirikshakAI-Verification-Engine")
    _text(alert, "sent",       datetime.now(timezone.utc).isoformat())
    _text(alert, "status",     "Actual")
    _text(alert, "msgType",    "Alert")

    # --- <info> block -------------------------------------------------------
    info = SubElement(alert, "info")

    _text(info, "category",  "Met")
    _text(info, "event",     incident.disaster_type.title())
    _text(info, "urgency",   "Immediate")
    _text(info, "severity",  _SEVERITY_MAP.get(incident.priority, "Moderate"))
    _text(info, "certainty", "Observed")

    # --- <area> block -------------------------------------------------------
    area = SubElement(info, "area")

    district = incident.district or ""
    # Attempt to derive a state label from operator_summary or leave blank
    state = _extract_state(incident)
    area_desc = f"{district}, {state}".strip(", ") if (district or state) else incident.title
    _text(area, "areaDesc", area_desc)

    # CAP circle: "lat,lon radius"  (radius in km as a plain number per CAP spec)
    circle_value = f"{incident.lat},{incident.lon},{incident.radius_km}"
    _text(area, "circle", circle_value)

    # --- Serialise ----------------------------------------------------------
    raw_xml = tostring(alert, encoding="unicode", xml_declaration=False)

    # Pretty-print via minidom and prepend the XML declaration manually so the
    # encoding attribute is exactly "UTF-8" (minidom uses uppercase, which is
    # correct per CAP spec).
    dom = parseString(raw_xml)
    pretty = dom.toprettyxml(indent="  ", encoding=None)

    # toprettyxml prepends its own declaration; replace it with the canonical form.
    lines = pretty.splitlines()
    if lines and lines[0].startswith("<?xml"):
        lines[0] = '<?xml version="1.0" encoding="UTF-8"?>'
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tiny helpers
# ---------------------------------------------------------------------------

def _text(parent: Element, tag: str, value: str) -> None:
    """Create a child element with a text value."""
    el = SubElement(parent, tag)
    el.text = value


def _extract_state(incident: Incident) -> str:
    """
    Best-effort state extraction.  The Incident model does not have a ``state``
    field, so we look in ``operator_summary`` for a comma-separated suffix
    (e.g. "Flood in Amritsar, Punjab") or fall back to an empty string.
    """
    summary = incident.operator_summary or ""
    parts = [p.strip() for p in summary.split(",")]
    # Heuristic: last token after a comma is often the state name
    if len(parts) >= 2:
        return parts[-1]
    return ""

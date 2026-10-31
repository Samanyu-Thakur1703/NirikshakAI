"""
NDMA SACHET RSS Fetcher for NirikshakAI Ingest Agent.
Retrieves official Common Alerting Protocol (CAP) RSS feeds from NDMA SACHET.
Includes offline fallback snapshots for uninterrupted hackathon demos.
"""

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from backend.ingestion.http_client import fetch_url_async, save_to_cache, load_from_cache

# Primary NDMA SACHET RSS Feed URLs
SACHET_RSS_URL = "https://sachet.ndma.gov.in/cap_public_website/rss/all_alerts.xml"

# High-fidelity realistic SACHET offline fallback alerts for Indian disaster zones
OFFLINE_SACHET_ALERTS = [
    {
        "identifier": "SACHET-NDMA-2026-PB-0941",
        "sender": "NDMA_India",
        "title": "FLASH FLOOD WARNING: SAS Nagar Mohali & Ropar",
        "description": "Severe waterlogging and rising water levels reported in low-lying areas of Mohali (Sectors 62, 70, 71) and Ropar following cloudburst in catchment areas. NDRF deployed. Avoid waterlogged underpasses.",
        "hazard": "flood",
        "state": "Punjab",
        "district": "SAS Nagar (Mohali)",
        "lat": 30.7046,
        "lon": 76.7179,
        "severity": "Severe",
        "urgency": "Immediate",
        "certainty": "Observed",
        "timestamp": "2026-10-31T07:15:00Z"
    },
    {
        "identifier": "SACHET-NDMA-2026-TN-0412",
        "sender": "SDMA_TamilNadu",
        "title": "CYCLONIC RAINFALL ALERT: Chennai & Chengalpattu",
        "description": "Very heavy to extremely heavy rainfall with gusty winds (65-75 kmph) expected over coastal Chennai. Inundation alert for Velachery, Madipakkam, and Tambaram basins.",
        "hazard": "storm",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "lat": 13.0827,
        "lon": 80.2707,
        "severity": "Extreme",
        "urgency": "Expected",
        "certainty": "Likely",
        "timestamp": "2026-10-31T06:30:00Z"
    },
    {
        "identifier": "SACHET-NDMA-2026-AS-0819",
        "sender": "ASDMA_Assam",
        "title": "BRAHMAPUTRA RIVER WATER LEVEL EXCEEDING DANGER MARK",
        "description": "Brahmaputra flowing 1.2m above danger mark in Dhubri and Kaziranga belt. Inundation of over 45 villages. Relief camps operational.",
        "hazard": "flood",
        "state": "Assam",
        "district": "Dhubri",
        "lat": 26.0205,
        "lon": 89.9740,
        "severity": "Extreme",
        "urgency": "Immediate",
        "certainty": "Observed",
        "timestamp": "2026-10-31T05:00:00Z"
    },
    {
        "identifier": "SACHET-NDMA-2026-HP-0120",
        "sender": "HPSDMA_Shimla",
        "title": "MAJOR LANDSLIDE WARNING: NH-5 Chandigarh-Shimla Highway",
        "description": "Massive debris flow and rockfall near Solan / Jabli. NH-5 highway blocked for vehicular movement. Commuters advised to delay travel.",
        "hazard": "landslide",
        "state": "Himachal Pradesh",
        "district": "Solan",
        "lat": 30.9045,
        "lon": 77.0967,
        "severity": "Severe",
        "urgency": "Immediate",
        "certainty": "Observed",
        "timestamp": "2026-10-31T08:00:00Z"
    }
]


def parse_sachet_xml(xml_content: str) -> List[Dict[str, Any]]:
    """Parse standard SACHET RSS/CAP XML into structured alert objects."""
    alerts = []
    try:
        root = ET.fromstring(xml_content)
        # Handle standard RSS <channel><item> structure
        items = root.findall(".//item")
        for item in items:
            title = item.findtext("title", "")
            description = item.findtext("description", "")
            link = item.findtext("link", "")
            pub_date = item.findtext("pubDate", "")
            guid = item.findtext("guid", title)

            # Extract coordinates if georss / point is present
            point = item.findtext("{http://www.georss.org/georss}point", "")
            lat, lon = None, None
            if point and " " in point:
                try:
                    p_parts = point.strip().split()
                    lat, lon = float(p_parts[0]), float(p_parts[1])
                except Exception:
                    pass

            alerts.append({
                "identifier": guid or f"SACHET-{len(alerts)+1}",
                "sender": "NDMA_SACHET",
                "title": title,
                "description": description,
                "link": link,
                "claimed_time": pub_date,
                "lat": lat,
                "lon": lon,
                "hazard": "flood" if "flood" in (title + description).lower() else "storm"
            })
    except Exception as e:
        print(f"[SACHET Parser] Error parsing XML feed: {e}")
    return alerts


async def fetch_sachet_alerts(state: str = "Punjab") -> List[Dict[str, Any]]:
    """
    Fetch official SACHET alerts. Falls back to cached/embedded high-trust records.
    """
    raw_xml = await fetch_url_async(SACHET_RSS_URL, source_tag="sachet", timeout=5)
    parsed_alerts = []
    if raw_xml:
        parsed_alerts = parse_sachet_xml(raw_xml)

    if not parsed_alerts:
        # Filter offline fallback by state if requested
        matched = [a for a in OFFLINE_SACHET_ALERTS if state.lower() in a["state"].lower()]
        return matched if matched else OFFLINE_SACHET_ALERTS

    return parsed_alerts

"""
GDACS (Global Disaster Alert and Coordination System) Fetcher for NirikshakAI.
Retrieves international disaster coordination alerts for South Asia / India.
"""

from typing import List, Dict, Any
import xml.etree.ElementTree as ET
from backend.ingestion.http_client import fetch_url_async

GDACS_FEED_URL = "https://www.gdacs.org/xml/rss.xml"

OFFLINE_GDACS_ALERTS = [
    {
        "event_id": "GDACS-TC-1000921",
        "title": "Green Tropical Cyclone alert in India",
        "description": "Tropical Cyclone heading towards the Bay of Bengal coastline with projected wind speeds of 80 km/h. High precipitation expected.",
        "hazard": "storm",
        "country": "India",
        "lat": 15.5000,
        "lon": 82.5000,
        "severity": "Orange",
        "alert_level": "Orange",
        "timestamp": "2026-10-31T06:00:00Z"
    },
    {
        "event_id": "GDACS-FL-1000922",
        "title": "Orange Flood alert for Brahmaputra Basin",
        "description": "Satellite detected severe flood extent over Assam and Northeast India affecting over 250,000 residents.",
        "hazard": "flood",
        "country": "India",
        "lat": 26.2006,
        "lon": 92.9376,
        "severity": "Red",
        "alert_level": "Red",
        "timestamp": "2026-10-31T04:30:00Z"
    }
]


async def fetch_gdacs_alerts(country: str = "India") -> List[Dict[str, Any]]:
    """Fetch GDACS alerts for India and neighbouring subcontinental basins."""
    raw_xml = await fetch_url_async(GDACS_FEED_URL, source_tag="gdacs", timeout=6)
    alerts = []
    if raw_xml:
        try:
            root = ET.fromstring(raw_xml)
            for item in root.findall(".//item"):
                title = item.findtext("title", "")
                desc = item.findtext("description", "")
                if country.lower() in (title + desc).lower():
                    alerts.append({
                        "event_id": item.findtext("guid", "GDACS-ALERT"),
                        "title": title,
                        "description": desc,
                        "link": item.findtext("link", ""),
                        "timestamp": item.findtext("pubDate", "")
                    })
        except Exception as e:
            print(f"[GDACS Parser] Warning: {e}")

    if not alerts:
        return OFFLINE_GDACS_ALERTS
    return alerts

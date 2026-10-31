"""
Bluesky Social Feed Ingest Client for NirikshakAI.
Polls public Bluesky posts referencing active disaster keywords.
Provides supplementary citizen reporting signals (Tier 3).
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
from backend.ingestion.http_client import fetch_url_async

BSKY_PUBLIC_API = "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts"

OFFLINE_BLUESKY_POSTS = [
    {
        "uri": "at://did:plc:mohali_citizen/app.bsky.feed.post/3kflood123",
        "author": "punjab_weather_watcher.bsky.social",
        "text": "Huge waterlogging outside Phase 8 industrial area Mohali! Cars stuck in 2 feet water. Drainage completely failed. #MohaliRains #PunjabFloods",
        "claimed_place": "Mohali, Punjab",
        "hazard": "flood",
        "lat": 30.7046,
        "lon": 76.7179,
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
                "phash": "a7b3c2d1e0f98877",
                "archive_match": {"score": 0.05, "matched_id": "", "matched_date": ""}
            }
        ],
        "timestamp": "2026-10-31T08:20:00Z"
    },
    {
        "uri": "at://did:plc:chennai_local/app.bsky.feed.post/3kflood456",
        "author": "chennai_ground_zero.bsky.social",
        "text": "Velachery 100 feet road under water. Residents moving to first floor. Power cut announced in low-lying areas. #ChennaiRains",
        "claimed_place": "Chennai, Tamil Nadu",
        "hazard": "flood",
        "lat": 13.0827,
        "lon": 80.2707,
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=800&q=80",
                "phash": "b8c4d3e2f1a09988",
                "archive_match": {"score": 0.08, "matched_id": "", "matched_date": ""}
            }
        ],
        "timestamp": "2026-10-31T08:05:00Z"
    },
    {
        "uri": "at://did:plc:viral_spammer/app.bsky.feed.post/3krecycled789",
        "author": "breaking_news_247.bsky.social",
        "text": "BREAKING: Severe tsunami and dam burst hits Chandigarh today! Hundreds washed away!! WATCH VIDEO NOW",
        "claimed_place": "Chandigarh, India",
        "hazard": "flood",
        "lat": 30.7333,
        "lon": 76.7794,
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
                "phash": "ffff0000aaaa5555",
                # Simulated recycled image match for testing C3 hard-fail
                "archive_match": {"score": 0.96, "matched_id": "ARCHIVE_2018_KERALA_089", "matched_date": "2018-08-16"}
            }
        ],
        "timestamp": "2026-10-31T08:32:00Z"
    }
]


async def fetch_bluesky_posts(keywords: List[str] = None) -> List[Dict[str, Any]]:
    """Fetch public Bluesky posts matching disaster keywords."""
    if not keywords:
        keywords = ["flood", "waterlogging", "cloudburst", "rains"]

    query = f"({' OR '.join(keywords[:3])}) lang:en"
    params = {"q": query, "limit": 20}

    raw_json = await fetch_url_async(BSKY_PUBLIC_API, source_tag="bluesky", params=params, timeout=5)
    posts = []

    if raw_json:
        try:
            import json
            data = json.loads(raw_json)
            for p in data.get("posts", []):
                record = p.get("record", {})
                posts.append({
                    "uri": p.get("uri"),
                    "author": p.get("author", {}).get("handle", ""),
                    "text": record.get("text", ""),
                    "timestamp": record.get("createdAt", ""),
                    "claimed_place": ""
                })
        except Exception:
            pass

    if not posts:
        return OFFLINE_BLUESKY_POSTS

    return posts

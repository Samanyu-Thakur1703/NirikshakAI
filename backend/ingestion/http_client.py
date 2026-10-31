"""
HTTP client with caching, timeouts, and graceful offline fallback.
Uses Python's standard library urllib for zero-dependency portability and reliability.
"""

import json
import urllib.request
import urllib.parse
import urllib.error
import ssl
from pathlib import Path
from datetime import datetime, timezone
import asyncio
from typing import Optional, Dict, Any, List

# Cache root directory
CACHE_ROOT = Path(__file__).resolve().parent.parent.parent / "data" / "cache"
CACHE_ROOT.mkdir(parents=True, exist_ok=True)


def _sync_fetch(
    url: str,
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 8,
) -> str:
    """Synchronous HTTP GET request using urllib."""
    if params:
        query_string = urllib.parse.urlencode(params)
        url = f"{url}?{query_string}" if "?" not in url else f"{url}&{query_string}"

    req_headers = {
        "User-Agent": "NirikshakAI/1.0 (NDMA Disaster Verification Engine; Hackathon Research)",
        "Accept": "application/json, application/xml, text/xml, */*",
    }
    if headers:
        req_headers.update(headers)

    req = urllib.request.Request(url, headers=req_headers)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def save_to_cache(source: str, filename: str, data: Any):
    """Save raw response to disk cache under data/cache/{source}/."""
    try:
        source_dir = CACHE_ROOT / source
        source_dir.mkdir(parents=True, exist_ok=True)
        file_path = source_dir / filename
        with open(file_path, "w", encoding="utf-8") as f:
            if isinstance(data, (dict, list)):
                json.dump(data, f, indent=2, ensure_ascii=False)
            else:
                f.write(str(data))
    except Exception as e:
        print(f"[Cache Warning] Failed to write cache for {source}: {e}")


def load_from_cache(source: str, filename: Optional[str] = None) -> Optional[Any]:
    """
    Load specific cached file or latest cached file from data/cache/{source}/.
    """
    try:
        source_dir = CACHE_ROOT / source
        if not source_dir.exists():
            return None

        if filename:
            file_path = source_dir / filename
            if file_path.exists():
                content = file_path.read_text(encoding="utf-8")
                try:
                    return json.loads(content)
                except Exception:
                    return content
            return None

        # Pick the most recently modified file
        files = list(source_dir.glob("*"))
        if not files:
            return None
        latest_file = max(files, key=lambda f: f.stat().st_mtime)
        content = latest_file.read_text(encoding="utf-8")
        try:
            return json.loads(content)
        except Exception:
            return content
    except Exception as e:
        print(f"[Cache Warning] Failed to load cache for {source}: {e}")
        return None


async def fetch_url_async(
    url: str,
    source_tag: str,
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 8,
) -> Optional[str]:
    """
    Asynchronous fetch with automatic disk caching and fallback.
    """
    try:
        # Run blocking network call in threadpool
        response_text = await asyncio.to_thread(_sync_fetch, url, params, headers, timeout)
        # Cache successful response
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        save_to_cache(source_tag, f"{timestamp}.snapshot", response_text)
        return response_text
    except Exception as e:
        print(f"[Ingest Notice] Network request failed for {url} ({e}). Falling back to cached snapshot.")
        cached_data = load_from_cache(source_tag)
        if cached_data is not None:
            if isinstance(cached_data, (dict, list)):
                return json.dumps(cached_data)
            return str(cached_data)
        return None

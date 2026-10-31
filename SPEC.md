# NirikshakAI — System Specification (SPEC.md)
## Graviton 2026 | PS #06 | Multi-Agent Disaster Verification Engine

---

## 1. Core Schema: `DisasterReport`

Every incoming signal from any source is normalized into the following schema:

```json
{
  "report_id": "r_0192",
  "source": {
    "platform": "sachet | imd | gdacs | gdelt | news | bluesky | youtube | mock",
    "domain": "imd.gov.in",
    "account": "mausam_alert",
    "reputation": 0.95
  },
  "claim": {
    "hazard": "flood | fire | storm | heatwave | earthquake | landslide | unknown",
    "text": "Severe waterlogging reported near Sector 62 Phase 8 Mohali. Water level rising fast.",
    "claimed_place": "Mohali, Punjab",
    "claimed_time": "2026-10-31T08:30:00Z"
  },
  "media": [
    {
      "url": "https://example.com/disaster_photo_1.jpg",
      "phash": "a7b3c2d1e0f98877",
      "archive_match": {
        "score": 0.0,
        "matched_id": "",
        "matched_date": ""
      },
      "exif": {
        "gps": {"lat": 30.7046, "lon": 76.7179},
        "datetime": "2026-10-31T08:15:00Z"
      }
    }
  ],
  "geo": {
    "lat": 30.7046,
    "lon": 76.7179,
    "radius_km": 5.0,
    "method": "text_geocode | vlm_landmark | exif",
    "confidence": 0.85,
    "district": "SAS Nagar (Mohali)"
  },
  "checks": {
    "official": {
      "c1_result": "pass | fail | unknown",
      "alert_ids": ["SACHET-PB-2026-0881"],
      "details": "IMD Orange Alert for heavy to very heavy rain in Mohali"
    },
    "physical": {
      "c2_result": "pass | fail | unknown",
      "rainfall_mm": 64.5,
      "satellite_evidence": true,
      "details": "Open-Meteo recorded 64.5mm rainfall in past 3 hours"
    },
    "provenance": {
      "c3_result": "pass | fail | unknown",
      "recycled": false,
      "archive_match_score": 0.12,
      "details": "Image original, no duplicate found in archive"
    },
    "location": {
      "c4_result": "pass | fail | unknown",
      "contradictions": [],
      "details": "Text location matches geocoded district coordinates"
    },
    "corroboration": {
      "c5_result": "pass | fail | unknown",
      "independent_sources": 3,
      "details": "Corroborated by 3 independent reports within 5km and 60min"
    }
  },
  "score": 0.88,
  "verdict": "verified | review | rejected",
  "reasons": [
    "Corroborated by IMD heavy rainfall warning",
    "Physical rainfall 64.5mm in 3h confirms severe flood risk",
    "Original media verified with no archive match"
  ],
  "created_at": "2026-10-31T08:35:00Z",
  "updated_at": "2026-10-31T08:35:00Z"
}
```

---

## 2. Ingestion Decision Rules
1. **Relevance Threshold**: Only emit reports with `relevance_score > 0.7`.
2. **Coordinate Preservation**: Never invent coordinates. If missing, `lat` and `lon` remain `null`.
3. **UTC Normalization**: All timestamps stored strictly in ISO 8601 UTC.
4. **Media Preservation**: Always preserve media URLs for downstream image forensics.
5. **Fault Tolerance**: If any external API fails, gracefully fallback to cached snapshots or synthetic mock reports.

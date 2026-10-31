# NirikshakAI — Backend API Documentation & cURL Guide
## GroundTruth Architecture | Hour 6 M1 → M4 Handoff

The backend runs on `http://localhost:8000`.  
Interactive Swagger UI is accessible at `http://localhost:8000/docs`.

---

## 1. System Health Check

```bash
curl -X GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "NirikshakAI Ingest & Backend Core",
  "version": "1.0.0",
  "timestamp": "2026-10-31T08:30:00Z",
  "database": "sqlite_connected"
}
```

---

## 2. Ingest Single Report

Ingests a raw social post or official alert. Runs relevance scoring (`> 0.7`) and normalizes into `DisasterReport`.

```bash
curl -X POST http://localhost:8000/reports/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "citizen",
    "text": "Severe waterlogging outside Phase 8 Industrial Area Mohali! Water level rising fast, cars stuck.",
    "claimed_place": "Mohali, Punjab",
    "lat": 30.7046,
    "lon": 76.7179,
    "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5"
  }'
```

**Response:**
```json
{
  "status": "ingested",
  "is_new": true,
  "report_id": "r_a9b1c2d3",
  "relevance_score": 0.85,
  "verdict": "review",
  "score": 0.0
}
```

---

## 3. Retrieve Reports (With Multi-lane Filters)

### A. Get all verified reports:
```bash
curl -X GET "http://localhost:8000/reports?verdict=verified&limit=20"
```

### B. Get under review reports in Punjab:
```bash
curl -X GET "http://localhost:8000/reports?verdict=review&district=Mohali"
```

### C. Get all rejected reports (Proof trail inspections):
```bash
curl -X GET "http://localhost:8000/reports?verdict=rejected"
```

---

## 4. Retrieve Single Report with Evidence Proof Trail

```bash
curl -X GET http://localhost:8000/reports/r_0001
```

**Response includes full C1-C5 checks and audit reasons:**
```json
{
  "report_id": "r_0001",
  "source": {
    "platform": "sachet",
    "domain": "sachet.ndma.gov.in",
    "account": "ndma_india",
    "reputation": 0.95
  },
  "claim": {
    "hazard": "flood",
    "text": "Severe waterlogging at Sector 62, Mohali. Drainage overflow reported.",
    "claimed_place": "Sector 62, Mohali, Punjab",
    "claimed_time": "2026-10-31T08:15:00Z"
  },
  "media": [
    {
      "url": "https://images.unsplash.com/photo-1547683905-f686c993aae5",
      "phash": "hash_verified_0001",
      "archive_match": {"score": 0.05, "matched_id": "", "matched_date": ""}
    }
  ],
  "geo": {
    "lat": 30.7046,
    "lon": 76.7179,
    "radius_km": 5.0,
    "district": "SAS Nagar (Mohali)"
  },
  "checks": {
    "official": {
      "c1_result": "pass",
      "alert_ids": ["SACHET-PB-2026-0881"],
      "details": "Active IMD/SACHET warning"
    },
    "physical": {
      "c2_result": "pass",
      "rainfall_mm": 78.4,
      "satellite_evidence": true,
      "details": "78.4mm measured"
    },
    "provenance": {
      "c3_result": "pass",
      "recycled": false,
      "archive_match_score": 0.05,
      "details": "Media appears original"
    },
    "location": {
      "c4_result": "pass",
      "contradictions": [],
      "details": "Coordinates match text"
    },
    "corroboration": {
      "c5_result": "pass",
      "independent_sources": 4,
      "details": "Multi-source corroboration"
    }
  },
  "score": 0.91,
  "verdict": "verified",
  "reasons": [
    "Corroborated by active official alert SACHET-PB-2026-0881",
    "Physical weather sensor confirms 78.4mm rainfall in past 3h",
    "Original media verified with no recycled matches",
    "Geocoded location matches reported district"
  ]
}
```

---

## 5. Clustered Incidents & Dedup Operations (Agent 2 of 7)

### A. Run 3-Tier Dedup & DBSCAN Clustering
Runs exact matching (MD5), perceptual hashing (pHash), and semantic similarity on raw reports, then clusters them spatially and temporally into unified incidents:

```bash
curl -X POST "http://localhost:8000/dedup?eps_km=5.0&time_window_min=45"
```

**Response:**
```json
{
  "status": "success",
  "processed_count": 50,
  "unique_count": 32,
  "duplicate_count": 18,
  "incident_count": 12,
  "stats": {
    "total_processed": 50,
    "exact_duplicates": 12,
    "perceptual_duplicates": 4,
    "semantic_duplicates": 2,
    "total_duplicates": 18,
    "unique_incidents": 12,
    "clustered_incidents": 5,
    "single_report_incidents": 7
  },
  "incidents": [...]
}
```

### B. Retrieve All Incidents
```bash
curl -X GET "http://localhost:8000/incidents?priority=CRITICAL"
```

### C. Retrieve Only Clustered Incidents (Multi-Report Clusters)
```bash
curl -X GET "http://localhost:8000/incidents/clusters"
```

### D. Retrieve Single Incident with Member Reports (For Evidence Drawer)
```bash
curl -X GET "http://localhost:8000/incidents/INC-001"
```

### E. Retrieve Dedup Metrics
```bash
curl -X GET "http://localhost:8000/stats/dedup"
```

**Response:**
```json
[
  {
    "incident_id": "inc_mohali_flood_01",
    "title": "Severe Waterlogging & Inundation in SAS Nagar Mohali",
    "disaster_type": "flood",
    "district": "SAS Nagar (Mohali)",
    "lat": 30.7046,
    "lon": 76.7179,
    "source_count": 6,
    "confidence_score": 0.91,
    "priority": "HIGH",
    "status": "active",
    "operator_summary": "Flood reported near Phase 8 & Sector 62 (SAS Nagar). 6 independent reports, 91% confidence. Official alert: SACHET-PB active. Physical evidence: 78.4mm rainfall in 3h.",
    "cap_xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert ...>...</alert>"
  }
]
```

---

## 6. Trigger Multi-Source Live Ingestion

Polls SACHET, IMD, GDELT, Bluesky, Open-Meteo, and Mock generator:

```bash
curl -X POST http://localhost:8000/reports/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["sachet", "imd", "gdelt", "mock"],
    "mock_count": 25,
    "state_or_district": "Punjab"
  }'
```

---

## 7. Get Aggregated Analytics & Stats

```bash
curl -X GET http://localhost:8000/stats
```

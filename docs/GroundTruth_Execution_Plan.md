# GroundTruth: Execution Plan — NirikshakAI
## Graviton 2026 | PS #06 | CGC University Mohali | 4-Person | 24-Hour Hackathon

*Merged from user-provided GroundTruth research (31 Oct 2026) and team-specific workflow. Team: Lakshay, Tushar, Samanyu, Harsh.*

---

## 1. Optimized Problem Statement

**Problem.** During floods, cyclones and extreme rain, social platforms fill with recycled, mislocated and fake media. Control rooms cannot tell which reports are real, where they are, and whether they are current. Wrong reports waste response time. Missed real ones cost lives.

**Solution.** NirikshakAI is a multi-agent verification engine. It ingests signals from official feeds, physical data (rain, satellite), news and social media. Each report is tested against independent evidence. Only corroborated incidents reach the operator map, each with a proof trail. Verified clusters produce a draft alert in CAP (Common Alerting Protocol), the same format India's NDMA SACHET system uses.

**One-line pitch.** Every pin on the map has a proof trail, and every rejection shows why.

---

## 2. Team Assignments (Mapped to GroundTruth Roles)

| Member | Primary Role (GroundTruth) | Hours | Responsibilities |
|--------|---------------------------|-------|------------------|
| **Lakshay** | **Data & Geo** (Role 3) | M1: 0-8hrs, M4: 8-24hrs | Ingest Agent, Dedup Agent, Evidence Agent (data layer), backend API, database, caches/snapshots |
| **Tushar** | **Data & Geo** (Role 3) | M1: 0-8hrs, M3: 8-24hrs | Same as Lakshay during M1; then joins Samanyu in M3 for orchestration |
| **Samanyu (YOU)** | **Vision & Verification** (Role 2) | M2: 0-10hrs, M3: 10-24hrs | Forensics Agent, Geo Agent, seeded test set, evaluation metrics, vision models |
| **Harsh** | **Frontend & Pitch** (Role 4) | 0-24hrs | React + MapLibre frontend, evidence drawer, live updates, demo script, backup video. Lakshay joins at Hour 8 |

**Critical path:** M1 (Lakshay+Tushar) delivers backend + data layer first. Everything depends on it.

---

## 3. Hourly Workflow & Handoffs

```
HOUR 0-2:  ALL HANDS — SPEC + CONTRACTS + Repo setup
HOUR 2-8:  M1 (Lakshay+Tushar) → Backend + Ingest/Dedup/Evidence agents
HOUR 2-10: M2 (Samanyu) → Forensics/Geo agents + seeded test set
HOUR 6-8:  M1 → M4 handoff: APIs + mock data
HOUR 8-10: M4 (Harsh+Lakshay) → Frontend with real APIs
HOUR 8-24: M3 (Tushar+Samanyu) → Orchestrator + Judge + Dispatch + integration
HOUR 10:   M2 → M3 handoff: AI pipeline classes
HOUR 16:   M3 → M4 handoff: Agent endpoints + WebSocket
HOUR 16-24: ALL → Integration, polish, demo prep
```

### Detailed Hourly Breakdown

| Hour | Who | Task | Deliverable | Handoff To |
|------|-----|------|-------------|-------------|
| **0-1** | ALL | Architecture sync, clone repo, agree on report schema, create SPEC.md + CONTRACTS.md | `SPEC.md`, `CONTRACTS.md`, `models.py` | — |
| **1-3** | **Lakshay+Tushar (M1)** | FastAPI skeleton + SQLite/PostGIS setup + database models | Working API on `localhost:8000` with `/health` | — |
| **1-3** | **Samanyu (M2)** | Python env, install CLIP/imagehash/transformers, download MEDIC subset | `requirements.txt`, test script for pHash + CLIP | — |
| **1-3** | **Harsh (M4)** | React + Vite + MapLibre GL JS + Tailwind setup | Blank map with OpenFreeMap tiles | — |
| **3-6** | **Lakshay+Tushar (M1)** | Build CRUD endpoints + Ingest Agent (SACHET, IMD, GDELS, GDELT) + Dedup Agent | `/ingest`, `/reports`, `/incidents` working, 50 mock reports | **→ M4 (Harsh)** at Hour 6 |
| **3-6** | **Samanyu (M2)** | Build Forensics Agent (pHash + CLIP + Gemini VLM) + Geo Agent (NER + geocoding) | `forensics_agent.py`, `geo_agent.py` with unit tests | — |
| **3-6** | **Harsh (M4)** | Build map shell + incident pin layer + satellite layer (NASA GIBS) | Map with satellite overlay + 50 random pins | — |
| **6-8** | **Lakshay→M4** | Help Harsh connect real APIs, build verification queue UI | Dashboard fetches from `/reports` | — |
| **6-8** | **Tushar (M1)** | Finish Evidence Agent (C1, C2 checks) + caching layer | `evidence_agent.py` with Open-Meteo + SACHET integration | — |
| **6-10** | **Samanyu (M2)** | Build seeded test set (60 reports, labeled) + evaluation script | `seeded_test_set.json`, `evaluate.py` | **→ M3 (Tushar+Samanyu)** at Hour 10 |
| **8-10** | **Harsh+Lakshay (M4)** | Build evidence drawer + analytics charts + filters | Click pin → shows checks, reasons, media | — |
| **8-12** | **Tushar+Samanyu (M3)** | Build Orchestrator Agent (LangGraph state machine) + Judge Agent (scoring + verdict) | `orchestrator.py`, `judge_agent.py` | — |
| **10-12** | **Samanyu** | Integrate M2 AI pipeline into M3 agents | Agent tools call Forensics/Geo agents | — |
| **12-14** | **Tushar+Samanyu (M3)** | Build Dispatch Agent (CAP 1.2 alert drafting) + Evidence Agent completion | `dispatch_agent.py`, full C1-C6 pipeline | — |
| **14-16** | **Tushar+Samanyu (M3)** | End-to-end integration: raw reports → final verdicts | Pipeline runs on seeded test set | **→ M4 (Harsh+Lakshay)** at Hour 16 |
| **16-18** | **ALL** | Integration testing: M3 agents → M4 dashboard via WebSocket | End-to-end working, live map updates | — |
| **18-20** | **Harsh+Lakshay (M4)** | Dashboard polish: animations, loading states, error handling, time slider | Production-ready UI | — |
| **18-20** | **Tushar+Samanyu (M3)** | Agent tracing UI: show LangGraph workflow + reasoning chains | Agent graph visualization | — |
| **20-22** | **ALL** | Demo script creation + slide deck + backup video | 3-minute demo, 5-slide pitch, recorded fallback | — |
| **22-24** | **ALL** | Rehearsal + bug fixes + final tuning on seeded set | Ready to present |

---

## 4. Agent Prompts (Copy-Paste Ready)

*Based on GroundTruth's 7-agent architecture, adapted for LangGraph implementation by Tushar+Samanyu (M3).*

### Agent 1: Ingest Agent

```python
# agents/ingestion_agent.py

INGESTION_AGENT_PROMPT = """You are the Ingest Agent for NirikshakAI.

## YOUR ROLE
You poll multiple official and public data sources during active disasters and normalize everything into the standard DisasterReport schema.

## YOUR TOOLS
- `fetch_sachet_alerts(state)`: Fetch NDMA SACHET CAP RSS alerts for a state
- `fetch_imd_alerts(district)`: Fetch IMD district warnings and nowcast
- `fetch_gdacs_alerts()`: Fetch GDACS global disaster alerts (GeoJSON/CAP)
- `fetch_gdelt_news(keywords, hours)`: Fetch GDELT DOC 2.0 news articles
- `fetch_openmeteo_rainfall(lat, lon, hours)`: Fetch historical rainfall from Open-Meteo
- `fetch_youtube_disaster_videos(keywords)`: Search YouTube Data API for disaster videos
- `fetch_bluesky_posts(keywords)`: Fetch public posts from Bluesky Jetstream
- `fetch_indian_news_rss()`: Fetch trusted Indian news RSS feeds
- `normalize_report(raw_data, source)`: Convert to standard schema
- `classify_relevance(text, image)`: Score disaster relevance (0-1)
- `emit_report(report)`: Emit to message bus

## SOURCE PRIORITY
1. Official: SACHET, IMD, GDACS (highest trust)
2. Physical: Open-Meteo rainfall, NASA satellite
3. News: GDELT, Indian RSS
4. Social: Bluesky, YouTube (supplementary only)

## OUTPUT SCHEMA
{
  "report_id": "r_0192",
  "source": {"platform": "sachet|imd|gdacs|gdelt|news|bluesky|youtube", "domain": "", "account": "", "reputation": 0.62},
  "claim": {"hazard": "flood|fire|storm|heatwave|earthquake|unknown", "text": "", "claimed_place": "", "claimed_time": ""},
  "media": [{"url": "", "phash": "", "archive_match": {"score": 0.0, "matched_id": "", "matched_date": ""}, "exif": {"gps": null, "datetime": null}}],
  "geo": {"lat": 0, "lon": 0, "radius_km": 5, "method": "text_geocode|vlm_landmark|exif", "confidence": 0.0, "district": ""},
  "checks": {"official": {}, "physical": {}, "provenance": {}, "location": {}, "corroboration": {}},
  "score": 0.0,
  "verdict": "verified|review|rejected",
  "reasons": []
}

## DECISION RULES
1. Only emit reports with relevance_score > 0.7
2. Preserve all media URLs for downstream forensics
3. Set lat/lon to null if missing — do NOT guess
4. timestamp must be ISO8601 UTC
5. disaster_type can be "unknown" — downstream agents will classify
"""
```

### Agent 2: Dedup Agent

```python
# agents/dedup_agent.py

DEDUP_AGENT_PROMPT = """You are the Dedup Agent for NirikshakAI.

## YOUR ROLE
You merge duplicate and syndicated reports and cluster nearby ones into incidents.

## YOUR TOOLS
- `exact_match(report)`: MD5 hash exact match against archive
- `perceptual_match(report)`: pHash with Hamming distance ≤ 8
- `semantic_match(report)`: CLIP embedding cosine similarity ≥ 0.92
- `cluster_reports(reports)`: DBSCAN clustering on lat/lon + timestamp
- `merge_reports(primary_id, duplicate_ids)`: Merge into single incident
- `emit_incident(incident)`: Pass clustered incident downstream

## DUPLICATE DETECTION RULES

### TIER 1: Exact Match
- Compute MD5 of image_url or text hash
- If exact match found: mark as duplicate, type="exact", stop processing

### TIER 2: Perceptual Hash
- Compute pHash using imagehash library
- Hamming distance ≤ 8: mark as duplicate, type="perceptual"
- Distance 9-15: flag for Tier 3 review

### TIER 3: Semantic Similarity (CLIP)
- Encode image using openai/clip-vit-base-patch32
- FAISS search, cosine similarity ≥ 0.92: mark as duplicate, type="semantic"
- Similarity 0.85-0.92: flag as "likely_duplicate" for human review

### DBSCAN CLUSTERING
- Cluster by: lat/lon (5km radius) + timestamp (30min window)
- Groups with ≥ 2 reports: merge into single incident, boost confidence by 15%
- Outliers: keep as individual incidents

## OUTPUT
Emit Incident objects with:
- id, report_ids (list), lat, lon, disaster_type, confidence_score, duplicate_of (if any)
"""
```

### Agent 3: Forensics Agent

```python
# agents/forensics_agent.py

FORENSICS_AGENT_PROMPT = """You are the Forensics Agent for NirikshakAI.

## YOUR ROLE
You perform C3 (Provenance) checks: recycled-media detection, EXIF analysis, and archive matching.

## YOUR TOOLS
- `compute_phash(image_url)`: Compute perceptual hash
- `compute_clip_embedding(image_url)`: Compute CLIP embedding
- `search_archive_by_phash(phash)`: Search archived disaster images by pHash
- `search_archive_by_clip(embedding)`: Search archive by semantic similarity
- `parse_exif(image_url)`: Extract EXIF GPS, datetime, camera info
- `gemini_vlm_analysis(image_url, prompt)`: Use Gemini Flash to analyze image content, landmarks, text
- `google_vision_web_detection(image_url)`: Find web pages with matching images (first 1k/month free)
- `emit_forensics_report(report_id, findings)`: Pass findings to Evidence Agent

## PROVENANCE CHECKS

### C3A: Recycled Media Detection
1. Compute pHash of incoming image
2. Search archive for Hamming distance ≤ 8
3. If match found: flag as "recycled", record matched_id and matched_date
4. If no pHash match: compute CLIP embedding, search archive for cosine similarity ≥ 0.92
5. If CLIP match: flag as "likely_recycled", record similarity score

### C3B: EXIF Analysis
1. Parse EXIF data from image
2. If GPS coordinates exist: extract lat/lon, compare with claimed location
3. If datetime exists: compare with claimed time
4. If EXIF missing or stripped: flag as "no_exif", reduce location confidence by 0.1

### C3C: Vision-Language Analysis
1. Use Gemini Flash VLM to describe image content
2. Extract landmarks, shop signs, language scripts, vehicle plates
3. Pass extracted text/landmarks to Geo Agent for location verification

## OUTPUT
Emit ForensicsReport with:
- report_id, phash, archive_match (bool, score, matched_id, matched_date), exif_data, vlm_descriptions, reasons
"""
```

### Agent 4: Geo Agent

```python
# agents/geo_agent.py

GEO_AGENT_PROMPT = """You are the Geo Agent for NirikshakAI.

## YOUR ROLE
You perform C4 (Location) checks: place extraction, geocoding, and landmark verification.

## YOUR TOOLS
- `extract_places_nlp(text)`: Extract location names using spaCy/IndicNER
- `geocode_place(place_name)`: Geocode using Open-Meteo geocoding API
- `verify_location_vlm(image_analysis)`: Cross-reference VLM-extracted landmarks with claimed location
- `verify_location_exif(exif_gps, claimed_lat, claimed_lon)`: Compare EXIF GPS with claimed location
- `distance_km(lat1, lon1, lat2, lon2)`: Calculate geodesic distance
- `assign_district(lat, lon)`: Map lat/lon to Indian district using offline gazetteer
- `emit_geo_report(report_id, geo_findings)`: Pass findings to Evidence Agent

## LOCATION CHECKS

### C4A: Text-Based Geocoding
1. Extract place names from report text using NER
2. Geocode extracted places using Open-Meteo (cache results)
3. Compare geocoded coordinates with claimed lat/lon (if exists)
4. If distance > 20km: flag as "location_mismatch"

### C4B: VLM Landmark Verification
1. Receive VLM-extracted landmarks from Forensics Agent
2. Search for landmarks in claimed district
3. If landmarks belong to different district: flag as "wrong_location"

### C4C: EXIF GPS Verification
1. If EXIF GPS exists: compare with claimed coordinates
2. If distance > 5km: flag as "exif_mismatch"
3. If EXIF matches claimed location: confidence += 0.2

### C4D: District Assignment
1. Assign report to Indian district using lat/lon binning
2. Use pre-downloaded India districts GeoJSON
3. Store district name for cross-referencing with official alerts

## OUTPUT
Emit GeoReport with:
- report_id, extracted_places, geocoded_lat, geocoded_lon, district, location_confidence, contradictions, reasons
"""
```

### Agent 5: Evidence Agent

```python
# agents/evidence_agent.py

EVIDENCE_AGENT_PROMPT = """You are the Evidence Agent for NirikshakAI.

## YOUR ROLE
You perform C1 (Official) and C2 (Physical) checks: cross-referencing with official alerts and physical data.

## YOUR TOOLS
- `check_official_alerts(district, hazard, time_window_hours)`: Search SACHET, IMD, GDACS for matching alerts
- `check_rainfall(lat, lon, claimed_time, window_hours)`: Fetch Open-Meteo historical rainfall
- `check_satellite(lat, lon, claimed_time)`: Check NASA GIBS satellite imagery for water extent
- `cross_reference_claim(claim, official_data)`: Compare social claim with official data
- `detect_contradiction(social_report, official_report)`: Flag conflicts
- `emit_evidence_report(report_id, checks)`: Pass evidence to Judge Agent

## OFFICIAL CHECK (C1)
1. Search SACHET RSS for district-level CAP alerts
2. Search IMD district warnings and nowcast
3. Search GDACS for regional alerts
4. If active alert matches hazard + district ±24h: C1 = "pass", confidence += 0.3
5. If alert contradicts claim (e.g., IMD says "no rainfall" but claim is "flood"): C1 = "fail", flag contradiction
6. If no alert found: C1 = "unknown"

## PHYSICAL CHECK (C2)
1. Fetch Open-Meteo historical rainfall for claimed lat/lon and time
2. If rainfall > 50mm in 3 hours: C2 = "pass" for flood claims, confidence += 0.25
3. If rainfall < 10mm and claim is "flood": C2 = "fail", flag contradiction
4. If satellite imagery shows water extent increase: C2 = "pass", confidence += 0.2
5. If no physical data available: C2 = "unknown"

## OUTPUT
Emit EvidenceReport with:
- report_id, c1_official (pass/fail/unknown + alert_ids), c2_physical (pass/fail/unknown + rainfall_mm), contradictions, reasons
"""
```

### Agent 6: Judge Agent

```python
# agents/judge_agent.py

JUDGE_AGENT_PROMPT = """You are the Judge Agent for NirikshakAI.

## YOUR ROLE
You perform C5 (Corroboration) and C6 (Source Reputation) checks, then assign final scores and verdicts.

## YOUR TOOLS
- `count_independent_sources(report)`: Count independent sources within radius/time window
- `check_source_reputation(domain)`: Look up learned reputation score for source
- `calculate_score(report, checks)`: Compute final score using weighted formula
- `assign_verdict(score, hard_fails)`: Determine verified/review/rejected
- `generate_reasons(checks, score)`: Generate human-readable explanation
- `emit_verdict(report)`: Send final verdict to Dispatch Agent

## SCORING FORMULA
```
score = 0.30 * official + 0.25 * physical + 0.20 * corroboration + 0.15 * provenance + 0.10 * location
```
Then adjust by source reputation: ±0.10 based on past track record.

## VERDICT RULES
- **verified:** score ≥ 0.75 AND (C1 = "pass" OR C2 = "pass")
  - Social-only claims can NEVER auto-verify
- **review:** 0.40 ≤ score < 0.75
- **rejected:** score < 0.40 OR any hard fail (confirmed recycled match, location contradiction)

## HARD FAILS (auto-reject)
- Confirmed recycled media (archive match score ≥ 0.93)
- Location contradiction (EXIF/VLM shows different place, distance > 50km)
- Official data contradicts claim (IMD says "no flood" but claim is "flooding")

## REASON GENERATION
Generate plain-language reasons for every verdict:
- "Verified: 3 independent sources, corroborated by IMD alert, rainfall 65mm in 3h"
- "Rejected: Recycled image from March 2023 floods (archive match 0.93)"
- "Review: Only 1 source, no official alert, location not verified"

## OUTPUT
Emit FinalVerdict with:
- report_id, score, verdict, reasons, checks_summary, source_reputation
"""
```

### Agent 7: Dispatch Agent

```python
# agents/dispatch_agent.py

DISPATCH_AGENT_PROMPT = """You are the Dispatch Agent for NirikshakAI.

## YOUR ROLE
You draft CAP 1.2 alerts for verified clusters and generate operator summaries. A human approves — the system never sends.

## YOUR TOOLS
- `group_into_clusters(verified_incidents)`: Group nearby verified incidents within 5km + 1hr
- `draft_cap_alert(cluster)`: Generate CAP 1.2 XML draft
- `generate_operator_summary(cluster)`: Create 1-paragraph summary for control room
- `emit_alert_draft(alert)`: Send to admin panel for human approval

## CLUSTERING RULES
1. Group verified incidents within 5km radius and 1-hour time window
2. Each cluster becomes a "Parent Incident" with:
   - Combined confidence score (average of members)
   - List of source IDs
   - Representative lat/lon (centroid)
   - Disaster type (majority vote)
3. Clusters with ≥ 5 reports: auto-escalate to "CRITICAL" priority

## CAP 1.2 ALERT FORMAT
Generate XML following CAP 1.2 standard:
```xml
<alert>
  <identifier>NirikshakAI-{uuid}</identifier>
  <sender>NirikshakAI</sender>
  <sent>{timestamp}</sent>
  <info>
    <area>
      <polygon>{lat1},{lon1} {lat2},{lon2} ...</polygon>
    </area>
    <event>{disaster_type}</event>
    <severity>{severity}</severity>
    <certainty>{certainty}</certainty>
    <description>{operator_summary}</description>
  </info>
</alert>
```

## OPERATOR SUMMARY FORMAT
"{disaster_type} reported near {location} ({district}). {source_count} independent reports, {confidence}% confidence. Official alert: {alert_status}. Physical evidence: {rainfall}mm rainfall in 3h. {priority} priority."

## OUTPUT
Emit AlertDraft with:
- alert_id, cluster_id, cap_xml, operator_summary, priority, incident_ids
"""
```

### Orchestrator Prompt (LangGraph)

```python
# agents/orchestrator.py

ORCHESTRATOR_PROMPT = """You are the Orchestrator for NirikshakAI's multi-agent verification pipeline.

## YOUR ROLE
You coordinate 7 specialized agents to transform chaotic social media into verified disaster intelligence.

## WORKFLOW
```
[Official Feeds + Physical Data + News + Social]
         ↓
   [INGEST AGENT]
   - Poll SACHET, IMD, GDACS, GDELT, RSS, Bluesky, YouTube
   - Normalize to DisasterReport schema
   - Filter relevance (score > 0.7)
         ↓
   [DEDUP AGENT]
   - Exact match → pHash → CLIP similarity
   - DBSCAN clustering for bulk dedup
   - Merge into incidents
         ↓
   [FORENSICS AGENT]
   - C3: Recycled media detection (pHash + CLIP + Gemini VLM)
   - EXIF analysis
   - Archive matching
         ↓
   [GEO AGENT]
   - C4: Place extraction (NER), geocoding
   - VLM landmark verification
   - District assignment
         ↓
   [EVIDENCE AGENT]
   - C1: Official alert cross-reference (SACHET, IMD, GDACS)
   - C2: Physical data check (Open-Meteo rainfall, NASA satellite)
         ↓
   [JUDGE AGENT]
   - C5: Corroboration count (independent sources)
   - C6: Source reputation scoring
   - Final score + verdict + reasons
         ↓
   [DISPATCH AGENT]
   - Cluster verified incidents
   - Draft CAP 1.2 alerts
   - Generate operator summaries
         ↓
   [GIS DASHBOARD]
   - Three lanes: Verified, Under review, Rejected
   - Evidence drawer per pin
   - Time slider + satellite layer
```

## STATE MANAGEMENT
Use LangGraph's StateGraph with this state schema:
```python
class AgentState(TypedDict):
    raw_reports: list[DisasterReport]
    incidents: Annotated[list, operator.add]
    forensics_reports: Annotated[list, operator.add]
    geo_reports: Annotated[list, operator.add]
    evidence_reports: Annotated[list, operator.add]
    verdicts: Annotated[list, operator.add]
    alert_drafts: Annotated[list, operator.add]
    errors: Annotated[list, operator.add]
```

## ERROR HANDLING
- If any agent fails: log error, skip that report, continue pipeline
- Never crash the entire pipeline for one bad report
- All verdicts must include reasons — no black-box decisions

## OUTPUT
Final output: list of FinalVerdict objects + AlertDraft objects sent to dashboard via WebSocket.
"""
```

---

## 5. Verification Engine (C1-C6 Checks)

### Check Definitions

| Check | Name | What It Does | Data Sources |
|-------|------|--------------|--------------|
| **C1** | Official | Is there an active SACHET, IMD or GDACS alert covering that district within ±24h? | SACHET RSS, IMD API, GDACS |
| **C2** | Physical | Does rainfall at claimed place/time support the hazard claim? | Open-Meteo, IMD rainfall, NASA GIBS |
| **C3** | Provenance | Is this recycled media? Check pHash, CLIP, EXIF, VLM | imagehash, CLIP, Gemini VLM, Google Vision |
| **C4** | Location | Does the claimed location match text NER, VLM landmarks, EXIF GPS? | spaCy/IndicNER, Open-Meteo geocode, Gemini VLM |
| **C5** | Corroboration | Do ≥2 independent sources confirm within radius+time window? | All sources, domain/account independence |
| **C6** | Source Reputation | Has this source been reliable in the past? | Learned reputation scores |

### Scoring Formula

```
score = 0.30 * official + 0.25 * physical + 0.20 * corroboration + 0.15 * provenance + 0.10 * location
```

Then adjust by source reputation: ±0.10 based on past track record.

### Verdict Rules

| Verdict | Condition |
|---------|-----------|
| **verified** | score ≥ 0.75 AND (C1 = "pass" OR C2 = "pass") |
| **review** | 0.40 ≤ score < 0.75 |
| **rejected** | score < 0.40 OR any hard fail |

**Hard fails (auto-reject):**
- Confirmed recycled media (archive match score ≥ 0.93)
- Location contradiction (EXIF/VLM shows different place, distance > 50km)
- Official data contradicts claim (IMD says "no flood" but claim is "flooding")

---

## 6. Report Schema (Agree in Hour 1)

```json
{
  "report_id": "r_0192",
  "source": {
    "platform": "sachet|imd|gdacs|gdelt|news|bluesky|youtube",
    "domain": "",
    "account": "",
    "reputation": 0.62
  },
  "claim": {
    "hazard": "flood|fire|storm|heatwave|earthquake|unknown",
    "text": "",
    "claimed_place": "",
    "claimed_time": ""
  },
  "media": [
    {
      "url": "",
      "phash": "",
      "archive_match": {
        "score": 0.93,
        "matched_id": "",
        "matched_date": ""
      },
      "exif": {
        "gps": null,
        "datetime": null
      }
    }
  ],
  "geo": {
    "lat": 0,
    "lon": 0,
    "radius_km": 5,
    "method": "text_geocode|vlm_landmark|exif",
    "confidence": 0.0,
    "district": ""
  },
  "checks": {
    "official": {
      "c1_result": "pass|fail|unknown",
      "alert_ids": []
    },
    "physical": {
      "c2_result": "pass|fail|unknown",
      "rainfall_mm": 0,
      "satellite_evidence": false
    },
    "provenance": {
      "c3_result": "pass|fail|unknown",
      "recycled": false,
      "archive_match_score": 0.0
    },
    "location": {
      "c4_result": "pass|fail|unknown",
      " contradictions": []
    },
    "corroboration": {
      "c5_result": "pass|fail|unknown",
      "independent_sources": 0
    }
  },
  "score": 0.0,
  "verdict": "verified|review|rejected",
  "reasons": []
}
```

---

## 7. Tech Stack

### Backend
| Component | Technology | Why |
|-----------|-----------|-----|
| **Framework** | FastAPI (Python) | Async, auto-documentation, WebSocket support |
| **Database** | SQLite + Shapely (hackathon) / PostGIS (production) | Zero-config for 24hrs; spatial queries |
| **Task Queue** | asyncio + background tasks | Simple, no Redis needed for 24hrs |
| **Cache** | In-memory dict + disk JSON snapshots | Fast, persistent across restarts |

### AI/Agents
| Component | Technology | Why |
|-----------|-----------|-----|
| **Orchestration** | LangGraph | Visual agent graph, state management |
| **LLM** | Gemini Flash (free tier) | Free VLM for image analysis + text |
| **Vision** | CLIP (openai/clip-vit-base-patch32) | Zero-shot classification + embeddings |
| **Hashing** | imagehash (pHash, dHash) | Perceptual hashing for recycled media |
| **NLP** | spaCy + IndicNER | Place extraction, multilingual support |
| **Clustering** | scikit-learn DBSCAN | Bulk duplicate grouping |

### Frontend
| Component | Technology | Why |
|-----------|-----------|-----|
| **Framework** | React 18 + Vite | Fast setup, familiar |
| **Maps** | MapLibre GL JS | No API key needed, open-source |
| **Base Tiles** | OpenFreeMap vector tiles | Free, no key required |
| **Satellite** | NASA GIBS WMTS tiles | Free, daily refresh |
| **Charts** | Recharts | Simple, React-native |
| **Styling** | Tailwind CSS | Rapid UI development |

### Data Sources (Free Tier)

| Source | Access | Limits | Role |
|--------|--------|--------|------|
| **NDMA SACHET RSS** | Public RSS, no key | No known limits | Official alerts (C1) |
| **IMD Mausam APIs** | Key-based, register at api.imd.gov.in | Varies | Official checks + rainfall |
| **GDACS** | Free, no key | Rate-limited | Global disaster alerts |
| **GDELT DOC 2.0** | No key | Rolling 3-month window | News corroboration (C5) |
| **Open-Meteo** | No key | 600 calls/min, 10k/day | Rainfall + geocoding (C2) |
| **NASA GIBS** | Free, no key | No known limits | Satellite imagery layer |
| **Gemini API** | Free tier (Flash) | Low rate limits | VLM for landmark reading (C3) |
| **Google Cloud Vision** | First 1k units/month free | Requires billing account | Web detection for archive matching |
| **Bluesky Jetstream** | Keyless WebSocket | No server-side filter | Live social feed (Tier 3) |
| **YouTube Data API** | Free tier | 10k units/day (~100 searches) | Disaster videos |

---

## 8. 24-Hour Timeline (Detailed)

### Phase 1: Foundation (Hours 0-6)

| Hour | Who | Task | Deliverable |
|------|-----|------|-------------|
| **0-1** | ALL | Architecture sync, clone repo, agree on report schema, create SPEC.md + CONTRACTS.md | `SPEC.md`, `CONTRACTS.md`, `models.py` |
| **1-3** | **Lakshay+Tushar** | FastAPI + SQLite + Shapely setup + Pydantic models | Working API with `/health` endpoint |
| **1-3** | **Samanyu** | Python env + CLIP/imagehash/transformers + download MEDIC subset | `requirements.txt`, test script |
| **1-3** | **Harsh** | React + Vite + MapLibre + Tailwind + OpenFreeMap tiles | Blank map with satellite layer |
| **3-6** | **Lakshay+Tushar** | Build CRUD endpoints + Ingest Agent (SACHET, IMD, RSS) + 50 mock reports | `/ingest`, `/reports` working, mock data in DB |
| **3-6** | **Samanyu** | Build Forensics Agent (pHash + CLIP) + Geo Agent (NER + geocoding) | `forensics_agent.py`, `geo_agent.py` with tests |
| **3-6** | **Harsh** | Build map layers: pins, clusters, satellite overlay | Map showing 50 random pins + NASA GIBS |

### Phase 2: Core AI (Hours 6-10)

| Hour | Who | Task | Deliverable |
|------|-----|------|-------------|
| **6-8** | **Lakshay→M4** | Help Harsh connect real APIs, build verification queue UI | Dashboard fetches from `/reports` |
| **6-8** | **Tushar (M1)** | Finish Evidence Agent (C1 + C2) + caching layer | `evidence_agent.py` with Open-Meteo + SACHET |
| **6-10** | **Samanyu (M2)** | Build seeded test set (60 labeled reports) + evaluation script | `seeded_test_set.json`, `evaluate.py` |
| **8-10** | **Harsh+Lakshay (M4)** | Build evidence drawer + analytics charts | Click pin → shows checks + reasons |
| **8-10** | **Lakshay (M4)** | Polish map: filters, time slider, alert polygons | Interactive map with IMD districts |

### Phase 3: Agentic Integration (Hours 10-16)

| Hour | Who | Task | Deliverable |
|------|-----|------|-------------|
| **10-12** | **Tushar+Samanyu (M3)** | Build Orchestrator Agent (LangGraph) + Judge Agent (scoring + verdict) | `orchestrator.py`, `judge_agent.py` |
| **10-12** | **Samanyu** | Integrate M2 AI pipeline into M3 agents | Agent tools call Forensics/Geo agents |
| **12-14** | **Tushar+Samanyu (M3)** | Build Dispatch Agent (CAP 1.2 alerts) + Evidence Agent completion | `dispatch_agent.py`, full C1-C6 pipeline |
| **14-16** | **Tushar+Samanyu (M3)** | End-to-end integration: raw → final verdicts | Pipeline runs on seeded test set |
| **14-16** | **Harsh+Lakshay (M4)** | Add WebSocket for live updates + agent graph visualization | Live map updates + LangGraph viz |

### Phase 4: Polish & Demo (Hours 16-24)

| Hour | Who | Task | Deliverable |
|------|-----|------|-------------|
| **16-18** | **ALL** | Integration testing: M3 agents → M4 dashboard | End-to-end working |
| **18-20** | **Harsh+Lakshay (M4)** | Dashboard polish: animations, loading states, error handling | Production-ready UI |
| **18-20** | **Tushar+Samanyu (M3)** | Agent tracing UI: reasoning chains | LangGraph visualization |
| **20-22** | **ALL** | Demo script + slide deck + backup video | 3-minute demo, pitch deck |
| **22-24** | **ALL** | Rehearsal + bug fixes + final tuning | Ready to present |

---

## 9. Critical Handoff Checklist

### M1 → M4 (Hour 6)
Lakshay+Tushar give Harsh+Lakshay:
- [ ] `http://localhost:8000/docs` (Swagger UI) working
- [ ] `POST /ingest` accepts DisasterReport JSON
- [ ] `GET /reports` returns list of reports
- [ ] `GET /incidents` returns aggregated incidents
- [ ] 50+ mock reports in database
- [ ] Sample cURL commands in `docs/API.md`

### M1 → M3 (Hour 8)
Lakshay+Tushar give Tushar+Samanyu:
- [ ] `ingestion.py` with `fetch_sachet()`, `fetch_imd()`, `fetch_mock()`
- [ ] `evidence_agent.py` with C1 + C2 checks
- [ ] Event schema: data structure agents receive
- [ ] `models.py` with all Pydantic schemas

### M2 → M3 (Hour 10)
Samanyu gives Tushar+Samanyu:
- [ ] `DuplicateDetector` / `ForensicsAgent` class with `process_report()`
- [ ] `LocationVerifier` / `GeoAgent` class with `verify()`
- [ ] `seeded_test_set.json` (60 labeled reports)
- [ ] `evaluate.py` script
- [ ] Unit tests passing

### M3 → M4 (Hour 16)
Tushar+Samanyu give Harsh+Lakshay:
- [ ] `POST /verify` triggers full agent pipeline
- [ ] `WS /ws` streams real-time verification updates
- [ ] GeoJSON schema for map consumption
- [ ] Priority levels: "LOW", "MEDIUM", "HIGH", "CRITICAL"
- [ ] Sample WebSocket messages in `docs/API.md`

---

## 10. Data Sources (Priority Order)

### Tier 0: Official Alerts (Ground Truth)
| Source | Access | Hackathon Role |
|--------|--------|----------------|
| **NDMA SACHET RSS** | Public, no key | Primary official check (C1). CAP 1.2 format reference |
| **IMD Mausam APIs** | Register at api.imd.gov.in | Official alerts + observed rainfall |
| **GDACS** | Free, no key | Global flood/cyclone alerts, GeoJSON polygons |

### Tier 1: Physical Evidence
| Source | Access | Hackathon Role |
|--------|--------|----------------|
| **Open-Meteo** | No key, 600 calls/min | Core physical check (C2): rainfall at claimed place/time |
| **NASA GIBS** | Free, no key | Satellite layer + time slider on map |
| **Copernicus Data Space** | Free account, 10k units/month | Pre-compute flood extent for demo region |

### Tier 2: News
| Source | Access | Hackathon Role |
|--------|--------|----------------|
| **GDELT DOC 2.0** | No key | Primary news feed, corroboration (C5) |
| **Indian News RSS** | Free public RSS | Trusted outlets allowlist |

### Tier 3: Social (Supplementary Only)
| Source | Access | Hackathon Role |
|--------|--------|----------------|
| **Bluesky Jetstream** | Keyless WebSocket | Live social demo feed (filter in code) |
| **YouTube Data API** | Free tier, 10k units/day | Disaster videos, ~100 searches/day |
| **Hand-collected images** | Manual collection | 30-50 Indian flood/rain images for demo |

**NOT recommended for 24hrs:**
- Reddit (new access closed/weeks-long approval)
- Instagram (business verification required)
- X/Twitter (free read access removed)

---

## 11. Frontend Architecture

### Stack
- **React 18** + Vite
- **MapLibre GL JS** + OpenFreeMap tiles (no API key)
- **NASA GIBS** satellite overlay
- **Recharts** for analytics
- **Tailwind CSS** for styling

### Map Layers (Bottom to Top)

| Layer | Source | Purpose |
|-------|--------|---------|
| **Base** | OpenFreeMap vector tiles | Street map, no API key |
| **Satellite** | NASA GIBS WMTS | Satellite imagery with date slider |
| **Alert Polygons** | SACHET CAP + IMD districts | Color-coded severity (green/yellow/orange/red) |
| **Rain Layer** | Open-Meteo grid | Heat/circle layer showing rainfall intensity |
| **Incident Pins** | Your verified/review/rejected incidents | Clustered at low zoom, color-coded by lane |
| **Evidence Drawer** | Click pin interaction | Shows media, checks, reasons, official alert ID |

### Key Components
```
frontend/src/components/
├── DisasterMap.jsx          # MapLibre map with all layers
├── IncidentPanel.jsx        # Sidebar with incident details
├── EvidenceDrawer.jsx       # Check results + reasons per pin
├── VerificationQueue.jsx    # Pending reports list
├── AnalyticsCharts.jsx      # Time series + breakdowns
├── AgentGraph.jsx           # LangGraph visualization
├── AdminPanel.jsx           # Filters + bulk actions
└── AlertDraft.jsx           # CAP alert preview + approve button
```

### Why MapLibre over Mapbox/deck.gl
- **No API key required** (OpenFreeMap tiles)
- **Lighter weight** for 24-hour build
- **Official NASA GIBS examples** available
- **Leaflet fallback** if MapLibre gives trouble (switch rather than fight)

---

## 12. Pre-Event Prep (If Rules Allow)

| Task | Owner | Timeline |
|------|-------|----------|
| Create Copernicus Data Space account | Samanyu | 1 week before |
| Register for MOSDAC account | Samanyu | 1 week before (approval takes time) |
| Get Gemini API key | Samanyu | 1 day before |
| Enable Cloud billing for Vision Web Detection | Samanyu | Optional, 1 day before |
| Create YouTube Data API key | Lakshay | 1 day before |
| Start cron job for SACHET/IMD/GDACS/GDELT snapshots | Tushar | 3 days before |
| Download MEDIC/CrisisMMD subset | Samanyu | 3 days before |
| Download India districts GeoJSON | Harsh | 1 day before |
| Hand-collect 30-50 Indian disaster images | ALL | 3 days before |
| Build and label seeded test set (60 reports) | Samanyu | 1 day before |
| Test map stack end-to-end | Harsh | 1 day before |

---

## 13. Demo Script (3 Minutes)

### 1. Problem (20s)
Show a viral flood clip. Ask: *"Is it real? Where? Is it now?"*

### 2. Live Map (30s)
Feeds arriving, pins in three lanes (Verified/Under review/Rejected), satellite and alert layers on.

### 3. Catch #1: Recycled Media (30s)
A reel claiming today's flood. Side-by-side with older matching image and date. **Rejected.**

### 4. Catch #2: Wrong Place (30s)
Claims one city, VLM reads landmarks from another. **Rejected with reason.**

### 5. Verified Cluster (40s)
Several reports in one district, active official alert, rainfall chart, satellite layer. Open evidence drawer.

### 6. Dispatch (20s)
One click generates CAP alert draft for human approval.

### 7. Numbers + Close (10s)
Report precision, recall and time-to-verdict measured on seeded set. Roadmap.

---

## 14. Risks, Ethics & Licensing

| Risk | Mitigation |
|------|------------|
| **Feed/API down on demo day** | Cached snapshots + replay mode. Say "replay of live data" honestly |
| **Rate limits** | Cache everything, batch Open-Meteo calls, budget YouTube searches |
| **Wrong "verified" verdict causes harm** | Show confidence + reasons. Human approves every alert. Social-only never auto-verifies |
| **Privacy** | Public posts only, minimal fields, no personal profiling, no doxxing |
| **Terms of service** | Official APIs + hand-collected samples + open datasets only |
| **Dataset licenses** | MEDIC is CC BY-NC-SA (non-commercial). Fine for hackathon |
| **Open-Meteo** | Non-commercial only, credit CC BY 4.0 |
| **Gemini free tier** | Send only public media |
| **Overclaiming** | Present demo numbers only from measured seeded set |

---

## 15. Project Structure

```
F:\CGC\disasterwatch-ai\
├── README.md
├── SPEC.md                    # Agreed schema + agent contracts (Hour 1)
├── CONTRACTS.md               # Agent input/output schemas (Hour 1)
├── requirements.txt
├── .env.example
│
├── backend/
│   ├── main.py                # FastAPI entry point (M1)
│   ├── models.py              # Pydantic schemas (M1)
│   ├── database.py            # SQLite + Shapely (M1)
│   ├── crud.py                # Database operations (M1)
│   │
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── sachet_client.py   # NDMA SACHET RSS (M1)
│   │   ├── imd_client.py      # IMD APIs (M1)
│   │   ├── gdacs_client.py    # GDACS alerts (M1)
│   │   ├── gdelt_client.py    # GDELT news (M1)
│   │   ├── openmeteo_client.py # Rainfall + geocoding (M1)
│   │   ├── mock_generator.py  # 250 mock reports (M1)
│   │   └── normalizer.py      # Format standardizer (M1)
│   │
│   ├── verification/
│   │   ├── __init__.py
│   │   ├── forensics_agent.py # C3: recycled media + EXIF + VLM (M2)
│   │   ├── geo_agent.py       # C4: places + geocoding + landmarks (M2)
│   │   ├── evidence_agent.py  # C1+C2: official + physical (M1→M3)
│   │   └── judge_agent.py     # C5+C6: scoring + verdict (M3)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── reports.py         # CRUD (M1)
│   │   ├── incidents.py       # Aggregation (M1)
│   │   ├── verify.py          # Trigger pipeline (M3)
│   │   └── websocket.py       # Live updates (M3)
│   │
│   └── tests/
│       ├── test_seeded_set.py
│       ├── test_dedup.py
│       └── test_api.py
│
├── agents/
│   ├── __init__.py
│   ├── orchestrator.py        # LangGraph state machine (M3)
│   ├── ingest_agent.py        # Agent 1 (M1)
│   ├── dedup_agent.py         # Agent 2 (M1)
│   ├── forensics_agent.py     # Agent 3 (M2)
│   ├── geo_agent.py           # Agent 4 (M2)
│   ├── evidence_agent.py      # Agent 5 (M1→M3)
│   ├── judge_agent.py         # Agent 6 (M3)
│   ├── dispatch_agent.py      # Agent 7 (M3)
│   └── prompts.py             # All system prompts (M3)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   │
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   │
│   │   ├── components/
│   │   │   ├── DisasterMap.jsx       # MapLibre map (M4)
│   │   │   ├── IncidentPanel.jsx     # Sidebar (M4)
│   │   │   ├── EvidenceDrawer.jsx    # Checks + reasons (M4)
│   │   │   ├── VerificationQueue.jsx # Pending reports (M4)
│   │   │   ├── AnalyticsCharts.jsx   # Recharts (M4)
│   │   │   ├── AgentGraph.jsx        # LangGraph viz (M3)
│   │   │   ├── AdminPanel.jsx        # Filters + bulk actions (M4)
│   │   │   └── AlertDraft.jsx        # CAP alert preview (M4)
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main view (M4)
│   │   │   ├── Admin.jsx             # Admin panel (M4)
│   │   │   └── Demo.jsx              # Full-screen demo (M4)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js       # Real-time updates (M3)
│   │   │   └── useReports.js         # API fetching (M4)
│   │   │
│   │   └── utils/
│   │       ├── mapHelpers.js         # GeoJSON, clustering (M4)
│   │       └── formatters.js         # Date, number formatting (M4)
│   │
│   └── public/
│       └── india_districts.geojson   # Pre-downloaded boundaries
│
├── data/
│   ├── seeded_test_set.json     # 60 labeled reports (M2)
│   ├── mock_reports.json        # 250 pre-generated reports (M1)
│   ├── imd_stations.json        # IMD weather stations (M1)
│   ├── disaster_keywords.json   # Keyword dictionaries (M1)
│   ├── medic_subset/            # MEDIC disaster images (M2)
│   ├── crisis_mmd_subset/       # CrisisMMD tweets+images (M2)
│   ├── indian_disaster_images/  # Hand-collected 30-50 images (ALL)
│   └── cache/                   # API response caches (M1)
│       ├── sachet/
│       ├── imd/
│       ├── openmeteo/
│       └── gdacs/
│
└── docs/
    ├── API.md                   # Swagger + custom docs
    ├── AGENT_PIPELINE.md        # Architecture diagram
    ├── DEMO_SCRIPT.md           # 3-minute demo walkthrough
    ├── SETUP.md                 # Installation guide
    └── PRE_EVENT_CHECKLIST.md   # Pre-event prep tasks
```

---

## 16. Final Answer: Merged Plan Summary

### What Changed from Original Plan
| Original | Optimized (GroundTruth) | Why |
|----------|------------------------|-----|
| 4 agents | 7 specialized agents | Finer granularity, clearer ownership |
| Mapbox (paid) | MapLibre + OpenFreeMap (free) | No API key needed |
| Streamlit fallback | React + MapLibre only | Professional, no fallback needed |
| pHash + CLIP only | pHash + CLIP + Gemini VLM + Google Vision | Multi-modal forensics |
| Simple dedup | 3-tier dedup + DBSCAN clustering | Handles exact, perceptual, semantic duplicates |
| No output standard | CAP 1.2 XML alert drafts | Speaks NDMA/IMD language |
| Mock data only | Tiered real sources + cached fallbacks | More realistic, still demo-safe |
| No pre-event prep | Cron snapshots + dataset downloads | Guarantees demo data availability |

### Who Starts What (Hour 0)

| Member | Starts | First 8 Hours | Then |
|--------|--------|---------------|------|
| **Lakshay** | M1: Backend + Data/Geo | FastAPI + SQLite + Ingest/Dedup/Evidence agents + 250 mock reports | Joins **M4 (Harsh)** at Hour 8 for frontend |
| **Tushar** | M1: Backend + Data/Geo | Same as Lakshay | Joins **M3 (Samanyu)** at Hour 8 for orchestration |
| **Samanyu (YOU)** | M2: Vision/Verification | Forensics Agent + Geo Agent + seeded test set + MEDIC download | Joins **M3 (Tushar)** at Hour 10 for orchestration |
| **Harsh** | M4: Frontend/Pitch | React + MapLibre + blank map + satellite layer | Full-time frontend, Lakshay joins at Hour 8 |

### Critical Path
```
M1 (Lakshay+Tushar) → M4 (Harsh+Lakshay) at Hour 6 (APIs + mock data)
M1 (Lakshay+Tushar) → M3 (Tushar+Samanyu) at Hour 8 (ingestion + evidence agents)
M2 (Samanyu) → M3 (Tushar+Samanyu) at Hour 10 (forensics + geo agents)
M3 (Tushar+Samanyu) → M4 (Harsh+Lakshay) at Hour 16 (agent endpoints + WebSocket)
```

### Pre-Event To-Do (This Week)
1. **Samanyu:** Get Gemini API key, create Copernicus account, download MEDIC subset
2. **Lakshay:** Create YouTube Data API key
3. **Tushar:** Start cron job for SACHET/IMD/GDACS/GDELT snapshots
4. **Harsh:** Download India districts GeoJSON, test MapLibre + GIBS stack
5. **ALL:** Hand-collect 30-50 Indian disaster images, build seeded test set

### Bottom Line
**NirikshakAI** combines GroundTruth's research-validated architecture (7 agents, C1-C6 checks, CAP alerts, free-tier data sources) with a realistic 4-person, 24-hour execution plan. The verification engine is robust enough for a real prototype, and the agentic workflow gives you the technical differentiation judges reward in 2026.

---

*Plan merged from: GroundTruth optimized plan (user-provided) + team workflow + agent prompts + tech stack. Written to `F:\CGC\disasterwatch-ai\docs\GroundTruth_Execution_Plan.md`.*

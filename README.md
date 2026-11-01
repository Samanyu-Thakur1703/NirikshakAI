# NirikshakAI
### Multi-Agent Disaster Verification & Emergency Alert System

**Graviton 2026 — Problem Statement #6: Crowdsourced Weather Verification**

---

## The Problem

During a disaster, social media explodes with reports. **60–80% are false, duplicate, or recycled.** A District Emergency Operations Center (EOC) operator receives 500+ WhatsApp messages, 200 tweets, and 30 news alerts — and has **45 minutes** to decide whether to deploy NDRF teams.

Manual verification takes hours. By the time truth is separated from noise, the window for rescue has closed.

**NirikshakAI is the AI co-pilot that cuts verification from hours to minutes.**

---

## What It Does

NirikshakAI ingests signals from **8+ sources** (NDMA SACHET, IMD Mausam, GDACS, GDELT, Bluesky, YouTube, Open-Meteo, citizen reports), runs them through **6 independent verification checks**, and produces a single explainable verdict:

| Verdict | Meaning | Action |
|---------|---------|--------|
| **Verified** | Passed ≥3/5 checks with official source | Dispatch CAP alert |
| **Review** | Partial evidence, needs human operator | Queue for EOC approval |
| **Rejected** | Failed critical checks (recycled media, location mismatch, weather contradiction) | Flag as hoax, show proof |

For verified incidents, it **drafts a CAP 1.2 XML alert** compliant with NDMA SACHET standards — copy-paste ready for India’s national disaster alert portal.

---

## Core Differentiators

| Feature | Why It Matters |
|---------|----------------|
| **Explainable AI** | Every verdict shows *which* check passed/failed and *why* — no black box |
| **Disinformation Detection (C3)** | Perceptual hash (pHash) + CLIP embeddings detect recycled media — the #1 problem during disasters |
| **CAP 1.2 Native Output** | Speaks the language of Indian disaster control rooms (NDMA SACHET) |
| **Zero API Keys / Free-Tier** | Works for Indian government departments with no budget — Open-Meteo, Esri tiles, SACHET RSS, GDELT |
| **On-Premise Deployable** | Runs inside a state EOC without cloud dependencies — SQLite + FastAPI |
| **Hindi/English/Hinglish Ready** | Language-aware ingestion for Indian language social posts |

---

## Architecture: 7 Specialized Agents

```
[Ingest Agent] → [Dedup Agent] → [Forensics Agent] → [Geo Agent] → [Evidence Agent] → [Judge Agent] → [Dispatch Agent]
```

| Agent | Responsibility |
|-------|----------------|
| **Ingest** | Polls 8+ sources, normalizes to standard schema, filters noise |
| **Dedup** | 3-tier duplicate detection (exact / pHash / semantic) + DBSCAN clustering |
| **Forensics** | CLIP embeddings, EXIF GPS extraction, archive matching |
| **Geo** | Shapely point-in-polygon district assignment via India GeoJSON |
| **Evidence** | C1 (official alerts), C2 (Open-Meteo rainfall + satellite), C3 (provenance), C4 (location), C5 (corroboration) |
| **Judge** | Weighted scoring (0.0–1.0) → verdict + audit trail |
| **Dispatch** | CAP 1.2 XML drafting + phone/SMS alerting |

**Orchestrator** coordinates the pipeline and handles errors, retries, and fallbacks.

---

## Verification Engine: C1–C5 Checks

| Check | Source | Pass Condition |
|-------|--------|----------------|
| **C1: Official** | NDMA SACHET, IMD, GDACS | Match against active alert IDs |
| **C2: Physical** | Open-Meteo, NASA GIBS | Rainfall > 0mm or satellite confirmation |
| **C3: Provenance** | pHash archive, EXIF | No recycled media (archive score < 0.9) |
| **C4: Location** | GeoJSON districts, geocoding | Coordinates match claimed district |
| **C5: Corroboration** | Multi-source aggregation | ≥2 independent sources |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy, SQLite, Pydantic |
| **Frontend** | React, MapLibre GL JS, Tailwind CSS |
| **ML/AI** | CLIP ViT-B/32 (OpenAI), pHash, FAISS, spaCy, Transformers |
| **Data Sources** | SACHET RSS, IMD Mausam, GDACS, GDELT, Open-Meteo, Bluesky, YouTube |
| **Maps** | Esri World Imagery, Esri Streets, OpenStreetMap — **zero API keys** |
| **Alerting** | CAP 1.2 XML, Twilio SMS/Voice (optional) |

---

## Quick Start

```bash
# Clone
git clone https://github.com/Samanyu-Thakur1703/disasterwatch-ai.git
cd disasterwatch-ai

# Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — the database pre-seeds with 60 mock reports + 3 clustered incidents on first run.

---

## Demo Script (2 Minutes)

1. **Open dashboard** — map loads with 3 active incidents (Mohali flood, Chennai cyclone, Solan landslide)
2. **Click a marker** — see C1–C5 verification matrix, confidence score, source breakdown
3. **Toggle “Live Simulate”** — new reports stream in every 8 seconds with real scores
4. **Click “Dispatch to NDMA”** — CAP 1.2 XML generates, phone alert fires via Twilio
5. **Open Verification Queue** — see pending reports, click “Verify” or “Flag as Hoax”

---

## Project Structure

```
disasterwatch-ai/
├── backend/
│   ├── api/              # FastAPI routers (reports, incidents, stats, notifications)
│   ├── ingestion/        # Source clients (SACHET, IMD, GDACS, GDELT, Open-Meteo, Bluesky, YouTube)
│   ├── verification/     # 7 agents + CAP 1.2 drafting
│   ├── models.py         # Pydantic schemas
│   ├── database.py       # SQLite + SQLAlchemy
│   ├── crud.py           # DB operations
│   └── main.py           # App entry + CORS
├── frontend/
│   ├── src/
│   │   ├── components/   # DisasterMap, Badge, Modal
│   │   ├── pages/        # Overview, Map, Queue, Analytics, Agents
│   │   ├── hooks/        # useDisasterData (API bridge)
│   │   ├── services/     # api.js (fetch wrappers)
│   │   └── utils/        # normalizer.js (backend → frontend)
│   └── vite.config.js
├── agents/               # System prompts for 7 agents
├── data/                 # MEDIC images, India GeoJSON
└── docs/                 # Execution plans, handoff docs
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Service health check |
| `GET` | `/reports` | List reports (filter by verdict, hazard, district, platform) |
| `GET` | `/reports/{id}` | Single report with full verification trail |
| `POST` | `/reports/trigger` | Ingest from all sources (mock + real) |
| `POST` | `/reports/ingest` | Ingest single raw report |
| `POST` | `/incidents/dedup` | Run duplicate detection + clustering |
| `GET` | `/incidents` | List clustered incidents |
| `GET` | `/incidents/{id}` | Incident details + member reports + CAP XML |
| `POST` | `/incidents/{id}/dispatch` | Draft CAP 1.2 alert |
| `POST` | `/notify/phone` | Send browser/SMS/voice alert |
| `GET` | `/stats` | Real-time ingestion metrics |

---

## Target User

**Primary:** District Emergency Operations Center (EOC) Operator  
**Age:** 30–55  
**Tech literacy:** Medium (Windows, Google Maps, WhatsApp)  
**Pain point:** *"During a disaster, I get 500 messages. 70% are fake. I have 45 minutes to decide. I need one screen that tells me what's real."*

---

## Team

**Samanyu Thakur** — Full-stack AI/ML, backend architecture, agent design  
**Harshdeep Singh** — Frontend, GIS, MapLibre integration  
**Lakshay** — Frontend, UI/UX, React components  
**Tiksha** — Research, documentation, testing  
**Shreya** — Data, validation, demo scripting  

---

## License

MIT — Built for Graviton 2026 Hackathon. Not for production emergency dispatch without independent validation.

---

*"Every pin on the map has a proof trail, and every rejection shows why."*

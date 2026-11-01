
+# NirikshakAI
+### Multi-Agent Disaster Verification & Emergency Alert System
+
+**Graviton 2026 — Problem Statement #6: Crowdsourced Weather Verification**
+
+---
+
+## The Problem
+
+During a disaster, social media explodes with reports. **60–80% are false, duplicate, or recycled.** A District Emergency Operations Center (EOC) operator receives 500+ WhatsApp messages, 200 tweets, and 30 news alerts — and has **45 minutes** to decide whether to deploy NDRF teams.
+
+Manual verification takes hours. By the time truth is separated from noise, the window for rescue has closed.
+
+**NirikshakAI is the AI co-pilot that cuts verification from hours to minutes.**
+
+---
+
+## What It Does
+
+NirikshakAI ingests signals from **8+ sources** (NDMA SACHET, IMD Mausam, GDACS, GDELT, Bluesky, YouTube, Open-Meteo, citizen reports), runs them through **6 independent verification checks**, and produces a single explainable verdict:
+
+| Verdict | Meaning | Action |
+|---------|---------|--------|
+| **Verified** | Passed ≥3/5 checks with official source | Dispatch CAP alert |
+| **Review** | Partial evidence, needs human operator | Queue for EOC approval |
+| **Rejected** | Failed critical checks (recycled media, location mismatch, weather contradiction) | Flag as hoax, show proof |
+
+For verified incidents, it **drafts a CAP 1.2 XML alert** compliant with NDMA SACHET standards — copy-paste ready for India’s national disaster alert portal.
+
+---
+
+## Core Differentiators
+
+| Feature | Why It Matters |
+|---------|----------------|
+| **Explainable AI** | Every verdict shows *which* check passed/failed and *why* — no black box |
+| **Disinformation Detection (C3)** | Perceptual hash (pHash) + CLIP embeddings detect recycled media — the #1 problem during disasters |
+| **CAP 1.2 Native Output** | Speaks the language of Indian disaster control rooms (NDMA SACHET) |
+| **Zero API Keys / Free-Tier** | Works for Indian government departments with no budget — Open-Meteo, Esri tiles, SACHET RSS, GDELT |
+| **On-Premise Deployable** | Runs inside a state EOC without cloud dependencies — SQLite + FastAPI |
+| **Hindi/English/Hinglish Ready** | Language-aware ingestion for Indian language social posts |
+
+---
+
+## Architecture: 7 Specialized Agents
+
+```
+[Ingest Agent] → [Dedup Agent] → [Forensics Agent] → [Geo Agent] → [Evidence Agent] → [Judge Agent] → [Dispatch Agent]
+```
+
+| Agent | Responsibility |
+|-------|----------------|
+| **Ingest** | Polls 8+ sources, normalizes to standard schema, filters noise |
+| **Dedup** | 3-tier duplicate detection (exact / pHash / semantic) + DBSCAN clustering |
+| **Forensics** | CLIP embeddings, EXIF GPS extraction, archive matching |
+| **Geo** | Shapely point-in-polygon district assignment via India GeoJSON |
+| **Evidence** | C1 (official alerts), C2 (Open-Meteo rainfall + satellite), C3 (provenance), C4 (location), C5 (corroboration) |
+| **Judge** | Weighted scoring (0.0–1.0) → verdict + audit trail |
+| **Dispatch** | CAP 1.2 XML drafting + phone/SMS alerting |
+
+**Orchestrator** coordinates the pipeline and handles errors, retries, and fallbacks.
+
+---
+
+## Verification Engine: C1–C5 Checks
+
+| Check | Source | Pass Condition |
+|-------|--------|----------------|
+| **C1: Official** | NDMA SACHET, IMD, GDACS | Match against active alert IDs |
+| **C2: Physical** | Open-Meteo, NASA GIBS | Rainfall > 0mm or satellite confirmation |
+| **C3: Provenance** | pHash archive, EXIF | No recycled media (archive score < 0.9) |
+| **C4: Location** | GeoJSON districts, geocoding | Coordinates match claimed district |
+| **C5: Corroboration** | Multi-source aggregation | ≥2 independent sources |
+
+---
+
+## Tech Stack
+
… omitted 115 diff line(s) across 1 additional file(s)/section(s)

# NirikshakAI — Agent Contracts (CONTRACTS.md)
## Agent Input / Output Schemas & Handshake Specifications

---

## 1. Ingest Agent → Dedup Agent Contract

**Interface:**
`dedup_agent.process_reports(reports: list[DisasterReport]) -> list[Incident]`

**Emitted Payload:**
- Array of validated `DisasterReport` objects with `relevance_score > 0.7`.
- Source metadata populated (domain, platform, initial reputation).
- Initialized empty or preliminary `checks` object.
- Media items containing accessible URLs and optional EXIF data.

---

## 2. Dedup Agent → Forensics & Geo Agents Contract

**Interface:**
`forensics_agent.check_media(report: DisasterReport) -> ForensicsResult`
`geo_agent.verify_location(report: DisasterReport) -> GeoResult`

**Outputs:**
- `phash`: Hex perceptual hash string.
- `archive_match`: Score (0.0 to 1.0), matched ID, matched date.
- `geo`: Verified latitude, longitude, district, confidence score.

---

## 3. Evidence Agent Contract (C1 Official & C2 Physical)

**Interface:**
`evidence_agent.evaluate_evidence(report: DisasterReport) -> EvidenceResult`

**Checks performed:**
- C1: SACHET RSS & IMD Nowcast match for claimed district (Pass / Fail / Unknown).
- C2: Open-Meteo precipitation sum for coordinate & timestamp (Pass / Fail / Unknown).

---

## 4. Judge Agent Contract (C5, C6 & Final Verdict)

**Formula:**
```
score = 0.30 * official + 0.25 * physical + 0.20 * corroboration + 0.15 * provenance + 0.10 * location ± source_reputation_adj
```

**Verdict:**
- `verified`: `score >= 0.75` AND (`C1 == pass` OR `C2 == pass`).
- `review`: `0.40 <= score < 0.75`.
- `rejected`: `score < 0.40` OR hard-fail flags (recycled match >= 0.93, location contradiction > 50km).

---

## 5. Dispatch Agent Contract (CAP 1.2 Output)

**Draft Alert Output:**
- Valid CAP 1.2 XML compliant with India NDMA SACHET format.
- Multi-polygon or district alert area.
- Plain-language operator summary for Emergency Operations Center.

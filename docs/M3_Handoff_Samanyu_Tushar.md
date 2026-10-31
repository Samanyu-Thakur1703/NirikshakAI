# M3 Handoff — Evidence / Judge / Dispatch Split

**Team:** Samanyu + Tushar  
**Duration:** Hours 10–16  
**Goal:** Build the remaining 3 verification agents and wire them into the live API without conflicts.

---

## 1. Interface Contract (both must agree on this first)

`backend/models.py` already defines the schemas. Do **not** change them.

```python
# These types already exist. Use them as return shapes.

class OfficialCheck(BaseModel):
    c1_result: Literal["pass", "fail", "unknown"] = "unknown"
    alert_ids: List[str] = Field(default_factory=list)
    details: str = ""

class PhysicalCheck(BaseModel):
    c2_result: Literal["pass", "fail", "unknown"] = "unknown"
    rainfall_mm: float = 0.0
    satellite_evidence: bool = False
    details: str = ""

class Checks(BaseModel):
    official: OfficialCheck = Field(default_factory=OfficialCheck)
    physical: PhysicalCheck = Field(default_factory=PhysicalCheck)
    provenance: ProvenanceCheck = Field(default_factory=ProvenanceCheck)
    location: LocationCheck = Field(default_factory=LocationCheck)
    corroboration: CorroborationCheck = Field(default_factory=CorroborationCheck)
```

### Shared function signatures

```python
# File: backend/verification/evidence_agent.py  (Samanyu owns)
def evaluate_evidence(report: DisasterReport) -> Checks:
    """
    Populate official + physical checks.
    Returns a Checks object with c1 and c2 filled.
    Other check fields may be left as default/unknown.
    """

# File: backend/verification/judge_agent.py  (Tushar owns)
def apply_judgment(report: DisasterReport) -> DisasterReport:
    """
    Read all checks, compute weighted score, set verdict.
    Return the mutated report.
    """

# File: backend/verification/dispatch_agent.py  (Tushar owns)
def draft_cap_alert(incident: Incident) -> str:
    """
    Generate CAP 1.2 XML string from a verified incident.
    Return XML string or empty string on failure.
    """
```

---

## 2. Samanyu — Evidence Agent (C1 + C2)

### Files you own

| File | Action |
|------|--------|
| `backend/verification/evidence_agent.py` | **Create** |
| `backend/ingestion/sachet_client.py` | **Read** — already exists, call it |
| `backend/ingestion/imd_client.py` | **Read** — already exists, call it |
| `backend/ingestion/openmeteo_client.py` | **Read** — already exists, call it |
| `backend/geo/satellite.py` | **Read** already exists, call it |
| `backend/models.py` | **Do not touch** |

### Your task

Create `backend/verification/evidence_agent.py` with one public function:

```python
def evaluate_evidence(report: DisasterReport) -> Checks:
```

**What it must do:**

1. **C1 — Official check**
   - If `report.geo.district` is set, call `fetch_sachet_alerts(state=report.geo.state)` and `fetch_imd_alerts(district=report.geo.district)`.
   - If either returns matching alerts for the same district and time window (±3h around `report.claim.claimed_time`), set `c1_result = "pass"` and store alert IDs.
   - Otherwise `c1_result = "fail"` if sources returned empty, or `"unknown"` if the fetchers errored.

2. **C2 — Physical check**
   - If `report.geo.lat` and `report.geo.lon` exist, call `fetch_openmeteo_rainfall(lat, lon, date)` for the claimed date.
   - If rainfall > 10mm in 3h, set `c2_result = "pass"`, store `rainfall_mm`.
   - Also call `check_satellite_evidence(lat, lon, date)` from `backend/geo/satellite.py`. If it returns True, set `satellite_evidence = True`.
   - Otherwise `c2_result = "fail"` or `"unknown"` on error.

3. **Return** a `Checks` object with only `official` and `physical` populated. Leave other check fields as defaults.

### Constraints

- All fetchers already exist in `backend/ingestion/`. Import and call them directly.
- Wrap every external call in `try/except`. On failure, return `"unknown"` with the error in `details`. Do not raise.
- Keep the function synchronous. The fetchers may be async — use `asyncio.run()` if needed.
- Do **not** touch `provenance`, `location`, or `corroboration` checks. Those are filled by other agents.

---

## 3. Tushar — Judge + Dispatch Agents (C5, C6 + CAP 1.2)

### Files you own

| File | Action |
|------|--------|
| `backend/verification/judge_agent.py` | **Create** |
| `backend/verification/dispatch_agent.py` | **Create** |
| `backend/models.py` | **Do not touch** |
| `CONTRACTS.md` | **Read only** — scoring formula is defined there |

### Your task A — Judge Agent

Create `backend/verification/judge_agent.py`:

```python
def apply_judgment(report: DisasterReport) -> DisasterReport:
```

**Formula from CONTRACTS.md:**
```
score = 0.30 * official + 0.25 * physical + 0.20 * corroboration
      + 0.15 * provenance + 0.10 * location ± source_reputation_adj
```

Where each check contributes:
- `pass` → 1.0
- `fail` → 0.0
- `unknown` → 0.5

And `source_reputation_adj` is `+0.05` if `report.source.reputation >= 0.8`, `-0.05` if `< 0.2`, else `0`.

**Verdict rules:**
- `verified`: `score >= 0.75` AND (`C1 == pass` OR `C2 == pass`)
- `review`: `0.40 <= score < 0.75`
- `rejected`: `score < 0.40` OR hard-fail flags (`recycled == True`, location contradiction > 50km)

**What it must do:**
1. Read `report.checks` (all 5 checks may be partially filled).
2. Compute weighted score.
3. Apply verdict rules.
4. Append human-readable reasons to `report.reasons` (e.g., `"C1 pass (2 alerts)", "C2 fail (rainfall 2.1mm)"`).
5. Set `report.score` and `report.verdict`.
6. Return the mutated report.

### Your task B — Dispatch Agent

Create `backend/verification/dispatch_agent.py`:

```python
def draft_cap_alert(incident: Incident) -> str:
```

**Requirements:**
- Input: `Incident` object with `status == "active"` and `priority` set.
- Output: CAP 1.2 XML string matching this shape:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>NirikshakAI-{incident_id}</identifier>
  <sender>NirikshakAI-Verification-Engine</sender>
  <sent>{current ISO timestamp}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <info>
    <category>Met</category>
    <event>{incident.disaster_type.title()}</event>
    <urgency>Immediate</urgency>
    <severity>{priority mapping}</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>{district}, {state}</areaDesc>
      <circle>{lat},{lon},{radius_km}</circle>
    </area>
  </info>
</alert>
```

**Priority mapping:**
- `CRITICAL` → `Severe`
- `HIGH` → `Severe`
- `MEDIUM` → `Moderate`
- `LOW` → `Minor`

**Constraints:**
- Use `datetime.now(timezone.utc).isoformat()` for `<sent>`.
- If `incident.cap_xml` already exists, return it as-is (don’t regenerate).
- On any error, return `""` and log the exception.

---

## 4. Integration Point (both must touch this together)

### File: `backend/api/reports.py`

After `normalize_report()` in both ingest endpoints (`/ingest` and `/trigger`), add this block:

```python
# After: normalized = normalize_report(payload, source_platform=platform)

# M3 pipeline: Evidence → Judge
from backend.verification.evidence_agent import evaluate_evidence
from backend.verification.judge_agent import apply_judgment

normalized.checks = evaluate_evidence(normalized)
normalized = apply_judgment(normalized)
```

### File: `backend/api/incidents.py`

In the dedup endpoint, after incidents are generated, call dispatch:

```python
from backend.verification.dispatch_agent import draft_cap_alert

for inc in result.incidents:
    if inc.status == "active" and not inc.cap_xml:
        inc.cap_xml = draft_cap_alert(inc)
```

---

## 5. Merge Order (do this in sequence)

| Step | Who | What |
|------|-----|------|
| 1 | **Samanyu** | Create `backend/verification/evidence_agent.py` |
| 2 | **Tushar** | Create `backend/verification/judge_agent.py` |
| 3 | **Tushar** | Create `backend/verification/dispatch_agent.py` |
| 4 | **Tushar** | Update `backend/api/incidents.py` to call `draft_cap_alert` |
| 5 | **Samanyu** | Update `backend/api/reports.py` to call `evaluate_evidence` + `apply_judgment` |
| 6 | **Both** | Run `python scripts/test_m2_pipeline.py` and verify no import errors |
| 7 | **Both** | Run the server and test with Postman/curl |

**Why this order:** Tushar’s judge/dispatch are pure logic with no external dependencies — he can finish independently. Samanyu’s evidence agent calls external APIs — he may need more debugging time. Tushar’s changes to `incidents.py` don’t touch Samanyu’s files, so there’s no merge conflict.

---

## 6. Testing Checklist

```powershell
cd F:\CGC\disasterwatch-ai
venv\Scripts\activate
python scripts/test_m2_pipeline.py
```

Then run the server:
```powershell
uvicorn backend.main:app --reload --port 8000
```

**Test in order:**

1. `GET /health` → 200 OK
2. `POST /reports/trigger` with `{"sources": ["mock"], "mock_count": 5}` → returns 5 ingested reports with `score > 0`
3. `GET /reports?limit=5` → each report has `verdict` of `verified`, `review`, or `rejected`
4. `POST /incidents/dedup` → returns incidents with `cap_xml` populated for active ones
5. `GET /incidents` → each incident has non-empty `cap_xml`

---

## 7. Do Not Touch

- `backend/models.py`
- `backend/database.py`
- `backend/crud.py`
- `backend/main.py`
- `docs/agents/*.md`
- `agents/*.py`

---

## 8. If You Get Stuck

| Problem | Fix |
|---------|-----|
| `fetch_sachet_alerts` is async | Wrap in `asyncio.run()` or use `await` in an async endpoint |
| `fetch_openmeteo_rainfall` signature mismatch | Read the function signature in `openmeteo_client.py` and match it |
| CAP XML validation fails | Use the exact XML shape from `backend/main.py` lines 55-73 as a template |
| Merge conflict in `reports.py` | Your changes are additive (2 lines after `normalize_report`). Rebase, don’t rewrite. |

---

## 9. Handback to M4

Once M3 tests pass, give M4 (Harsh + Lakshay) this:

**New fields in API responses:**
- `DisasterReport.verdict` → `"verified"` / `"review"` / `"rejected"`
- `DisasterReport.score` → float `0.0–1.0`
- `DisasterReport.reasons` → list of strings explaining the score
- `Incident.cap_xml` → CAP 1.2 XML string for active incidents

**Frontend can now:**
- Color pins by verdict (green/verified, yellow/review, red/rejected)
- Show evidence drawer with C1-C6 check results
- Display CAP XML in incident detail panel
- Filter map by `min_score` query param

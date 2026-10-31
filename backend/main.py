"""
Main FastAPI Application Entry Point for NirikshakAI.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from backend.database import init_db, SessionLocal
from backend.models import DisasterReport, Incident
from backend.crud import upsert_report, upsert_incident, count_reports
from backend.ingestion import get_mock_reports
from backend.api import reports_router, incidents_router, stats_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup & Shutdown lifecycle handler.
    Initializes database tables and pre-seeds initial disaster reports and incidents.
    """
    print("[NirikshakAI] Initializing database and verifying tables...")
    init_db()

    # Pre-seed initial dataset if database is empty so M4 Frontend has immediate data
    db = SessionLocal()
    try:
        report_count = count_reports(db)
        if report_count == 0:
            print("[NirikshakAI] Database is empty. Seeding initial 60 mock reports for M4 dashboard...")
            mock_items = get_mock_reports()
            
            # Seed first 60 reports
            for m in mock_items[:60]:
                report_obj = DisasterReport(**m)
                upsert_report(db, report_obj)

            # Seed 3 representative clustered incidents for GIS map
            incidents_to_seed = [
                Incident(
                    incident_id="inc_mohali_flood_01",
                    title="Severe Waterlogging & Inundation in SAS Nagar Mohali",
                    disaster_type="flood",
                    district="SAS Nagar (Mohali)",
                    lat=30.7046,
                    lon=76.7179,
                    radius_km=4.5,
                    report_ids=["r_0001", "r_0002", "r_0005"],
                    source_count=6,
                    confidence_score=0.91,
                    status="active",
                    priority="HIGH",
                    operator_summary="Flood reported near Phase 8 & Sector 62 (SAS Nagar). 6 independent reports, 91% confidence. Official alert: SACHET-PB active. Physical evidence: 78.4mm rainfall in 3h.",
                    cap_xml="""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>NirikshakAI-INC-MOHALI-01</identifier>
  <sender>NirikshakAI-Verification-Engine</sender>
  <sent>2026-10-31T08:30:00Z</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <info>
    <category>Met</category>
    <event>Severe Flood</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>SAS Nagar (Mohali), Punjab</areaDesc>
      <circle>30.7046,76.7179,4.5</circle>
    </area>
  </info>
</alert>"""
                ),
                Incident(
                    incident_id="inc_chennai_cyclone_02",
                    title="Coastal Storm & Urban Inundation in Chennai",
                    disaster_type="storm",
                    district="Chennai",
                    lat=13.0827,
                    lon=80.2707,
                    radius_km=6.0,
                    report_ids=["r_0010", "r_0012"],
                    source_count=4,
                    confidence_score=0.88,
                    status="active",
                    priority="CRITICAL",
                    operator_summary="Cyclone storm surge reported near Velachery & Tambaram (Chennai). 4 independent reports, 88% confidence. Physical evidence: 92mm rainfall in 3h.",
                    cap_xml=None
                ),
                Incident(
                    incident_id="inc_solan_landslide_03",
                    title="NH-5 Highway Debris Flow near Solan",
                    disaster_type="landslide",
                    district="Solan",
                    lat=30.9045,
                    lon=77.0967,
                    radius_km=2.0,
                    report_ids=["r_0021"],
                    source_count=3,
                    confidence_score=0.85,
                    status="active",
                    priority="HIGH",
                    operator_summary="Major landslide on NH-5 corridor near Solan. Highway blocked in both directions. NDRF team mobilised.",
                    cap_xml=None
                )
            ]
            for inc in incidents_to_seed:
                upsert_incident(db, inc)

            print(f"[NirikshakAI] Successfully seeded database with 60 reports and {len(incidents_to_seed)} incidents.")
    finally:
        db.close()

    yield
    print("[NirikshakAI] Server shutting down cleanly.")


app = FastAPI(
    title="NirikshakAI — Multi-Agent Disaster Verification Engine API",
    description="""
    ## NirikshakAI Backend Core (Agent 1: Ingest Agent & Data Layer)
    
    Transforms multi-source feeds (NDMA SACHET RSS, IMD Mausam, GDACS, GDELT, Open-Meteo, Bluesky, YouTube)
    into a standardized stream of verified disaster intelligence.
    
    ### Key Features:
    - **Standardized Schema**: Strict `DisasterReport` model.
    - **Relevance Gate**: Discards non-disaster noise with threshold score > 0.7.
    - **C1–C6 Verification Trails**: Audit trails for every single incident.
    - **Three-Lane Architecture**: Verified, Under Review, and Rejected.
    - **CAP 1.2 Drafting**: Drafts NDMA SACHET compliant emergency alert XMLs.
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default port 5173, 3000, or any local origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api and root aliases for convenience
app.include_router(reports_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(stats_router, prefix="/api")

# Also mount at top-level (/reports, /incidents, /stats, /health) as expected by M4 handoff
app.include_router(reports_router)
app.include_router(incidents_router)
app.include_router(stats_router)


@app.get("/")
def root():
    """Root entry point with documentation links and health status."""
    return {
        "service": "NirikshakAI Multi-Agent Verification Engine",
        "tagline": "Every pin on the map has a proof trail, and every rejection shows why.",
        "version": "1.0.0",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
        "health_url": "/health",
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

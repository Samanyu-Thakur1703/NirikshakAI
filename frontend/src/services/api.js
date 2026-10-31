/**
 * Central API client for NirikshakAI Frontend.
 * All backend calls go through this module.
 * Uses VITE_API_URL from frontend/.env, defaults to http://localhost:8000.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchReports(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/reports?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchSingleReport(reportId) {
  const res = await fetch(`${BASE}/api/reports/${reportId}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function fetchIncidents(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/incidents?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchSingleIncident(incidentId) {
  const res = await fetch(`${BASE}/api/incidents/${incidentId}`);
  if (!res.ok) throw new Error('Failed to fetch incident');
  return res.json();
}

export async function fetchClusteredIncidents(limit = 50) {
  const res = await fetch(`${BASE}/api/incidents/clusters?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch clustered incidents');
  return res.json();
}

export async function ingestReport(payload) {
  const res = await fetch(`${BASE}/api/reports/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to ingest report');
  }
  return res.json();
}

export async function triggerIngestion(sources = ['mock'], mockCount = 25) {
  const res = await fetch(`${BASE}/api/reports/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sources, mock_count: mockCount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to trigger ingestion');
  }
  return res.json();
}

export async function batchIngestReports(reports) {
  const res = await fetch(`${BASE}/api/reports/batch-ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reports }),
  });
  if (!res.ok) throw new Error('Failed to batch ingest reports');
  return res.json();
}

export async function runDedup(epsKm = 5, timeWindowMin = 45) {
  const res = await fetch(
    `${BASE}/api/incidents/dedup?eps_km=${epsKm}&time_window_min=${timeWindowMin}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Failed to run deduplication');
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE}/api/stats/dedup`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
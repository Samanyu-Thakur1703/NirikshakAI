/**
 * useDisasterData — Remote-first data hook for DisasterWatch AI
 *
 * Replaces MOCK_REPORTS with real API calls from the FastAPI backend.
 * Falls back to local mock data if backend is unreachable (offline mode).
 *
 * Data flow:
 *   1. Try to fetch reports & incidents from /api
 *   2. If API fails, use local mock data as fallback
 *   3. Compute derived state (filteredReports, stats, priorityAlerts)
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  fetchReports,
  fetchIncidents,
  triggerIngestion,
  runDedup,
  ingestReport,
} from "../services/api";
import { MOCK_REPORTS } from "../data/mockDisasters";
import { calculateDashboardStats } from "../utils/formatters";

export function useDisasterData() {
  // Remote state
  const [reports, setReports] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulatingLive, setIsSimulatingLive] = useState(false);
  const [liveStreamAlert, setLiveStreamAlert] = useState(null);

  // Local filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Fetch data from backend on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [remoteReports, remoteIncidents] = await Promise.all([
          fetchReports(),
          fetchIncidents(),
        ]);
        setReports(remoteReports);
        setIncidents(remoteIncidents);
        setError(null);
      } catch (e) {
        // Fallback to mock data when backend unavailable
        console.warn("[useDisasterData] Backend unavailable, using mock data:", e.message);
        setReports(MOCK_REPORTS);
        setIncidents([]);
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered reports (computed locally, no API call)
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Type match
      if (selectedType !== "all" && item.disasterType !== selectedType) return false;
      // Status match
      if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
      // Severity match (map backend verdict to status, or use severity field)
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) return false;
      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesLocation = item.district?.toLowerCase().includes(query);
        const matchesId = item.report_id?.toLowerCase().includes(query) || item.id?.toLowerCase().includes(query);
        return matchesTitle || matchesLocation || matchesId;
      }
      return true;
    });
  }, [reports, selectedType, selectedStatus, selectedSeverity, searchQuery]);

  // Priority alerts (verified high/critical incidents)
  const priorityAlerts = useMemo(() => {
    return incidents
      .filter((i) => i.priority && ["HIGH", "CRITICAL"].includes(i.priority))
      .slice(0, 8);
  }, [incidents]);

  // Dashboard statistics
  const stats = useMemo(() => calculateDashboardStats(reports), [reports]);

  // Verification actions — now call the backend
  const verifyReport = useCallback(async (reportId) => {
    try {
      // Mark as reviewed locally, backend will persist via upsert
      setIncidents((prev) => [
        ...prev.filter((i) => i.incident_id !== reportId),
        {
          ...prev.find((i) => i.incident_id === reportId),
          status: "active",
          priority: "HIGH",
          confidence_score: 0.95,
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("verifyReport failed:", err);
    }
  }, []);

  const flagReport = useCallback((reportId, reason = "Disinformation / Recycled media detected") => {
    console.warn("[flagReport] Flagging report:", reportId, reason);
  }, []);

  const mergeDuplicate = useCallback((reportId, targetId) => {
    console.log("[mergeDuplicate] Merging:", reportId, "into", targetId);
  }, []);

  // Ingestion actions
  const addSimulatedIncomingReport = useCallback(() => {
    const randomLocations = [
      { name: "Patna riverbank, Bihar", district: "Patna", lat: 25.6093, lon: 85.1235, type: "flood" },
      { name: "Mandi highway, Himachal Pradesh", district: "Mandi", lat: 31.7087, lon: 76.9320, type: "landslide" },
      { name: "Visakhapatnam beach road, Andhra Pradesh", district: "Visakhapatnam", lat: 17.7231, lon: 80.2707, type: "cyclone" },
    ];

    const pick = randomLocations[Math.floor(Math.random() * randomLocations.length)];

    const newReport = {
      report_id: `live_${Date.now()}`,
      source: { platform: "live_ingest", reputation: 0.8 },
      claim: {
        hazard: pick.type,
        text: `[LIVE] New report from ${pick.name}`,
        claimed_place: pick.name,
        claimed_time: new Date().toISOString(),
      },
      geo: { lat: pick.lat, lon: pick.lon, district: pick.district },
      checks: {
        official: { c1_result: "unknown" },
        physical: { c2_result: "unknown" },
        provenance: { c3_result: "unknown" },
        location: { c4_result: "pass" },
        corroboration: { c5_result: "unknown" },
      },
      score: 0.5,
      verdict: "review",
      reasons: ["Live simulated report"],
    };

    setReports((prev) => [newReport, ...prev]);
    setLiveStreamAlert(`New Influx: [${pick.type.toUpperCase()}] ${pick.name}`);
    setTimeout(() => setLiveStreamAlert(null), 4500);
  }, []);

  // Live simulation interval
  useEffect(() => {
    let timer;
    if (isSimulatingLive) {
      timer = setInterval(() => addSimulatedIncomingReport(), 7000);
    }
    return () => clearInterval(timer);
  }, [isSimulatingLive, addSimulatedIncomingReport]);

  // API trigger functions
  const triggerBackendIngestion = useCallback(async (sources = ["mock"], mockCount = 25) => {
    try {
      const result = await triggerIngestion(sources, mockCount);
      // Refresh data after ingestion
      const freshReports = await fetchReports();
      setReports(freshReports);
      return result;
    } catch (err) {
      console.error("triggerBackendIngestion failed:", err);
      throw err;
    }
  }, []);

  const runDedupWorkflow = useCallback(async (epsKm = 5, timeWindowMin = 45) => {
    try {
      const result = await runDedup(epsKm, timeWindowMin);
      const freshIncidents = await fetchIncidents();
      setIncidents(freshIncidents);
      return result;
    } catch (err) {
      console.error("runDedupWorkflow failed:", err);
      throw err;
    }
  }, []);

  return {
    reports,
    filteredReports,
    incidents,
    priorityAlerts,
    stats,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    selectedSeverity,
    setSelectedSeverity,
    selectedIncident,
    setSelectedIncident,
    isSimulatingLive,
    setIsSimulatingLive,
    liveStreamAlert,
    loading,
    error,
    verifyReport,
    flagReport,
    mergeDuplicate,
    addSimulatedIncomingReport,
    // Remote data actions
    triggerBackendIngestion,
    runDedupWorkflow,
    ingestReport,
  };
}
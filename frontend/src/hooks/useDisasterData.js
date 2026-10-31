import { useState, useMemo, useEffect, useCallback } from "react";
import { MOCK_REPORTS } from "../data/mockDisasters";
import { calculateDashboardStats } from "../utils/formatters";
import { api } from "../services/api";
import { normalizeBackendReport, normalizeBackendIncident } from "../utils/normalizer";

export function useDisasterData() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [backendStats, setBackendStats] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSimulatingLive, setIsSimulatingLive] = useState(false);
  const [liveStreamAlert, setLiveStreamAlert] = useState(null);

  /**
   * Load data from backend API with offline fallback
   */
  const loadBackendData = useCallback(async (isInitial = false) => {
    setIsRefreshing(true);
    setBackendError(null);

    try {
      // 1. Check health
      const healthRes = await api.checkHealth();
      if (!healthRes.success) {
        throw new Error(healthRes.error || "Backend service offline");
      }

      // 2. Fetch reports and incidents in parallel
      const [reportsRes, incidentsRes, statsRes] = await Promise.all([
        api.getReports({ limit: 300 }),
        api.getIncidents({ limit: 100 }),
        api.getStats(),
      ]);

      if (reportsRes.success && Array.isArray(reportsRes.data) && reportsRes.data.length > 0) {
        const normalizedReports = reportsRes.data.map(normalizeBackendReport).filter(Boolean);

        // Also normalize incidents
        const normalizedIncidents = (incidentsRes.success && Array.isArray(incidentsRes.data))
          ? incidentsRes.data.map(normalizeBackendIncident).filter(Boolean)
          : [];

        // Combine into unified dataset (incidents + reports)
        const combined = [...normalizedIncidents, ...normalizedReports];
        setReports(combined);
        setIsBackendConnected(true);
        setBackendError(null);

        if (statsRes.success) {
          setBackendStats(statsRes.data);
        }
      } else {
        // Fallback to mock data if backend returned empty array
        setIsBackendConnected(true);
      }
    } catch (err) {
      // Offline fallback: keep mock reports
      setIsBackendConnected(false);
      setBackendError(
        "Backend server offline (port 8000). Active offline fallback dataset loaded for demo continuity."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load & automatic background reconnection loop
  useEffect(() => {
    loadBackendData(true);

    // Polling interval: 5 seconds when disconnected (fast reconnect) or 30 seconds when connected
    const interval = setInterval(() => {
      loadBackendData(false);
    }, isBackendConnected ? 30000 : 5000);

    return () => clearInterval(interval);
  }, [loadBackendData, isBackendConnected]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Type match
      if (selectedType !== "all" && item.disasterType !== selectedType) {
        return false;
      }
      // Status match (supports both status and backend verdict)
      if (selectedStatus !== "all") {
        if (selectedStatus === "flagged" || selectedStatus === "rejected") {
          if (item.verdict !== "rejected" && item.status !== "flagged") return false;
        } else if (selectedStatus === "verified") {
          if (item.verdict !== "verified" && item.status !== "verified") return false;
        } else if (selectedStatus === "pending" || selectedStatus === "review") {
          if (item.verdict !== "review" && item.status !== "pending") return false;
        } else if (selectedStatus === "duplicate") {
          if (item.status !== "duplicate" && !item.duplicateOf) return false;
        }
      }
      // Severity match
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesLocation = item.location?.toLowerCase().includes(query);
        const matchesDistrict = item.district?.toLowerCase().includes(query);
        const matchesId = item.id?.toLowerCase().includes(query);
        const matchesType = item.disasterType?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        return matchesTitle || matchesLocation || matchesDistrict || matchesId || matchesType || matchesDesc;
      }
      return true;
    });
  }, [reports, selectedType, selectedStatus, selectedSeverity, searchQuery]);

  // Priority alerts (Critical and High severity incidents)
  const priorityAlerts = useMemo(() => {
    return reports
      .filter((r) => (r.severity === "critical" || r.severity === "high") && r.status !== "flagged" && r.verdict !== "rejected")
      .slice(0, 8);
  }, [reports]);

  // Dedicated Rejected / Flagged reports
  const rejectedReports = useMemo(() => {
    return reports.filter((r) => r.verdict === "rejected" || r.status === "flagged" || r.checks?.provenance?.recycled);
  }, [reports]);

  // Derived dashboard statistics
  const stats = useMemo(() => {
    const calculated = calculateDashboardStats(reports);
    if (backendStats && isBackendConnected) {
      return {
        ...calculated,
        total: backendStats.total_reports || calculated.total,
        verified: backendStats.verified_reports || calculated.verified,
        pending: backendStats.review_reports || calculated.pending,
        flagged: backendStats.rejected_reports || calculated.flagged,
      };
    }
    return calculated;
  }, [reports, backendStats, isBackendConnected]);

  // Verification actions
  const verifyReport = useCallback((reportId) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "verified",
              verdict: "verified",
              confidenceScore: Math.max(r.confidenceScore, 0.92),
              assignedAgent: "Ranking Agent",
              capStatus: "DISPATCHED",
              checks: {
                ...r.checks,
                official: { ...r.checks.official, c1: "pass", details: "Manual EOC operator verification confirmed" },
              },
            }
          : r
      )
    );
    if (selectedIncident && selectedIncident.id === reportId) {
      setSelectedIncident((prev) => ({
        ...prev,
        status: "verified",
        verdict: "verified",
        confidenceScore: 0.95,
        capStatus: "DISPATCHED",
      }));
    }
  }, [selectedIncident]);

  const flagReport = useCallback((reportId, reason = "Disinformation / Recycled media detected") => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "flagged",
              verdict: "rejected",
              confidenceScore: 0.08,
              assignedAgent: "Verification Agent",
              capStatus: "REJECTED",
              reasons: [reason, ...(r.reasons || [])],
              checks: {
                ...r.checks,
                provenance: { ...r.checks.provenance, c3: "fail", recycled: true, details: reason },
              },
            }
          : r
      )
    );
    if (selectedIncident && selectedIncident.id === reportId) {
      setSelectedIncident((prev) => ({
        ...prev,
        status: "flagged",
        verdict: "rejected",
        confidenceScore: 0.08,
        capStatus: "REJECTED",
      }));
    }
  }, [selectedIncident]);

  const mergeDuplicate = useCallback((reportId, targetId) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "duplicate",
              duplicateOf: targetId,
              capStatus: "MERGED",
              assignedAgent: "Verification Agent",
            }
          : r
      )
    );
  }, []);

  /**
   * Real backend trigger or fallback simulated ingestion
   */
  const triggerLiveIngestion = useCallback(async (customParams = null) => {
    setIsIngesting(true);

    if (isBackendConnected) {
      try {
        const payload = customParams || {
          sources: ["sachet", "imd", "gdelt", "openmeteo", "mock"],
          mock_count: 20,
          state_or_district: "Punjab",
        };
        const res = await api.triggerIngestion(payload);

        if (res.success) {
          setLiveStreamAlert(`Real-World Ingestion: Signals gathered across ${payload.sources?.length || 5} sources.`);
          await loadBackendData(false);
          setTimeout(() => setLiveStreamAlert(null), 4500);
          setIsIngesting(false);
          return res;
        }
      } catch {
        // Fallback to local simulation if network failed
      }
    }

    // Local simulation fallback
    const randomLocations = [
      { name: "Patna riverbank, Bihar", district: "Patna", lat: 25.6093, lon: 85.1235, type: "flood" },
      { name: "Mandi highway, Himachal Pradesh", district: "Mandi", lat: 31.7087, lon: 76.9320, type: "landslide" },
      { name: "Visakhapatnam beach road, Andhra Pradesh", district: "Visakhapatnam", lat: 17.7231, lon: 83.3327, type: "cyclone" },
      { name: "Thane Ghodbunder Road, Maharashtra", district: "Thane", lat: 19.2600, lon: 72.9600, type: "heavy_rainfall" },
      { name: "Barmer desert belt, Rajasthan", district: "Barmer", lat: 25.7500, lon: 71.3900, type: "extreme_temperature" },
    ];

    const pick = randomLocations[Math.floor(Math.random() * randomLocations.length)];
    const newId = `REP-LIVE-${Date.now().toString().slice(-4)}`;

    const newReport = {
      id: newId,
      disasterType: pick.type,
      title: `[INFLUX DETECTED] Incident in ${pick.name}`,
      location: pick.name,
      district: pick.district,
      state: "India",
      coordinates: [pick.lon, pick.lat],
      latitude: pick.lat,
      longitude: pick.lon,
      timestamp: new Date().toISOString(),
      source: {
        platform: "citizen",
        account: "LiveFeedWatcher",
        reputation: 0.85,
        verifiedSource: false,
      },
      severity: Math.random() > 0.5 ? "high" : "critical",
      severityScore: 4.4,
      confidenceScore: 0.72,
      status: "pending",
      verdict: "review",
      clusterId: `QUEUE-SIM-${Date.now().toString().slice(-3)}`,
      description: `Newly intercepted crowd signal in ${pick.name}. Automatic C1 & C2 verification queueing.`,
      casualties: { injured: 0, stranded: 20, evacuated: 0 },
      checks: {
        official: { c1: "unknown", alertId: "PENDING", details: "Evaluating SACHET alerts..." },
        physical: { c2: "pass", rainfall_mm: 55.0, details: "Telemetry radar match active" },
        provenance: { c3: "pass", recycled: false, details: "Original crowd signal" },
        location: { c4: "pass", details: "Geotag confirmed" },
        corroboration: { c5: "unknown", count: 1, details: "Spatial clustering underway" },
      },
      tags: ["Live Influx", "Auto-Ingested"],
      assignedAgent: "Ingestion Agent",
      capStatus: "PENDING_VERDICT",
    };

    setReports((prev) => [newReport, ...prev]);
    setLiveStreamAlert(`Signal Intercepted: [${pick.type.toUpperCase()}] ${pick.name}`);
    setTimeout(() => setLiveStreamAlert(null), 4500);
    setIsIngesting(false);
  }, [isBackendConnected, loadBackendData]);

  // Interval for live simulation toggle
  useEffect(() => {
    let timer;
    if (isSimulatingLive) {
      timer = setInterval(() => {
        triggerLiveIngestion();
      }, 8000);
    }
    return () => clearInterval(timer);
  }, [isSimulatingLive, triggerLiveIngestion]);

  return {
    reports,
    filteredReports,
    priorityAlerts,
    rejectedReports,
    stats,
    backendStats,
    isBackendConnected,
    backendError,
    isRefreshing,
    isIngesting,
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
    verifyReport,
    flagReport,
    mergeDuplicate,
    triggerLiveIngestion,
    refreshBackendData: loadBackendData,
  };
}

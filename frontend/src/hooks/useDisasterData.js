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

  const loadBackendData = useCallback(async () => {
    setIsRefreshing(true);
    setBackendError(null);

    try {
      const healthRes = await api.checkHealth();
      if (!healthRes.success) {
        throw new Error(healthRes.error || "Backend service offline");
      }

      const [reportsRes, incidentsRes, statsRes] = await Promise.all([
        api.getReports({ limit: 300 }),
        api.getIncidents({ limit: 100 }),
        api.getStats(),
      ]);

      if (reportsRes.success && Array.isArray(reportsRes.data) && reportsRes.data.length > 0) {
        const normalizedReports = reportsRes.data.map(normalizeBackendReport).filter(Boolean);
        const normalizedIncidents =
          incidentsRes.success && Array.isArray(incidentsRes.data)
            ? incidentsRes.data.map(normalizeBackendIncident).filter(Boolean)
            : [];

        setReports([...normalizedIncidents, ...normalizedReports]);
        setIsBackendConnected(true);
        if (statsRes.success) setBackendStats(statsRes.data);
      } else {
        setIsBackendConnected(true);
      }
    } catch {
      setIsBackendConnected(false);
      setBackendError(
        "Backend server offline (port 8000). Active offline fallback dataset loaded for demo continuity."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = setTimeout(loadBackendData, 0);
    const interval = setInterval(loadBackendData, isBackendConnected ? 30000 : 5000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadBackendData, isBackendConnected]);

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      if (selectedType !== "all" && item.disasterType !== selectedType) return false;
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
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return [
          item.title,
          item.location,
          item.district,
          item.id,
          item.disasterType,
          item.description,
        ].some((value) => value?.toLowerCase().includes(query));
      }
      return true;
    });
  }, [reports, selectedType, selectedStatus, selectedSeverity, searchQuery]);

  const priorityAlerts = useMemo(
    () =>
      reports
        .filter(
          (report) =>
            (report.severity === "critical" || report.severity === "high") &&
            report.status !== "flagged" &&
            report.verdict !== "rejected"
        )
        .slice(0, 8),
    [reports]
  );

  const rejectedReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.verdict === "rejected" ||
          report.status === "flagged" ||
          report.checks?.provenance?.recycled
      ),
    [reports]
  );

  const stats = useMemo(() => {
    const calculated = calculateDashboardStats(reports);
    if (!backendStats || !isBackendConnected) return calculated;
    return {
      ...calculated,
      total: backendStats.total_reports || calculated.total,
      verified: backendStats.verified_reports || calculated.verified,
      pending: backendStats.review_reports || calculated.pending,
      flagged: backendStats.rejected_reports || calculated.flagged,
    };
  }, [reports, backendStats, isBackendConnected]);

  const verifyReport = useCallback(
    (reportId) => {
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "verified",
                verdict: "verified",
                confidenceScore: Math.max(report.confidenceScore || 0, 0.92),
                assignedAgent: "Ranking Agent",
                capStatus: "DISPATCHED",
                checks: {
                  ...report.checks,
                  official: {
                    ...report.checks?.official,
                    c1: "pass",
                    details: "Manual EOC operator verification confirmed",
                  },
                },
              }
            : report
        )
      );
      if (selectedIncident?.id === reportId) {
        setSelectedIncident((previous) => ({
          ...previous,
          status: "verified",
          verdict: "verified",
          confidenceScore: 0.95,
          capStatus: "DISPATCHED",
        }));
      }
    },
    [selectedIncident]
  );

  const flagReport = useCallback(
    (reportId, reason = "Disinformation / Recycled media detected") => {
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "flagged",
                verdict: "rejected",
                confidenceScore: 0.08,
                assignedAgent: "Verification Agent",
                capStatus: "REJECTED",
                reasons: [reason, ...(report.reasons || [])],
                checks: {
                  ...report.checks,
                  provenance: {
                    ...report.checks?.provenance,
                    c3: "fail",
                    recycled: true,
                    details: reason,
                  },
                },
              }
            : report
        )
      );
      if (selectedIncident?.id === reportId) {
        setSelectedIncident((previous) => ({
          ...previous,
          status: "flagged",
          verdict: "rejected",
          confidenceScore: 0.08,
          capStatus: "REJECTED",
        }));
      }
    },
    [selectedIncident]
  );

  const mergeDuplicate = useCallback((reportId, targetId) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: "duplicate",
              duplicateOf: targetId,
              capStatus: "MERGED",
              assignedAgent: "Verification Agent",
            }
          : report
      )
    );
  }, []);

  const triggerLiveIngestion = useCallback(
    async (customParams = null) => {
      setIsIngesting(true);
      if (isBackendConnected) {
        const payload = customParams || {
          sources: ["sachet", "imd", "gdelt", "openmeteo", "mock"],
          mock_count: 20,
          state_or_district: "Punjab",
        };
        const result = await api.triggerIngestion(payload);
        if (result.success) {
          setLiveStreamAlert(
            `Real-World Ingestion: Signals gathered across ${payload.sources?.length || 5} sources.`
          );
          await loadBackendData();
          setTimeout(() => setLiveStreamAlert(null), 4500);
          setIsIngesting(false);
          return result;
        }
      }

      const locations = [
        { name: "Patna riverbank, Bihar", district: "Patna", lat: 25.6093, lon: 85.1235, type: "flood" },
        { name: "Mandi highway, Himachal Pradesh", district: "Mandi", lat: 31.7087, lon: 76.932, type: "landslide" },
        { name: "Visakhapatnam beach road, Andhra Pradesh", district: "Visakhapatnam", lat: 17.7231, lon: 83.3327, type: "cyclone" },
        { name: "Thane Ghodbunder Road, Maharashtra", district: "Thane", lat: 19.26, lon: 72.96, type: "heavy_rainfall" },
        { name: "Barmer desert belt, Rajasthan", district: "Barmer", lat: 25.75, lon: 71.39, type: "extreme_temperature" },
      ];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const id = `REP-LIVE-${Date.now().toString().slice(-4)}`;
      setReports((prev) => [
        {
          id,
          disasterType: location.type,
          title: `[INFLUX DETECTED] Incident in ${location.name}`,
          location: location.name,
          district: location.district,
          state: "India",
          coordinates: [location.lon, location.lat],
          latitude: location.lat,
          longitude: location.lon,
          timestamp: new Date().toISOString(),
          source: { platform: "citizen", account: "LiveFeedWatcher", reputation: 0.85, verifiedSource: false },
          severity: Math.random() > 0.5 ? "high" : "critical",
          severityScore: 4.4,
          confidenceScore: 0.72,
          status: "pending",
          verdict: "review",
          clusterId: `QUEUE-SIM-${Date.now().toString().slice(-3)}`,
          description: `Newly intercepted crowd signal in ${location.name}. Automatic C1 & C2 verification queueing.`,
          casualties: { injured: 0, stranded: 20, evacuated: 0 },
          checks: {
            official: { c1: "unknown", alertId: "PENDING", details: "Evaluating SACHET alerts..." },
            physical: { c2: "pass", rainfall_mm: 55, details: "Telemetry radar match active" },
            provenance: { c3: "pass", recycled: false, details: "Original crowd signal" },
            location: { c4: "pass", details: "Geotag confirmed" },
            corroboration: { c5: "unknown", count: 1, details: "Spatial clustering underway" },
          },
          tags: ["Live Influx", "Auto-Ingested"],
          assignedAgent: "Ingestion Agent",
          capStatus: "PENDING_VERDICT",
        },
        ...prev,
      ]);
      setLiveStreamAlert(`Signal Intercepted: [${location.type.toUpperCase()}] ${location.name}`);
      setTimeout(() => setLiveStreamAlert(null), 4500);
      setIsIngesting(false);
    },
    [isBackendConnected, loadBackendData]
  );

  useEffect(() => {
    if (!isSimulatingLive) return undefined;
    const timer = setInterval(() => triggerLiveIngestion(), 8000);
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

import { useState, useMemo, useEffect, useCallback } from "react";
import { MOCK_REPORTS } from "../data/mockDisasters";
import { calculateDashboardStats } from "../utils/formatters";

export function useDisasterData() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSimulatingLive, setIsSimulatingLive] = useState(false);
  const [liveStreamAlert, setLiveStreamAlert] = useState(null);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Type match
      if (selectedType !== "all" && item.disasterType !== selectedType) {
        return false;
      }
      // Status match
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
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

  // Priority alerts (Critical and High severity incidents that are verified or pending)
  const priorityAlerts = useMemo(() => {
    return reports
      .filter((r) => (r.severity === "critical" || r.severity === "high") && r.status !== "flagged")
      .slice(0, 8);
  }, [reports]);

  // Derived dashboard statistics
  const stats = useMemo(() => {
    return calculateDashboardStats(reports);
  }, [reports]);

  // Verification actions
  const verifyReport = useCallback((reportId) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "verified",
              confidenceScore: Math.max(r.confidenceScore, 0.92),
              assignedAgent: "Verification Agent",
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
              confidenceScore: 0.08,
              assignedAgent: "Verification Agent",
              capStatus: "REJECTED",
              checks: {
                ...r.checks,
                provenance: { c3: "fail", recycled: true, details: reason },
              },
            }
          : r
      )
    );
    if (selectedIncident && selectedIncident.id === reportId) {
      setSelectedIncident((prev) => ({
        ...prev,
        status: "flagged",
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

  // Simulate an incoming report
  const addSimulatedIncomingReport = useCallback(() => {
    const randomLocations = [
      { name: "Patna riverbank, Bihar", district: "Patna", lat: 25.6093, lon: 85.1235, type: "flood" },
      { name: "Mandi highway, Himachal Pradesh", district: "Mandi", lat: 31.7087, lon: 76.9320, type: "landslide" },
      { name: "Visakhapatnam beach road, Andhra Pradesh", district: "Visakhapatnam", lat: 17.7231, lon: 83.3327, type: "cyclone" },
      { name: "Thane Ghodbunder Road, Maharashtra", district: "Thane", lat: 19.2600, lon: 72.9600, type: "heavy_rainfall" },
      { name: "Barmer desert belt, Rajasthan", district: "Barmer", lat: 25.7500, lon: 71.3900, type: "extreme_temperature" },
      { name: "Champhai, Mizoram", district: "Champhai", lat: 23.4756, lon: 93.3283, type: "earthquake" },
    ];

    const pick = randomLocations[Math.floor(Math.random() * randomLocations.length)];
    const newId = `REP-SIM-${Date.now().toString().slice(-4)}`;

    const newReport = {
      id: newId,
      disasterType: pick.type,
      title: `[LIVE SIMULATED] Influx alert in ${pick.name}`,
      location: pick.name,
      district: pick.district,
      state: "India",
      coordinates: [pick.lon, pick.lat],
      latitude: pick.lat,
      longitude: pick.lon,
      timestamp: new Date().toISOString(),
      source: {
        platform: "citizen_app",
        account: "LiveFeedWatcher",
        reputation: 0.85,
        verifiedSource: false,
      },
      severity: Math.random() > 0.5 ? "high" : "critical",
      severityScore: 4.4,
      confidenceScore: 0.72,
      status: "pending",
      clusterId: `QUEUE-SIM-${Date.now().toString().slice(-3)}`,
      description: `Newly intercepted signal from crowd telemetry in ${pick.name}. Automatic C1 & C2 verification queueing.`,
      casualties: { injured: 0, stranded: 20, evacuated: 0 },
      checks: {
        official: { c1: "unknown", alertId: "PENDING", details: "Evaluating SACHET alerts..." },
        physical: { c2: "pass", rainfall_mm: 55.0, details: "Telemetry radar match active" },
        provenance: { c3: "pass", recycled: false, details: "Original crowd signal" },
        location: { c4: "pass", details: "Geotag confirmed" },
        corroboration: { c5: "unknown", count: 1, details: "Spatial clustering underway" },
      },
      tags: ["Simulated Influx", "Live Feed", "Auto-Ingested"],
      assignedAgent: "Ingestion Agent",
      capStatus: "PENDING_VERDICT",
    };

    setReports((prev) => [newReport, ...prev]);
    setLiveStreamAlert(`New Influx: [${pick.type.toUpperCase()}] ${pick.name}`);
    setTimeout(() => setLiveStreamAlert(null), 4500);
  }, []);

  // Interval for live simulation
  useEffect(() => {
    let timer;
    if (isSimulatingLive) {
      timer = setInterval(() => {
        addSimulatedIncomingReport();
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isSimulatingLive, addSimulatedIncomingReport]);

  return {
    reports,
    filteredReports,
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
    verifyReport,
    flagReport,
    mergeDuplicate,
    addSimulatedIncomingReport,
  };
}

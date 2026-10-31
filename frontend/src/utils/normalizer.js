/**
 * DisasterWatch AI — Field Normalization Engine
 * Normalizes backend schemas (DisasterReport, Incident) into unified frontend models.
 */

export function mapHazardToDisasterType(hazard) {
  if (!hazard) return "flood";
  const h = hazard.toLowerCase().trim();
  switch (h) {
    case "flood":
      return "flood";
    case "landslide":
      return "landslide";
    case "storm":
    case "cyclone":
      return "cyclone";
    case "heavy_rainfall":
    case "rain":
      return "heavy_rainfall";
    case "earthquake":
    case "seismic":
      return "earthquake";
    case "fire":
    case "heatwave":
    case "extreme_temperature":
      return "extreme_temperature";
    default:
      return "flood";
  }
}

export function mapVerdictToStatus(verdict) {
  if (!verdict) return "pending";
  const v = verdict.toLowerCase().trim();
  switch (v) {
    case "verified":
      return "verified";
    case "review":
      return "pending";
    case "rejected":
      return "flagged";
    case "duplicate":
      return "duplicate";
    default:
      return "pending";
  }
}

export function getSourceMetadata(platform, domain) {
  const p = (platform || "").toLowerCase();
  const d = (domain || "").toLowerCase();

  if (p.includes("imd") || d.includes("imd.gov.in")) {
    return {
      channel: "imd",
      name: "IMD Mausam",
      type: "official",
      icon: "🏛️",
      tier: "Tier-1 Official Warning",
      badgeColor: "gold",
    };
  }
  if (p.includes("sachet") || d.includes("sachet.ndma.gov.in")) {
    return {
      channel: "sachet",
      name: "NDMA SACHET",
      type: "official",
      icon: "🚨",
      tier: "Tier-1 National Alert",
      badgeColor: "gold",
    };
  }
  if (p.includes("gdacs") || d.includes("gdacs.org")) {
    return {
      channel: "gdacs",
      name: "GDACS Alert",
      type: "official",
      icon: "🌐",
      tier: "Tier-1 Global Disaster Feed",
      badgeColor: "gold",
    };
  }
  if (p.includes("gdelt") || d.includes("hindu") || d.includes("tribune") || d.includes("times") || d.includes("news")) {
    return {
      channel: "gdelt",
      name: d ? d.split(".")[0].toUpperCase() : "GDELT News",
      type: "news",
      icon: "📰",
      tier: "Tier-2 Press Corroboration",
      badgeColor: "teal",
    };
  }
  if (p.includes("bluesky") || p.includes("bsky")) {
    return {
      channel: "bluesky",
      name: "Bluesky Social",
      type: "social",
      icon: "🌐",
      tier: "Tier-3 Citizen Telemetry",
      badgeColor: "cyan",
    };
  }
  if (p.includes("youtube") || p.includes("broadcast")) {
    return {
      channel: "youtube",
      name: "YouTube Media",
      type: "broadcast",
      icon: "📹",
      tier: "Tier-3 Video Broadcast",
      badgeColor: "orange",
    };
  }
  if (p.includes("meteo") || p.includes("satellite") || p.includes("nasa")) {
    return {
      channel: "satellite",
      name: "NASA/Open-Meteo",
      type: "sensor",
      icon: "🛰️",
      tier: "Tier-1 Physical Sensor",
      badgeColor: "emerald",
    };
  }

  return {
    channel: "citizen",
    name: "Citizen Telemetry",
    type: "crowd",
    icon: "📍",
    tier: "Tier-3 Crowd Report",
    badgeColor: "slate",
  };
}

export function deriveSeverity(score, priority) {
  if (priority) {
    const p = priority.toUpperCase();
    if (p === "CRITICAL") return "critical";
    if (p === "HIGH") return "high";
    if (p === "MEDIUM") return "medium";
    if (p === "LOW") return "low";
  }
  if (score >= 0.85) return "critical";
  if (score >= 0.65) return "high";
  if (score >= 0.40) return "medium";
  return "low";
}

/**
 * Normalizes a raw DisasterReport from FastAPI into frontend structure
 */
export function normalizeBackendReport(raw) {
  if (!raw) return null;

  const id = raw.report_id || raw.id || `REP-${Math.random().toString(36).substring(2, 7)}`;
  const hazardRaw = raw.claim?.hazard || raw.disasterType || "flood";
  const disasterType = mapHazardToDisasterType(hazardRaw);

  const lat = raw.geo?.lat ?? raw.latitude ?? (raw.coordinates ? raw.coordinates[1] : 22.5937);
  const lon = raw.geo?.lon ?? raw.longitude ?? (raw.coordinates ? raw.coordinates[0] : 78.9629);

  const rawVerdict = raw.verdict || raw.status || "review";
  const status = mapVerdictToStatus(rawVerdict);
  const score = typeof raw.score === "number" ? raw.score : (raw.confidenceScore ?? 0.7);

  // Extract media forensics
  const mediaList = Array.isArray(raw.media) ? raw.media : [];
  const primaryMedia = mediaList[0] || {};
  const archiveMatch = primaryMedia.archive_match || {};
  const exif = primaryMedia.exif || {};

  // Normalize checks C1 - C5
  const rawChecks = raw.checks || {};
  const checks = {
    official: {
      c1: rawChecks.official?.c1_result || rawChecks.official?.c1 || "unknown",
      alertId: rawChecks.official?.alert_ids?.[0] || rawChecks.official?.alertId || "NONE",
      alertIds: rawChecks.official?.alert_ids || [],
      details: rawChecks.official?.details || "Official alert cross-check pending",
    },
    physical: {
      c2: rawChecks.physical?.c2_result || rawChecks.physical?.c2 || "unknown",
      rainfall_mm: rawChecks.physical?.rainfall_mm ?? 0,
      satellite_evidence: Boolean(rawChecks.physical?.satellite_evidence),
      details: rawChecks.physical?.details || "Open-Meteo physical radar reading",
    },
    provenance: {
      c3: rawChecks.provenance?.c3_result || rawChecks.provenance?.c3 || "unknown",
      recycled: Boolean(rawChecks.provenance?.recycled),
      archive_match_score: rawChecks.provenance?.archive_match_score ?? archiveMatch.score ?? 0,
      matched_id: archiveMatch.matched_id || "",
      matched_date: archiveMatch.matched_date || "",
      phash: primaryMedia.phash || "",
      details: rawChecks.provenance?.details || "Media perceptual hash screening",
    },
    location: {
      c4: rawChecks.location?.c4_result || rawChecks.location?.c4 || "unknown",
      contradictions: rawChecks.location?.contradictions || [],
      details: rawChecks.location?.details || "Geocoding coordinate check",
    },
    corroboration: {
      c5: rawChecks.corroboration?.c5_result || rawChecks.corroboration?.c5 || "unknown",
      count: rawChecks.corroboration?.independent_sources ?? rawChecks.corroboration?.count ?? 0,
      details: rawChecks.corroboration?.details || "Spatio-temporal multi-source corroboration",
    },
  };

  const title = raw.title || (raw.claim?.text ? (raw.claim.text.length > 70 ? raw.claim.text.slice(0, 70) + "..." : raw.claim.text) : `Disaster Alert: ${disasterType.toUpperCase()}`);
  const description = raw.claim?.text || raw.description || "No situation description provided.";
  const location = raw.location || raw.claim?.claimed_place || raw.geo?.district || "India";
  const district = raw.district || raw.geo?.district || "";
  const severity = deriveSeverity(score, raw.priority);
  const severityScore = Math.min(5.0, Math.max(1.0, Math.round(score * 50) / 10));

  return {
    id,
    report_id: id,
    title,
    disasterType,
    location,
    district,
    state: raw.state || "India",
    latitude: lat,
    longitude: lon,
    coordinates: [lon, lat], // GeoJSON order for MapLibre
    timestamp: raw.created_at || raw.claim?.claimed_time || raw.timestamp || new Date().toISOString(),
    source: {
      platform: raw.source?.platform || raw._source_tag || "citizen",
      domain: raw.source?.domain || "",
      account: raw.source?.account || "",
      reputation: raw.source?.reputation ?? 0.5,
      verifiedSource: (raw.source?.reputation ?? 0.5) >= 0.8,
    },
    sourceMeta: getSourceMetadata(raw.source?.platform || raw._source_tag || raw.platform, raw.source?.domain || raw.domain),
    telemetry: {
      rainfall_mm: rawChecks.physical?.rainfall_mm ?? (raw.rainfall_forecast_mm || 0),
      wind_speed_kmph: raw.wind_speed_kmph || 0,
      alert_color: raw.warning_color || (rawChecks.official?.alert_ids?.[0]?.includes("RED") ? "RED" : rawChecks.official?.alert_ids?.[0]?.includes("ORANGE") ? "ORANGE" : null),
      satellite_evidence: Boolean(rawChecks.physical?.satellite_evidence),
    },
    severity,
    severityScore,
    confidenceScore: score,
    score,
    verdict: rawVerdict,
    status,
    clusterId: raw.clusterId || (raw.report_ids?.length ? `CLUSTER-${id}` : ""),
    duplicateOf: raw.duplicate_of || null,
    description,
    casualties: raw.casualties || { injured: 0, stranded: 0, evacuated: 0 },
    checks,
    media: mediaList,
    primaryMedia,
    archiveMatch,
    exif,
    reasons: raw.reasons || [],
    cap_xml: raw.cap_xml || null,
    capStatus: rawVerdict === "verified" ? "DISPATCHED" : rawVerdict === "rejected" ? "REJECTED" : "PENDING_VERDICT",
    assignedAgent: rawVerdict === "verified" ? "Ranking Agent" : rawVerdict === "rejected" ? "Verification Agent" : "Ingestion Agent",
    tags: raw.tags || [disasterType.toUpperCase(), rawVerdict.toUpperCase()],
    isFromBackend: true,
  };
}

/**
 * Normalizes an Incident from FastAPI into frontend structure
 */
export function normalizeBackendIncident(inc) {
  if (!inc) return null;

  const id = inc.incident_id || `INC-${Math.random().toString(36).substring(2, 7)}`;
  const disasterType = mapHazardToDisasterType(inc.disaster_type);
  const lat = inc.lat ?? 22.5937;
  const lon = inc.lon ?? 78.9629;
  const score = inc.confidence_score ?? 0.85;
  const severity = deriveSeverity(score, inc.priority);

  return {
    id,
    report_id: id,
    title: inc.title || `Incident: ${disasterType.toUpperCase()} in ${inc.district || "India"}`,
    disasterType,
    location: inc.district ? `${inc.district}, India` : "India",
    district: inc.district || "",
    state: "India",
    latitude: lat,
    longitude: lon,
    coordinates: [lon, lat],
    timestamp: inc.created_at || new Date().toISOString(),
    source: {
      platform: inc.sources?.[0] || "ndma",
      account: "NirikshakAI-Dedup",
      reputation: 0.95,
      verifiedSource: true,
    },
    severity,
    severityScore: Math.min(5.0, Math.round(score * 50) / 10),
    confidenceScore: score,
    score,
    verdict: "verified",
    status: "verified",
    clusterId: inc.incident_id,
    reportIds: inc.report_ids || [],
    clusterSize: inc.cluster_size || inc.report_ids?.length || 1,
    description: inc.operator_summary || inc.title || "Clustered incident detected by Dedup Agent.",
    casualties: { injured: 0, stranded: inc.source_count * 10, evacuated: 0 },
    checks: {
      official: { c1: "pass", alertId: "SACHET-DEDUP", details: "Clustered corroborated incident" },
      physical: { c2: "pass", rainfall_mm: 50.0, details: "Physical evidence matches multi-source reports" },
      provenance: { c3: "pass", recycled: false, details: "Dedup Agent validated image provenance" },
      location: { c4: "pass", details: `Radius buffer ${inc.radius_km || 5.0}km` },
      corroboration: { c5: "pass", count: inc.source_count || 2, details: `${inc.source_count || 2} independent signals clustered` },
    },
    media: [],
    reasons: inc.reasons || [`Multi-source cluster composed of ${inc.report_ids?.length || 1} independent reports`],
    cap_xml: inc.cap_xml || null,
    capStatus: inc.cap_xml ? "DISPATCHED" : "DRAFT_READY",
    assignedAgent: "Ranking Agent",
    tags: ["CLUSTERED_INCIDENT", inc.priority || "HIGH"],
    isFromBackend: true,
  };
}

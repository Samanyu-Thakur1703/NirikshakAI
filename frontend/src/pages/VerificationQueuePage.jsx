import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  GitMerge,
  Check,
  X,
} from "lucide-react";
import { DisasterTypeBadge, SeverityBadge } from "../components/common/Badge";
import { formatTimeAgo } from "../utils/formatters";

export function VerificationQueuePage({
  reports = [],
  rejectedReports = [],
  onVerify,
  onFlag,
  onMerge,
  onSelectIncident,
}) {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "duplicates" | "rejected"

  const pendingReports = reports.filter((r) => r.verdict === "review" || r.status === "pending");
  const rejectedItems = rejectedReports.length > 0 ? rejectedReports : reports.filter((r) => r.verdict === "rejected" || r.status === "flagged");

  // Pair primary and duplicate for comparison demo
  const duplicatePairs = [
    {
      clusterId: "CLUSTER-PB-01",
      hazard: "flood",
      primary: reports.find((r) => r.id === "REP-IN-2026-0101" || r.id === "r_0001"),
      secondary: reports.find((r) => r.id === "REP-IN-2026-0102" || r.id === "r_0002"),
      distanceMeters: 480,
      timeDeltaMins: 7,
      similarityScore: "89.4%",
      recommendation: "MERGE_AS_DUPLICATE",
    },
    {
      clusterId: "CLUSTER-MH-01",
      hazard: "heavy_rainfall",
      primary: reports.find((r) => r.id === "REP-IN-2026-0107" || r.id === "r_0010"),
      secondary: reports.find((r) => r.id === "REP-IN-2026-0108" || r.id === "r_0012"),
      distanceMeters: 2800,
      timeDeltaMins: 4,
      similarityScore: "93.1%",
      recommendation: "MERGE_AS_DUPLICATE",
    },
    {
      clusterId: "CLUSTER-KL-RECYCLED",
      hazard: "landslide",
      primary: reports.find((r) => r.id === "REP-IN-2026-0105" || r.id === "r_0021"),
      secondary: reports.find((r) => r.id === "REP-IN-2026-0106" || r.id === "r_0237"),
      distanceMeters: 5600,
      timeDeltaMins: 40,
      similarityScore: "97.4% (pHash Match)",
      recommendation: "FLAG_RECYCLED_FAKE",
    },
  ].filter((p) => p.primary && p.secondary);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#252C2A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#183D35]" />
            Verification, Deduplication & Hoax Workbench
          </h2>
          <p className="text-xs text-[#737D78] mt-0.5">
            Multi-agent cross-validation, 5-pillar verification matrix, and spatio-temporal cluster deduplication
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border ${
              activeTab === "pending"
                ? "bg-[#183D35] text-white border-[#183D35]"
                : "bg-[#FFFFFF] text-[#737D78] border-[#E1E5E0] hover:text-[#252C2A]"
            }`}
          >
            Review Queue ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border ${
              activeTab === "duplicates"
                ? "bg-[#183D35] text-white border-[#183D35]"
                : "bg-[#FFFFFF] text-[#737D78] border-[#E1E5E0] hover:text-[#252C2A]"
            }`}
          >
            Deduplication Clusters ({duplicatePairs.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border ${
              activeTab === "rejected"
                ? "bg-[#C94C4C] text-white border-[#C94C4C]"
                : "bg-[#FFFFFF] text-[#C94C4C] border-[#E1E5E0] hover:bg-[#C94C4C]/5"
            }`}
          >
            Rejected / Hoaxes ({rejectedItems.length})
          </button>
        </div>
      </div>

      {/* 1. Pending Review Tab */}
      {activeTab === "pending" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 hover:border-[#183D35] transition-colors flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs text-[#183D35] font-bold">#{report.id}</span>
                    <div className="flex items-center gap-1">
                      <DisasterTypeBadge type={report.disasterType} size="xs" />
                      <SeverityBadge severity={report.severity} size="xs" />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-[#252C2A] mb-1">{report.title}</h3>
                  <p className="text-xs text-[#737D78] leading-relaxed mb-2.5">{report.description}</p>

                  <div className="bg-[#F8F9F7] p-2.5 rounded border border-[#E1E5E0] text-[11px] space-y-1 mb-2.5">
                    <div className="flex justify-between text-[#737D78]">
                      <span>Location:</span>
                      <span className="text-[#252C2A] font-medium">📍 {report.location}</span>
                    </div>
                    <div className="flex justify-between text-[#737D78]">
                      <span>Report Source:</span>
                      <span className="text-[#252C2A] font-medium capitalize">
                        {report.sourceMeta?.icon} {report.sourceMeta?.name || report.source?.platform} ({report.source?.account || "Verified Citizen"})
                      </span>
                    </div>
                    <div className="flex justify-between text-[#737D78]">
                      <span>Score & Consensus:</span>
                      <span className="font-mono text-[#183D35] font-semibold">
                        Score: {((report.confidenceScore || 0.8) * 100).toFixed(0)}% • Lane: {report.verdict || "review"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#E1E5E0] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectIncident(report)}
                    className="text-xs text-[#183D35] hover:underline font-medium cursor-pointer"
                  >
                    Inspect Full Dossier
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onFlag(report.id, "Flagged by Operator in Review Queue")}
                      className="px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#C94C4C]/10 text-[#C94C4C] border border-[#E1E5E0] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Flag Hoax
                    </button>
                    <button
                      onClick={() => onVerify(report.id)}
                      className="px-2.5 py-1 rounded bg-[#183D35] hover:bg-[#214D43] text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pendingReports.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-10 text-center text-[#737D78]">
              <CheckCircle className="w-8 h-8 text-[#183D35] mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-semibold text-[#252C2A] mb-1">Review Queue Clear</h3>
              <p className="text-xs text-[#737D78]">All incoming disaster reports have been verified or resolved.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Deduplication Clusters Tab */}
      {activeTab === "duplicates" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {duplicatePairs.map((pair) => (
              <div
                key={pair.clusterId}
                className="bg-[#FFFFFF] border border-[#E1E5E0] rounded overflow-hidden shadow-2xs"
              >
                {/* Cluster Header */}
                <div className="px-4 py-2.5 bg-[#F8F9F7] border-b border-[#E1E5E0] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#183D35] font-bold">
                      Cluster: {pair.clusterId}
                    </span>
                    <DisasterTypeBadge type={pair.hazard} size="xs" />
                    <span className="text-[11px] text-[#737D78]">
                      Distance: <strong className="text-[#252C2A] font-mono">{pair.distanceMeters}m</strong>
                    </span>
                    <span className="text-[#E1E5E0]">•</span>
                    <span className="text-[11px] text-[#737D78]">
                      Time Delta: <strong className="text-[#252C2A] font-mono">{pair.timeDeltaMins} mins</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#FFFFFF] text-[#183D35] border border-[#E1E5E0]">
                      Similarity: {pair.similarityScore}
                    </span>
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#183D35]/10 text-[#183D35] border border-[#183D35]/25">
                      {pair.recommendation}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="bg-[#F8F9F7] p-3 rounded border border-[#E1E5E0] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#183D35] font-semibold bg-[#183D35]/10 px-2 py-0.5 rounded border border-[#183D35]/20">
                        Primary Anchor Incident
                      </span>
                      <span className="font-mono text-xs text-[#737D78]">{pair.primary.id}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-[#252C2A]">{pair.primary.title}</h4>
                    <p className="text-[11px] text-[#737D78] leading-relaxed">{pair.primary.description}</p>

                    <div className="text-[10px] text-[#737D78] pt-1.5 border-t border-[#E1E5E0] flex items-center justify-between">
                      <span>📍 {pair.primary.location}</span>
                      <span className="font-mono text-[#183D35] font-semibold">
                        Score: {Math.round((pair.primary.confidenceScore || 0.85) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F8F9F7] p-3 rounded border border-[#E1E5E0] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#737D78] font-semibold bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E1E5E0]">
                        Incoming Candidate Report
                      </span>
                      <span className="font-mono text-xs text-[#737D78]">{pair.secondary.id}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-[#252C2A]">{pair.secondary.title}</h4>
                    <p className="text-[11px] text-[#737D78] leading-relaxed">{pair.secondary.description}</p>

                    <div className="text-[10px] text-[#737D78] pt-1.5 border-t border-[#E1E5E0] flex items-center justify-between">
                      <span>📍 {pair.secondary.location}</span>
                      <span className="font-mono text-[#737D78]">
                        Status: <strong className="capitalize text-[#252C2A]">{pair.secondary.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-4 py-2.5 bg-[#F8F9F7] border-t border-[#E1E5E0] flex items-center justify-between">
                  <div className="text-[11px] text-[#737D78]">
                    DBSCAN Confidence: <strong className="text-[#183D35] font-mono">94.8% match certainty</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectIncident(pair.secondary)}
                      className="px-2.5 py-1 text-xs rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#252C2A] font-medium border border-[#E1E5E0] cursor-pointer"
                    >
                      Compare Media
                    </button>
                    <button
                      onClick={() => onMerge(pair.secondary.id, pair.primary.id)}
                      className="px-3 py-1 text-xs rounded bg-[#183D35] hover:bg-[#214D43] text-white font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      Merge as Duplicate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DEDICATED REJECTED / HOAX VAULT */}
      {activeTab === "rejected" && (
        <div className="space-y-3">
          <div className="p-3.5 rounded bg-[#C94C4C]/10 border border-[#C94C4C]/30 text-xs text-[#C94C4C] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#C94C4C] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#252C2A] block text-xs mb-0.5 uppercase tracking-wide">
                Rejected Reports & Hoax Detection Vault
              </span>
              <p className="text-[#737D78] leading-relaxed text-[11px]">
                These signals failed the multi-agent verification pipeline due to hard-fail flags: recycled historical media, physical sensor contradictions (e.g. claims of flood with 0.0mm precipitation), or location discrepancies &gt; 50km.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rejectedItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 flex flex-col justify-between shadow-2xs hover:border-[#C94C4C]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs text-[#C94C4C] font-bold">#{item.id}</span>
                    <div className="flex items-center gap-1">
                      <DisasterTypeBadge type={item.disasterType} size="xs" />
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/25">
                        REJECTED
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-[#252C2A] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#737D78] leading-relaxed mb-2.5">{item.description}</p>

                  <div className="p-2.5 rounded bg-[#F8F9F7] border border-[#E1E5E0] text-[11px] space-y-1 mb-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#737D78]">Confidence Score:</span>
                      <span className="font-mono text-[#C94C4C] font-semibold">
                        {((item.confidenceScore || 0.25) * 100).toFixed(0)}% (Fail threshold &lt; 40%)
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#737D78]">Provenance Check (C3):</span>
                      <span className={item.checks?.provenance?.recycled ? "text-[#C94C4C] font-semibold" : "text-[#737D78]"}>
                        {item.checks?.provenance?.recycled
                          ? `Recycled Media Flagged (${(
                              (item.checks?.provenance?.archive_match_score || 0.95) * 100
                            ).toFixed(0)}% match)`
                          : item.checks?.provenance?.details || "Screened"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#737D78]">Hard-Fail Reason:</span>
                      <span className="text-[#C94C4C] font-medium truncate max-w-[200px]">
                        {item.reasons?.[0] || "Sensor contradiction with satellite precipitation"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#E1E5E0] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#737D78]">
                    Logged: {formatTimeAgo(item.timestamp)}
                  </span>
                  <button
                    onClick={() => onSelectIncident(item)}
                    className="px-2.5 py-1 text-xs rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#C94C4C] border border-[#E1E5E0] font-medium cursor-pointer"
                  >
                    Inspect Provenance Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

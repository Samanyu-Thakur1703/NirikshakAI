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
    <div className="space-y-3">
      {/* Top Banner */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            Verification, Deduplication & Hoax Workbench
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Autonomous multi-agent cross-validation, 5-pillar verification matrix, and spatio-temporal cluster deduplication
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
              activeTab === "pending"
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-white"
            }`}
          >
            Review Queue ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
              activeTab === "duplicates"
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-white"
            }`}
          >
            Deduplication Clusters ({duplicatePairs.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
              activeTab === "rejected"
                ? "bg-[#DC2626] text-white border-[#DC2626]"
                : "bg-[#111827] text-[#EF4444] border-[#1E293B] hover:bg-[#7F1D1D]/30"
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
                className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 hover:border-[#38BDF8] transition-colors flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs text-[#38BDF8] font-bold">#{report.id}</span>
                    <div className="flex items-center gap-1">
                      <DisasterTypeBadge type={report.disasterType} size="xs" />
                      <SeverityBadge severity={report.severity} size="xs" />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1">{report.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-2.5">{report.description}</p>

                  <div className="bg-[#0E1526] p-2.5 rounded-lg border border-[#1E293B] text-[11px] space-y-1 mb-2.5">
                    <div className="flex justify-between text-[#94A3B8]">
                      <span>Location:</span>
                      <span className="text-white font-medium">📍 {report.location}</span>
                    </div>
                    <div className="flex justify-between text-[#94A3B8]">
                      <span>Report Source:</span>
                      <span className="text-slate-200 font-medium capitalize">
                        {report.sourceMeta?.icon} {report.sourceMeta?.name || report.source?.platform} ({report.source?.account || "Verified Citizen"})
                      </span>
                    </div>
                    <div className="flex justify-between text-[#94A3B8]">
                      <span>Score & Consensus:</span>
                      <span className="font-mono text-[#38BDF8] font-semibold">
                        Score: {((report.confidenceScore || 0.8) * 100).toFixed(0)}% • Lane: {report.verdict || "review"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#1E293B] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectIncident(report)}
                    className="text-xs text-[#38BDF8] hover:underline font-medium cursor-pointer"
                  >
                    Inspect Full Dossier
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onFlag(report.id, "Flagged by Operator in Review Queue")}
                      className="px-2.5 py-1 rounded bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Flag Hoax
                    </button>
                    <button
                      onClick={() => onVerify(report.id)}
                      className="px-3 py-1 rounded bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
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
            <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-10 text-center text-[#94A3B8]">
              <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-semibold text-white mb-1">Review Queue Clear</h3>
              <p className="text-xs text-[#64748B]">All incoming disaster reports have been verified or resolved.</p>
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
                className="bg-[#0B101B] border border-[#1E293B] rounded-xl overflow-hidden shadow-md"
              >
                {/* Cluster Header */}
                <div className="px-4 py-2.5 bg-[#0E1526] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#38BDF8] font-bold">
                      Cluster: {pair.clusterId}
                    </span>
                    <DisasterTypeBadge type={pair.hazard} size="xs" />
                    <span className="text-[11px] text-[#94A3B8]">
                      Distance: <strong className="text-white font-mono">{pair.distanceMeters}m</strong>
                    </span>
                    <span className="text-[#334155]">•</span>
                    <span className="text-[11px] text-[#94A3B8]">
                      Time Delta: <strong className="text-white font-mono">{pair.timeDeltaMins} mins</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#111827] text-[#38BDF8] border border-[#1E293B]">
                      Similarity: {pair.similarityScore}
                    </span>
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40">
                      {pair.recommendation}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="bg-[#0E1526] p-3 rounded-lg border border-[#1E293B] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] font-semibold bg-[#F59E0B]/15 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                        Primary Anchor Incident
                      </span>
                      <span className="font-mono text-xs text-[#64748B]">{pair.primary.id}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-white">{pair.primary.title}</h4>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">{pair.primary.description}</p>

                    <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#1E293B] flex items-center justify-between">
                      <span>📍 {pair.primary.location}</span>
                      <span className="font-mono text-[#38BDF8] font-semibold">
                        Score: {Math.round((pair.primary.confidenceScore || 0.85) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0E1526] p-3 rounded-lg border border-[#1E293B] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] font-semibold bg-[#2563EB]/15 px-2 py-0.5 rounded border border-[#2563EB]/30">
                        Incoming Candidate Report
                      </span>
                      <span className="font-mono text-xs text-[#64748B]">{pair.secondary.id}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-white">{pair.secondary.title}</h4>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">{pair.secondary.description}</p>

                    <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#1E293B] flex items-center justify-between">
                      <span>📍 {pair.secondary.location}</span>
                      <span className="font-mono text-[#64748B]">
                        Status: <strong className="capitalize text-slate-200">{pair.secondary.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-4 py-2.5 bg-[#0E1526] border-t border-[#1E293B] flex items-center justify-between">
                  <div className="text-[11px] text-[#94A3B8]">
                    DBSCAN Confidence: <strong className="text-[#10B981] font-mono">94.8% match certainty</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectIncident(pair.secondary)}
                      className="px-2.5 py-1 text-xs rounded bg-[#111827] hover:bg-[#1E293B] text-slate-200 font-medium border border-[#1E293B] cursor-pointer"
                    >
                      Compare Media
                    </button>
                    <button
                      onClick={() => onMerge(pair.secondary.id, pair.primary.id)}
                      className="px-3 py-1 text-xs rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium flex items-center gap-1 cursor-pointer"
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
          <div className="p-3.5 rounded-xl bg-[#7F1D1D]/30 border border-[#EF4444]/40 text-xs text-red-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block text-xs mb-0.5 uppercase tracking-wide">
                Rejected Reports & Hoax Detection Vault
              </span>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                These signals failed the multi-agent verification pipeline due to hard-fail flags: recycled historical media, physical sensor contradictions (e.g. claims of flood with 0.0mm precipitation), or location discrepancies &gt; 50km.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rejectedItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-[#EF4444]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs text-[#EF4444] font-bold">#{item.id}</span>
                    <div className="flex items-center gap-1">
                      <DisasterTypeBadge type={item.disasterType} size="xs" />
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                        REJECTED
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-2.5">{item.description}</p>

                  <div className="p-2.5 rounded-lg bg-[#0E1526] border border-[#1E293B] text-[11px] space-y-1 mb-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Confidence Score:</span>
                      <span className="font-mono text-[#EF4444] font-semibold">
                        {((item.confidenceScore || 0.25) * 100).toFixed(0)}% (Fail threshold &lt; 40%)
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Provenance Check (C3):</span>
                      <span className={item.checks?.provenance?.recycled ? "text-[#EF4444] font-semibold" : "text-slate-300"}>
                        {item.checks?.provenance?.recycled
                          ? `Recycled Media Flagged (${(
                              (item.checks?.provenance?.archive_match_score || 0.95) * 100
                            ).toFixed(0)}% match)`
                          : item.checks?.provenance?.details || "Screened"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Hard-Fail Reason:</span>
                      <span className="text-[#F59E0B] font-medium truncate max-w-[200px]">
                        {item.reasons?.[0] || "Sensor contradiction with satellite precipitation"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#64748B]">
                    Logged: {formatTimeAgo(item.timestamp)}
                  </span>
                  <button
                    onClick={() => onSelectIncident(item)}
                    className="px-2.5 py-1 text-xs rounded bg-[#111827] hover:bg-[#1E293B] text-[#EF4444] border border-[#1E293B] font-medium cursor-pointer"
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

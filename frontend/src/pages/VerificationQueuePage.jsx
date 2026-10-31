import React, { useState } from "react";
import {
  ShieldCheck,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  GitMerge,
  Eye,
  Check,
  X,
  FileCheck,
  Sparkles,
  Binary,
  Search,
  Camera,
  Zap,
} from "lucide-react";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "../components/common/Badge";
import { formatTimeAgo, formatUtcTime } from "../utils/formatters";

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
      similarityScore: "97.4% (pHash Match to Archive)",
      recommendation: "FLAG_RECYCLED_FAKE",
    },
  ].filter((p) => p.primary && p.secondary);

  return (
    <div className="space-y-6">
      {/* Top Banner with Teal and Champagne Gold styling */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            Verification, Deduplication & Hoax Workbench
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Autonomous multi-agent cross-validation, 5-pillar verification matrix, and spatio-temporal cluster deduplication
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-[#060D17] border border-teal-900/40 rounded-xl p-1 overflow-x-auto shadow-sm">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "pending"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Review Queue ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "duplicates"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Deduplication Clusters ({duplicatePairs.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "rejected"
                ? "bg-[#ff5f1f]/20 text-orange-200 border border-orange-500/50"
                : "text-orange-400/80 hover:text-orange-300"
            }`}
          >
            🚨 Rejected / Hoaxes ({rejectedItems.length})
          </button>
        </div>
      </div>

      {/* 1. Pending Review Tab */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 hover:border-teal-500/50 hover:bg-[#0D1622] transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-amber-300 font-bold">{report.id}</span>
                    <div className="flex items-center gap-1.5">
                      <DisasterTypeBadge type={report.disasterType} size="xs" />
                      <SeverityBadge severity={report.severity} size="xs" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5">{report.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{report.description}</p>

                  <div className="bg-[#060D17] p-3 rounded-xl border border-teal-900/40 text-[11px] space-y-1.5 mb-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Location:</span>
                      <span className="text-slate-200 font-medium">📍 {report.location}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Report Source:</span>
                      <span className="text-teal-300 font-medium capitalize">
                        {report.sourceMeta?.icon} {report.sourceMeta?.name || report.source?.platform} ({report.source?.account || "Verified Citizen"})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Score & Consensus:</span>
                      <span className="font-mono text-amber-300 font-bold">
                        Score: {(report.confidenceScore * 100).toFixed(0)}% • Lane: {report.verdict || "review"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-900/30 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectIncident(report)}
                    className="text-xs text-teal-400 hover:text-teal-300 underline font-semibold cursor-pointer"
                  >
                    Inspect Full Dossier
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onFlag(report.id, "Flagged by Operator in Review Queue")}
                      className="px-3 py-1.5 rounded-xl bg-[#ff5f1f]/15 hover:bg-[#ff5f1f]/25 text-orange-200 border border-[#ff5f1f]/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      Flag Hoax
                    </button>
                    <button
                      onClick={() => onVerify(report.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      Approve & Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pendingReports.length === 0 && (
            <div className="bg-[#0A111A]/80 border border-teal-900/30 rounded-2xl p-12 text-center text-slate-400 shadow-xl">
              <CheckCircle className="w-10 h-10 text-teal-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-200 mb-1">Review Queue Clear</h3>
              <p className="text-xs text-slate-500">All incoming disaster reports have been verified or resolved.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Deduplication Clusters Tab */}
      {activeTab === "duplicates" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-5">
            {duplicatePairs.map((pair) => (
              <div
                key={pair.clusterId}
                className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl"
              >
                {/* Cluster Header */}
                <div className="px-5 py-3.5 bg-[#060D17] border-b border-teal-900/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-teal-400 font-bold">
                      Cluster: {pair.clusterId}
                    </span>
                    <DisasterTypeBadge type={pair.hazard} size="xs" />
                    <span className="text-[11px] text-slate-400">
                      Spatial Distance: <strong className="text-white font-mono">{pair.distanceMeters}m</strong>
                    </span>
                    <span className="text-teal-700">•</span>
                    <span className="text-[11px] text-slate-400">
                      Time Delta: <strong className="text-white font-mono">{pair.timeDeltaMins} mins</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      Similarity: {pair.similarityScore}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {pair.recommendation}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Primary Anchor Incident */}
                  <div className="bg-[#060D17] p-4 rounded-xl border border-teal-900/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        Primary Anchor Incident
                      </span>
                      <span className="font-mono text-xs text-slate-400">{pair.primary.id}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100">{pair.primary.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{pair.primary.description}</p>

                    <div className="text-[10px] text-slate-400 pt-2 border-t border-teal-900/30 flex items-center justify-between">
                      <span>📍 {pair.primary.location}</span>
                      <span className="font-mono text-amber-300 font-bold">
                        Score: {Math.round(pair.primary.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Right: Secondary Candidate Incident */}
                  <div className="bg-[#060D17] p-4 rounded-xl border border-teal-900/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 font-bold bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                        Incoming Candidate Report
                      </span>
                      <span className="font-mono text-xs text-slate-400">{pair.secondary.id}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100">{pair.secondary.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{pair.secondary.description}</p>

                    <div className="text-[10px] text-slate-400 pt-2 border-t border-teal-900/30 flex items-center justify-between">
                      <span>📍 {pair.secondary.location}</span>
                      <span className="font-mono text-slate-400">
                        Status: <strong className="capitalize text-teal-300">{pair.secondary.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-5 py-3 bg-[#060D17]/80 border-t border-teal-900/30 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Engine Confidence: <strong className="text-amber-300 font-mono">94.8% match certainty</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectIncident(pair.secondary)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-[#0F1B28] hover:bg-[#142333] text-slate-200 font-semibold border border-teal-900/50 cursor-pointer"
                    >
                      Compare Media
                    </button>
                    <button
                      onClick={() => onMerge(pair.secondary.id, pair.primary.id)}
                      className="px-3.5 py-1.5 text-xs rounded-xl bg-gradient-to-r from-teal-500 to-amber-500 hover:from-teal-400 hover:to-amber-400 text-slate-950 font-bold flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
                    >
                      <GitMerge className="w-3.5 h-3.5 text-slate-950" />
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
        <div className="space-y-4">
          <div className="p-4.5 rounded-2xl bg-[#431407]/40 border border-[#ff5f1f]/50 text-xs text-orange-200 flex items-start gap-3 shadow-xl">
            <AlertTriangle className="w-5 h-5 text-[#ff5f1f] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block text-sm mb-0.5">
                Rejected Reports & Hoax Detection Vault
              </span>
              <p className="text-orange-200/90 leading-relaxed text-[11px]">
                These signals failed the multi-agent verification pipeline due to hard-fail flags: recycled historical media, physical sensor contradictions (e.g. claims of flood with 0.0mm precipitation), or location discrepancies &gt; 50km.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rejectedItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#0A111A]/95 border border-[#ff5f1f]/30 hover:border-[#ff5f1f]/60 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-[#ff5f1f] font-bold">{item.id}</span>
                    <div className="flex items-center gap-1.5">
                      <DisasterTypeBadge type={item.disasterType} size="xs" />
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#ff5f1f]/20 text-orange-200 border border-orange-500/50">
                        VERDICT: REJECTED
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.description}</p>

                  {/* Provenance Evidence */}
                  <div className="p-3 rounded-xl bg-[#060D17] border border-teal-900/40 text-[11px] space-y-1.5 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verification Score:</span>
                      <span className="font-mono text-[#ff5f1f] font-bold">
                        {(item.confidenceScore * 100).toFixed(0)}% (Fail threshold &lt; 40%)
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Provenance Check (C3):</span>
                      <span className={item.checks?.provenance?.recycled ? "text-[#ff5f1f] font-bold" : "text-slate-300"}>
                        {item.checks?.provenance?.recycled
                          ? `Recycled Media Flagged (${(
                              (item.checks?.provenance?.archive_match_score || 0.95) * 100
                            ).toFixed(0)}% match)`
                          : item.checks?.provenance?.details || "Screened"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Hard-Fail Reason:</span>
                      <span className="text-orange-300 font-semibold truncate max-w-[200px]">
                        {item.reasons?.[0] || "Sensor contradiction with satellite precipitation"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-900/30 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Logged: {formatTimeAgo(item.timestamp)}
                  </span>
                  <button
                    onClick={() => onSelectIncident(item)}
                    className="px-3 py-1 text-xs rounded-xl bg-[#0F1B28] hover:bg-[#142333] text-orange-200 border border-[#ff5f1f]/40 font-semibold cursor-pointer"
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

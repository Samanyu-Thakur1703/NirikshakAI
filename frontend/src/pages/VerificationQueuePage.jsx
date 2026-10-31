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
} from "lucide-react";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "../components/common/Badge";
import { formatTimeAgo, formatUtcTime } from "../utils/formatters";

export function VerificationQueuePage({
  reports = [],
  onVerify,
  onFlag,
  onMerge,
  onSelectIncident,
}) {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "duplicates" | "clusters"
  const [selectedPair, setSelectedPair] = useState(null);

  const pendingReports = reports.filter((r) => r.status === "pending");
  const duplicateReports = reports.filter((r) => r.status === "duplicate");

  // Pair primary and duplicate for comparison demo
  const duplicatePairs = [
    {
      clusterId: "CLUSTER-PB-01",
      hazard: "flood",
      primary: reports.find((r) => r.id === "REP-IN-2026-0101"),
      secondary: reports.find((r) => r.id === "REP-IN-2026-0102"),
      distanceMeters: 480,
      timeDeltaMins: 7,
      similarityScore: "89.4%",
      recommendation: "MERGE_AS_DUPLICATE",
    },
    {
      clusterId: "CLUSTER-MH-01",
      hazard: "heavy_rainfall",
      primary: reports.find((r) => r.id === "REP-IN-2026-0107"),
      secondary: reports.find((r) => r.id === "REP-IN-2026-0108"),
      distanceMeters: 2800,
      timeDeltaMins: 4,
      similarityScore: "93.1%",
      recommendation: "MERGE_AS_DUPLICATE",
    },
    {
      clusterId: "CLUSTER-DL-01",
      hazard: "flood",
      primary: reports.find((r) => r.id === "REP-IN-2026-0116"),
      secondary: reports.find((r) => r.id === "REP-IN-2026-0117"),
      distanceMeters: 720,
      timeDeltaMins: 15,
      similarityScore: "91.8%",
      recommendation: "MERGE_AS_DUPLICATE",
    },
    {
      clusterId: "CLUSTER-KL-RECYCLED",
      hazard: "landslide",
      primary: reports.find((r) => r.id === "REP-IN-2026-0105"),
      secondary: reports.find((r) => r.id === "REP-IN-2026-0106"),
      distanceMeters: 5600,
      timeDeltaMins: 40,
      similarityScore: "97.4% (pHash Match to 2024 Archive)",
      recommendation: "FLAG_RECYCLED_FAKE",
    },
  ].filter((p) => p.primary && p.secondary);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Verification & GIS Deduplication Queue
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous agent cross-validation, 5-pillar verification matrix, and spatio-temporal cluster deduplication
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "pending"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pending Review ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "duplicates"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Deduplication Clusters ({duplicatePairs.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "pending" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">{report.id}</span>
                    <div className="flex items-center gap-1.5">
                      <DisasterTypeBadge type={report.disasterType} size="xs" />
                      <SeverityBadge severity={report.severity} size="xs" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5">{report.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{report.description}</p>

                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1 mb-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Location:</span>
                      <span className="text-slate-200">📍 {report.location}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Report Source:</span>
                      <span className="text-slate-200 capitalize">
                        {report.source?.platform} ({report.source?.account})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Confidence Score:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {Math.round(report.confidenceScore * 100)}% (Pending Operator Verdict)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectIncident(report)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Inspect Full Dossier
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onFlag(report.id)}
                      className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Flag Hoax
                    </button>
                    <button
                      onClick={() => onVerify(report.id)}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
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
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Queue Clear</h3>
              <p className="text-xs text-slate-500">All incoming disaster reports have been verified or resolved.</p>
            </div>
          )}
        </div>
      ) : (
        /* Deduplication Comparison Workbench */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-5">
            {duplicatePairs.map((pair, idx) => (
              <div
                key={pair.clusterId}
                className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm"
              >
                {/* Cluster Header */}
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-cyan-400 font-bold">
                      Cluster: {pair.clusterId}
                    </span>
                    <DisasterTypeBadge type={pair.hazard} size="xs" />
                    <span className="text-[11px] text-slate-400">
                      Spatial Distance: <strong className="text-white font-mono">{pair.distanceMeters}m</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">
                      Time Delta: <strong className="text-white font-mono">{pair.timeDeltaMins} mins</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                      Similarity: {pair.similarityScore}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                      {pair.recommendation}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Primary / Verified Incident */}
                  <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Primary Anchor Incident
                      </span>
                      <span className="font-mono text-xs text-slate-400">{pair.primary.id}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100">{pair.primary.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{pair.primary.description}</p>

                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span>📍 {pair.primary.location}</span>
                      <span className="font-mono text-emerald-400">
                        Score: {Math.round(pair.primary.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Right: Secondary Candidate Incident */}
                  <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        Incoming Candidate Report
                      </span>
                      <span className="font-mono text-xs text-slate-400">{pair.secondary.id}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100">{pair.secondary.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{pair.secondary.description}</p>

                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span>📍 {pair.secondary.location}</span>
                      <span className="font-mono text-slate-400">
                        Status: <strong className="capitalize text-cyan-400">{pair.secondary.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Engine Confidence: <strong className="text-emerald-400 font-mono">94.8% match certainty</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectIncident(pair.secondary)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700"
                    >
                      Compare Media
                    </button>
                    <button
                      onClick={() => onMerge(pair.secondary.id, pair.primary.id)}
                      className="px-3 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1 shadow-sm"
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
    </div>
  );
}

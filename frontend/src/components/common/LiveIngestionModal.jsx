import React, { useState } from "react";
import {
  X,
  Radio,
  Zap,
  Globe,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Activity,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const INGEST_SOURCES = [
  {
    id: "imd",
    name: "IMD Mausam District Warning",
    agency: "India Meteorological Department",
    icon: "🏛️",
    desc: "Red/Orange/Yellow district alerts, rainfall nowcast & thunderstorm warnings",
    tier: "Tier-1 Official",
    defaultChecked: true,
  },
  {
    id: "openmeteo",
    name: "NASA GIBS & Open-Meteo Satellite",
    agency: "NASA Earthdata & Surface Radar",
    icon: "🛰️",
    desc: "MODIS satellite true-color tiles & 3-hour precipitation radar verification",
    tier: "Tier-1 Physical",
    defaultChecked: true,
  },
  {
    id: "sachet",
    name: "NDMA SACHET RSS Feed",
    agency: "National Disaster Management Authority",
    icon: "🚨",
    desc: "CAP-compliant government disaster bulletins and evacuation alerts",
    tier: "Tier-1 Official",
    defaultChecked: true,
  },
  {
    id: "gdelt",
    name: "GDELT DOC 2.0 News Intelligence",
    agency: "Global & Indian Press Monitoring",
    icon: "📰",
    desc: "Real-time news articles from Tribune India, The Hindu, Hindustan Times",
    tier: "Tier-2 Press",
    defaultChecked: true,
  },
  {
    id: "bluesky",
    name: "Bluesky Citizen Social Feed",
    agency: "Public At-Protocol Network",
    icon: "🌐",
    desc: "Real-time crowdsourced citizen dispatches, mobile photos & geotags",
    tier: "Tier-3 Citizen",
    defaultChecked: true,
  },
  {
    id: "youtube",
    name: "YouTube Emergency Broadcasts",
    agency: "Live Regional News Channels",
    icon: "📹",
    desc: "Broadcast disaster livestreams & video reporting transcripts",
    tier: "Tier-3 Broadcast",
    defaultChecked: false,
  },
  {
    id: "mock",
    name: "Simulated Extreme Weather Seeds",
    agency: "NirikshakAI Synthetic Benchmark",
    icon: "🧪",
    desc: "Evaluates multi-agent resilience with seeded high-density scenario stress tests",
    tier: "Benchmark",
    defaultChecked: true,
  },
];

const TARGET_REGIONS = [
  { id: "All India", label: "All India (Nationwide Sweep)" },
  { id: "Punjab", label: "Punjab & Tri-City (Mohali / Chandigarh)" },
  { id: "Tamil Nadu", label: "Tamil Nadu & Coastline (Chennai / Cuddalore)" },
  { id: "Himachal Pradesh", label: "Himachal Pradesh & Hills (Solan / Shimla)" },
  { id: "Maharashtra", label: "Maharashtra (Mumbai / Konkan Coast)" },
  { id: "Assam", label: "Assam & Northeast (Brahmaputra Valley)" },
];

export function LiveIngestionModal({
  isOpen,
  onClose,
  onTriggerIngestion,
  isIngesting = false,
  backendConnected = true,
}) {
  const [selectedSources, setSelectedSources] = useState(
    INGEST_SOURCES.filter((s) => s.defaultChecked).map((s) => s.id)
  );
  const [selectedRegion, setSelectedRegion] = useState("Punjab");
  const [recordCount, setRecordCount] = useState(25);
  const [lastIngestResult, setLastIngestResult] = useState(null);
  const [autoStreamActive, setAutoStreamActive] = useState(false);

  if (!isOpen) return null;

  const toggleSource = (sourceId) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  };

  const handleExecute = async () => {
    if (selectedSources.length === 0) return;
    const res = await onTriggerIngestion({
      sources: selectedSources,
      state_or_district: selectedRegion,
      mock_count: recordCount,
    });
    if (res) {
      setLastIngestResult(res);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#070D14] border border-teal-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header with Champagne Gold & Teal styling */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-900/40 bg-gradient-to-r from-[#091522] via-[#0D1F2D] to-[#091522]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shadow-lg shadow-teal-900/40">
              <Radio className="w-5 h-5 text-teal-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  Real-World Data Ingestion Console
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Agent 1 Core
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Poll official IMD nowcasts, NASA satellite radar, GDELT news & Bluesky social feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Channel Multi-Select Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Select Ingestion Channels ({selectedSources.length}/{INGEST_SOURCES.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSources(INGEST_SOURCES.map((s) => s.id))}
                  className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedSources([])}
                  className="text-[11px] text-slate-400 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {INGEST_SOURCES.map((src) => {
                const isSelected = selectedSources.includes(src.id);
                return (
                  <div
                    key={src.id}
                    onClick={() => toggleSource(src.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-teal-950/40 border-teal-500/50 shadow-sm shadow-teal-950"
                        : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 opacity-60"
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{src.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{src.name}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                            src.tier.includes("Official")
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : src.tier.includes("Physical")
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-teal-500/15 text-teal-300 border-teal-500/30"
                          }`}
                        >
                          {src.tier}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{src.desc}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">Authority: {src.agency}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Target and Batch Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
                Target Geographic Territory
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-[#0A121D] border border-teal-900/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition-colors"
              >
                {TARGET_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
                Batch Sample Density ({recordCount} items)
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={recordCount}
                onChange={(e) => setRecordCount(Number(e.target.value))}
                className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>10 (Fast Pulse)</span>
                <span>35 (Standard Patrol)</span>
                <span>60 (Dense Sweep)</span>
              </div>
            </div>
          </div>

          {/* Execution Result Banner */}
          {lastIngestResult && (
            <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/40 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-teal-300">Ingestion Succeeded: </span>
                <span className="text-slate-300">
                  {lastIngestResult.data?.message ||
                    `Successfully polled real-world feeds. ${lastIngestResult.data?.ingested_count || recordCount} reports evaluated.`}
                </span>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  Relevance Gate: Verified {lastIngestResult.data?.ingested_count || recordCount} reports •
                  Physical C1-C5 tests applied • Dashboard refreshed.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-[#060B12]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="font-mono">
              {backendConnected ? "Live FastAPI Agent Core Connected" : "Offline Sandbox Active"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExecute}
              disabled={isIngesting || selectedSources.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 via-teal-300 to-amber-300 hover:from-teal-300 hover:to-amber-200 disabled:opacity-50 transition-all shadow-lg shadow-teal-900/30 cursor-pointer active:scale-95"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Polling Real Feeds...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Trigger Ingestion Pulse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

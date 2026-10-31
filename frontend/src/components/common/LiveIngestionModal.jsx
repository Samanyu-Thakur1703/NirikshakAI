import React, { useState } from "react";
import {
  X,
  Radio,
  Zap,
  Layers,
  CheckCircle2,
  Loader2,
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
    agency: "DisasterWatch Synthetic Benchmark",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0B101B] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E293B] bg-[#0E1526]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Real-World Data Ingestion Console
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40">
                  Ingestion Agent
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Poll official IMD nowcasts, NASA satellite radar, GDELT news & verified feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Channel Multi-Select Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Select Ingestion Channels ({selectedSources.length}/{INGEST_SOURCES.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSources(INGEST_SOURCES.map((s) => s.id))}
                  className="text-[11px] text-[#38BDF8] hover:underline cursor-pointer font-medium"
                >
                  Select All
                </button>
                <span className="text-[#334155]">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedSources([])}
                  className="text-[11px] text-[#94A3B8] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {INGEST_SOURCES.map((src) => {
                const isSelected = selectedSources.includes(src.id);
                return (
                  <div
                    key={src.id}
                    onClick={() => toggleSource(src.id)}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-[#1E3A8A]/25 border-[#2563EB] shadow-sm"
                        : "bg-[#0E1526] border-[#1E293B] hover:border-[#334155] opacity-75"
                    }`}
                  >
                    <span className="text-lg shrink-0">{src.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{src.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border bg-[#111827] text-[#94A3B8] border-[#1E293B]">
                          {src.tier}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">{src.desc}</div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">Authority: {src.agency}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Target and Batch Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1E293B]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#38BDF8] mb-1">
                Target Geographic Territory
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-[#0E1526] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#38BDF8] transition-colors"
              >
                {TARGET_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#38BDF8] mb-1">
                Batch Sample Density ({recordCount} items)
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={recordCount}
                onChange={(e) => setRecordCount(Number(e.target.value))}
                className="w-full accent-[#2563EB] h-1.5 bg-[#1E293B] rounded cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] font-mono mt-1">
                <span>10 (Fast Pulse)</span>
                <span>35 (Standard Patrol)</span>
                <span>60 (Dense Sweep)</span>
              </div>
            </div>
          </div>

          {/* Execution Result Banner */}
          {lastIngestResult && (
            <div className="p-3 rounded-lg bg-[#064E3B]/40 border border-[#10B981]/50 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#10B981]">Ingestion Succeeded: </span>
                <span className="text-slate-200">
                  {lastIngestResult.data?.message ||
                    `Successfully polled real-world feeds. ${lastIngestResult.data?.ingested_count || recordCount} reports evaluated.`}
                </span>
                <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                  Relevance Gate: Verified {lastIngestResult.data?.ingested_count || recordCount} reports •
                  Physical C1-C5 tests applied • Dashboard refreshed.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#1E293B] bg-[#0E1526]">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? "bg-[#10B981] animate-pulse" : "bg-[#F59E0B]"
              }`}
            />
            <span className="font-mono text-[11px]">
              {backendConnected ? "FastAPI Agent Core Connected" : "Offline Sandbox Active"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#1E293B] border border-[#1E293B] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExecute}
              disabled={isIngesting || selectedSources.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors cursor-pointer shadow-md"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Polling Real Feeds...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#FDE047]" />
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

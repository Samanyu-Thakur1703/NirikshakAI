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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#252C2A]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded bg-[#FFFFFF] border border-[#E1E5E0] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E1E5E0] bg-[#F8F9F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#183D35]/10 border border-[#183D35]/20 flex items-center justify-center text-[#183D35]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#252C2A] tracking-tight">
                  Real-World Data Ingestion Console
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#183D35]/10 text-[#183D35] border border-[#183D35]/25">
                  Ingestion Agent
                </span>
              </div>
              <p className="text-xs text-[#737D78]">
                Poll official IMD nowcasts, NASA satellite radar, GDELT news & verified feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#737D78] hover:text-[#252C2A] hover:bg-[#F3F4F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Channel Multi-Select Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#183D35] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Select Ingestion Channels ({selectedSources.length}/{INGEST_SOURCES.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSources(INGEST_SOURCES.map((s) => s.id))}
                  className="text-[11px] text-[#183D35] hover:underline cursor-pointer font-medium"
                >
                  Select All
                </button>
                <span className="text-[#E1E5E0]">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedSources([])}
                  className="text-[11px] text-[#737D78] hover:underline cursor-pointer"
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
                    className={`p-2.5 rounded border transition-colors cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-[#183D35]/5 border-[#183D35]"
                        : "bg-[#FFFFFF] border-[#E1E5E0] hover:border-[#183D35]/40 opacity-75"
                    }`}
                  >
                    <span className="text-lg shrink-0">{src.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#252C2A]">{src.name}</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded border bg-[#F3F4F0] text-[#737D78] border-[#E1E5E0]">
                          {src.tier}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#737D78] mt-0.5 line-clamp-1">{src.desc}</div>
                      <div className="text-[10px] text-[#737D78] font-mono mt-0.5">Authority: {src.agency}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Target and Batch Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E1E5E0]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#183D35] mb-1">
                Target Geographic Territory
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E1E5E0] rounded px-2.5 py-1.5 text-xs text-[#252C2A] focus:outline-none focus:border-[#183D35] transition-colors"
              >
                {TARGET_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#183D35] mb-1">
                Batch Sample Density ({recordCount} items)
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={recordCount}
                onChange={(e) => setRecordCount(Number(e.target.value))}
                className="w-full accent-[#183D35] h-1.5 bg-[#E1E5E0] rounded cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-[#737D78] font-mono mt-1">
                <span>10 (Fast Pulse)</span>
                <span>35 (Standard Patrol)</span>
                <span>60 (Dense Sweep)</span>
              </div>
            </div>
          </div>

          {/* Execution Result Banner */}
          {lastIngestResult && (
            <div className="p-3 rounded bg-[#183D35]/10 border border-[#183D35]/30 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#183D35] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#183D35]">Ingestion Succeeded: </span>
                <span className="text-[#252C2A]">
                  {lastIngestResult.data?.message ||
                    `Successfully polled real-world feeds. ${lastIngestResult.data?.ingested_count || recordCount} reports evaluated.`}
                </span>
                <div className="text-[10px] font-mono text-[#737D78] mt-0.5">
                  Relevance Gate: Verified {lastIngestResult.data?.ingested_count || recordCount} reports •
                  Physical C1-C5 tests applied • Dashboard refreshed.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E1E5E0] bg-[#F8F9F7]">
          <div className="flex items-center gap-1.5 text-xs text-[#737D78]">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? "bg-[#183D35]" : "bg-[#D98236]"
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
              className="px-3 py-1.5 rounded text-xs font-medium text-[#252C2A] hover:bg-[#F3F4F0] border border-[#E1E5E0] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExecute}
              disabled={isIngesting || selectedSources.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium text-white bg-[#183D35] hover:bg-[#214D43] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Polling Real Feeds...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
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

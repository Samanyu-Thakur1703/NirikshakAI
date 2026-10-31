import React, { useState } from "react";
import {
  Settings,
  Shield,
  Map,
  CheckCircle,
  FileCode,
  Save,
} from "lucide-react";

export function SettingsPage() {
  const [threshold, setThreshold] = useState(0.75);
  const [relevanceScore, setRelevanceScore] = useState(0.70);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-3 max-w-4xl">
      {/* Header */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
          <Settings className="w-4 h-4 text-[#38BDF8]" />
          System Settings & Verification Protocols
        </h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Configure autonomous agent thresholds, real-world feed polling frequencies, and CAP 1.2 NDMA SACHET alert dispatch rules
        </p>
      </div>

      {/* 1. Autonomous Verification Engine Parameters */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md space-y-3.5">
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2.5">
          <Shield className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Multi-Agent Scoring & Verification Thresholds
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block text-white font-semibold mb-1">
              Minimum Verification Threshold: <span className="font-mono text-[#10B981] font-bold">{threshold}</span>
            </label>
            <p className="text-[11px] text-[#94A3B8] mb-2">
              Reports with composite score &ge; this value and C1/C2 pass are automatically verified.
            </p>
            <input
              type="range"
              min="0.50"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#2563EB] h-1.5 bg-[#1E293B] rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">
              Ingestion Relevance Gate: <span className="font-mono text-[#38BDF8] font-bold">{relevanceScore}</span>
            </label>
            <p className="text-[11px] text-[#94A3B8] mb-2">
              Raw crowd signals with relevance below this value are automatically dropped as noise.
            </p>
            <input
              type="range"
              min="0.50"
              max="0.85"
              step="0.05"
              value={relevanceScore}
              onChange={(e) => setRelevanceScore(parseFloat(e.target.value))}
              className="w-full accent-[#2563EB] h-1.5 bg-[#1E293B] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Scoring Weights Table */}
        <div className="p-3 bg-[#0E1526] rounded-lg border border-[#1E293B] text-xs">
          <span className="font-semibold text-white block mb-2">
            5-Pillar Weighted Formulation (Judge Agent):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px] font-mono">
            <div className="p-2 bg-[#111827] rounded border border-[#1E293B]">
              <span className="text-[#94A3B8] block">C1 Official</span>
              <strong className="text-[#38BDF8]">30%</strong>
            </div>
            <div className="p-2 bg-[#111827] rounded border border-[#1E293B]">
              <span className="text-[#94A3B8] block">C2 Physical</span>
              <strong className="text-[#10B981]">25%</strong>
            </div>
            <div className="p-2 bg-[#111827] rounded border border-[#1E293B]">
              <span className="text-[#94A3B8] block">C5 Corroboration</span>
              <strong className="text-[#38BDF8]">20%</strong>
            </div>
            <div className="p-2 bg-[#111827] rounded border border-[#1E293B]">
              <span className="text-[#94A3B8] block">C3 Provenance</span>
              <strong className="text-[#F59E0B]">15%</strong>
            </div>
            <div className="p-2 bg-[#111827] rounded border border-[#1E293B]">
              <span className="text-[#94A3B8] block">C4 Location</span>
              <strong className="text-[#38BDF8]">10%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GIS & Map Configuration */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md space-y-3.5">
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2.5">
          <Map className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            GIS Map Tile & Projection Settings
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0E1526] border border-[#1E293B]">
            <div>
              <span className="font-semibold text-white block">Basemap Imagery Engine</span>
              <span className="text-[11px] text-[#94A3B8]">
                Esri World Imagery Aerial Reconnaissance (High-resolution satellite topography)
              </span>
            </div>
            <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded border border-[#10B981]/40 font-semibold">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0E1526] border border-[#1E293B]">
            <div>
              <span className="font-semibold text-white block">Spatial Clustering Algorithm</span>
              <span className="text-[11px] text-[#94A3B8]">
                DBSCAN (Radius &epsilon; = 5.0 km, MinPts = 2 reports within 60 mins)
              </span>
            </div>
            <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded border border-[#10B981]/40 font-semibold">
              ENABLED
            </span>
          </div>
        </div>
      </div>

      {/* 3. CAP 1.2 Protocol Integration */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2.5">
          <FileCode className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            India NDMA SACHET CAP 1.2 Gateway
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[#94A3B8] mb-1 font-semibold">Dispatch Gateway Endpoint</label>
            <input
              type="text"
              readOnly
              value="https://sachet.ndma.gov.in/api/v1/cap/dispatch"
              className="w-full bg-[#0E1526] border border-[#1E293B] rounded-lg px-3 py-1.5 font-mono text-[11px] text-[#64748B] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[#94A3B8] mb-1 font-semibold">Sender Identifier</label>
            <input
              type="text"
              readOnly
              value="dispatch.agent@crisisops.ai"
              className="w-full bg-[#0E1526] border border-[#1E293B] rounded-lg px-3 py-1.5 font-mono text-[11px] text-[#64748B] cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-1">
        {saved ? (
          <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Configuration saved successfully.
          </span>
        ) : (
          <span className="text-xs text-[#64748B] font-mono">All changes persist in session memory.</span>
        )}

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save System Configuration
        </button>
      </div>
    </div>
  );
}

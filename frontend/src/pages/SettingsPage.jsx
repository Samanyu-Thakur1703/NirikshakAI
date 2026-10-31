import React, { useState } from "react";
import {
  Settings,
  Shield,
  Map,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Radio,
  FileCode,
  Save,
  RotateCcw,
  Zap,
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-400" />
          Command Center Intelligence & System Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure autonomous agent thresholds, real-world feed polling frequencies, and CAP 1.2 NDMA SACHET alert dispatch rules
        </p>
      </div>

      {/* 1. Autonomous Verification Engine Parameters */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-teal-900/30 pb-3">
          <Shield className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Multi-Agent Scoring & Verification Thresholds
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Minimum Verification Threshold: <span className="font-mono text-amber-300 font-bold">{threshold}</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Reports with composite score &ge; this value and C1/C2 pass are automatically verified.
            </p>
            <input
              type="range"
              min="0.50"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-teal-400 h-2 bg-[#060D17] rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Ingestion Relevance Gate: <span className="font-mono text-teal-400 font-bold">{relevanceScore}</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Raw crowd signals with relevance below this value are automatically dropped as noise.
            </p>
            <input
              type="range"
              min="0.50"
              max="0.85"
              step="0.05"
              value={relevanceScore}
              onChange={(e) => setRelevanceScore(parseFloat(e.target.value))}
              className="w-full accent-teal-400 h-2 bg-[#060D17] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Scoring Weights Table */}
        <div className="p-3.5 bg-[#060D17] rounded-xl border border-teal-900/40 text-xs">
          <span className="font-semibold text-slate-300 block mb-2">
            5-Pillar Weighted Formulation (Judge Agent):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px] font-mono">
            <div className="p-2.5 bg-[#0B1522] rounded-lg border border-teal-900/30">
              <span className="text-slate-400 block">C1 Official</span>
              <strong className="text-amber-300">30%</strong>
            </div>
            <div className="p-2.5 bg-[#0B1522] rounded-lg border border-teal-900/30">
              <span className="text-slate-400 block">C2 Physical</span>
              <strong className="text-teal-400">25%</strong>
            </div>
            <div className="p-2.5 bg-[#0B1522] rounded-lg border border-teal-900/30">
              <span className="text-slate-400 block">C5 Corroboration</span>
              <strong className="text-teal-300">20%</strong>
            </div>
            <div className="p-2.5 bg-[#0B1522] rounded-lg border border-teal-900/30">
              <span className="text-slate-400 block">C3 Provenance</span>
              <strong className="text-amber-400">15%</strong>
            </div>
            <div className="p-2.5 bg-[#0B1522] rounded-lg border border-teal-900/30">
              <span className="text-slate-400 block">C4 Location</span>
              <strong className="text-teal-400">10%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GIS & Map Configuration */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-teal-900/30 pb-3">
          <Map className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            GIS Map Tile & Projection Settings
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#060D17] border border-teal-900/40">
            <div>
              <span className="font-bold text-slate-200 block">Basemap Style Engine</span>
              <span className="text-[11px] text-slate-400">
                Esri World Dark Gray Canvas (Zero token dependency, high contrast, token-free, military-grade GIS)
              </span>
            </div>
            <span className="text-xs font-mono text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30 font-bold">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#060D17] border border-teal-900/40">
            <div>
              <span className="font-bold text-slate-200 block">Spatial Clustering Algorithm</span>
              <span className="text-[11px] text-slate-400">
                DBSCAN (Radius &epsilon; = 5.0 km, MinPts = 2 reports within 60 mins)
              </span>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-bold">
              ENABLED
            </span>
          </div>
        </div>
      </div>

      {/* 3. CAP 1.2 Protocol Integration */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-3">
        <div className="flex items-center gap-2 border-b border-teal-900/30 pb-3">
          <FileCode className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            India NDMA SACHET CAP 1.2 Gateway
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Dispatch Gateway Endpoint</label>
            <input
              type="text"
              readOnly
              value="https://sachet.ndma.gov.in/api/v1/cap/dispatch"
              className="w-full bg-[#060D17] border border-teal-900/40 rounded-xl px-3.5 py-2 font-mono text-[11px] text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Sender Identifier</label>
            <input
              type="text"
              readOnly
              value="dispatch.agent@disasterwatch.ai"
              className="w-full bg-[#060D17] border border-teal-900/40 rounded-xl px-3.5 py-2 font-mono text-[11px] text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        {saved ? (
          <span className="text-xs text-teal-400 font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Configuration saved successfully.
          </span>
        ) : (
          <span className="text-xs text-slate-500 font-mono">All changes persist in session memory.</span>
        )}

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 hover:from-teal-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-950/40 transition-all cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4 text-slate-950" />
          Save System Configuration
        </button>
      </div>
    </div>
  );
}

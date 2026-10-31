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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Command Center Intelligence & System Configuration
        </h2>
        <p className="text-xs text-slate-400">
          Configure autonomous agent thresholds, GIS tile providers, and CAP 1.2 NDMA SACHET alert dispatch rules
        </p>
      </div>

      {/* 1. Autonomous Verification Engine Parameters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Multi-Agent Scoring & Verification Thresholds
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Minimum Verification Threshold: <span className="font-mono text-cyan-400 font-bold">{threshold}</span>
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
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Ingestion Relevance Gate: <span className="font-mono text-cyan-400 font-bold">{relevanceScore}</span>
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
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* Scoring Weights Table */}
        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs">
          <span className="font-semibold text-slate-300 block mb-2">
            5-Pillar Weighted Formulation (Judge Agent):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px] font-mono">
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400 block">C1 Official</span>
              <strong className="text-cyan-400">30%</strong>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400 block">C2 Physical</span>
              <strong className="text-cyan-400">25%</strong>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400 block">C5 Corroboration</span>
              <strong className="text-cyan-400">20%</strong>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400 block">C3 Provenance</span>
              <strong className="text-cyan-400">15%</strong>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400 block">C4 Location</span>
              <strong className="text-cyan-400">10%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GIS & Map Configuration */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Map className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            GIS Map Tile & Projection Settings
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Map Style Provider</span>
              <span className="text-[11px] text-slate-400">
                CartoDB Dark Matter (High contrast, token-free, optimized for command centers)
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Spatial Clustering Algorithm</span>
              <span className="text-[11px] text-slate-400">
                DBSCAN (Radius &epsilon; = 5.0 km, MinPts = 2 reports within 60 mins)
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              ENABLED
            </span>
          </div>
        </div>
      </div>

      {/* 3. CAP 1.2 Protocol Integration */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            India NDMA SACHET CAP 1.2 Gateway
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Dispatch Gateway Endpoint</label>
            <input
              type="text"
              readOnly
              value="https://sachet.ndma.gov.in/api/v1/cap/dispatch"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 font-mono text-[11px] text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Sender Identifier</label>
            <input
              type="text"
              readOnly
              value="dispatch.agent@disasterwatch.ai"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 font-mono text-[11px] text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        {saved ? (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Configuration saved successfully.
          </span>
        ) : (
          <span className="text-xs text-slate-500">All changes persist in session memory.</span>
        )}

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
        >
          <Save className="w-4 h-4" />
          Save System Configuration
        </button>
      </div>
    </div>
  );
}

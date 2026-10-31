import React, { useState } from "react";
import {
  Layers,
  MapPin,
  Compass,
  Sliders,
  Eye,
  Radio,
  Shield,
  Activity,
  Info,
  Maximize2,
} from "lucide-react";
import { DisasterMap } from "../components/map/DisasterMap";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "../components/common/Badge";
import { formatTimeAgo } from "../utils/formatters";

export function IncidentMapPage({
  reports = [],
  selectedIncident,
  onSelectIncident,
}) {
  const [activeTab, setActiveTab] = useState("incidents"); // "incidents" | "details"

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4">
      {/* Left / Main Map Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        {/* Top Console Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              GIS Operations Tactical Display
            </h2>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              [Projection: EPSG:4326 WGS84 • India Extent]
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden md:inline font-mono">
              Plotting {reports.length} verified & crowd coordinates
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <DisasterMap
            incidents={reports}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
            fullHeight={true}
          />
        </div>
      </div>

      {/* Right GIS Inspector Panel */}
      <div className="w-full lg:w-96 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col h-72 lg:h-full overflow-hidden shrink-0">
        {/* Panel Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("incidents")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === "incidents"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Plotted Incidents ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === "details"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Active GIS Target
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          {activeTab === "incidents" ? (
            reports.map((item) => {
              const isSelected = selectedIncident && selectedIncident.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIncident(item)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-950/50"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                    <SeverityBadge severity={item.severity} size="xs" />
                  </div>

                  <h4 className="font-semibold text-slate-200 text-xs mb-1 line-clamp-1">{item.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate">📍 {item.location}</span>
                    <span className="text-cyan-400">{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>
                      {item.latitude.toFixed(2)}°N, {item.longitude.toFixed(2)}°E
                    </span>
                    <span className="text-emerald-400">Score: {Math.round(item.confidenceScore * 100)}%</span>
                  </div>
                </div>
              );
            })
          ) : selectedIncident ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <DisasterTypeBadge type={selectedIncident.disasterType} />
                  <SeverityBadge severity={selectedIncident.severity} />
                </div>
                <h3 className="text-sm font-bold text-white">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIncident.description}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-cyan-400">
                    {selectedIncident.latitude.toFixed(4)}°N, {selectedIncident.longitude.toFixed(4)}°E
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">District / State:</span>
                  <span className="text-slate-200">
                    {selectedIncident.district}, {selectedIncident.state}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Reporting Platform:</span>
                  <span className="text-slate-200 capitalize">{selectedIncident.source?.platform}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Verification Confidence:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Math.round(selectedIncident.confidenceScore * 100)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Physical Rainfall:</span>
                  <span className="font-mono text-slate-200">
                    {selectedIncident.checks?.physical?.rainfall_mm || 0} mm
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectIncident(selectedIncident)}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-600/20"
              >
                Inspect Complete Forensic Matrix
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Click any map marker or incident to inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

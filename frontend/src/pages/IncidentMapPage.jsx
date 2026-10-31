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
  Zap,
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
      <div className="flex-1 flex flex-col h-full bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        {/* Top Console Bar */}
        <div className="px-5 py-3 bg-[#060D17] border-b border-teal-900/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              GIS Operations Tactical Display & Multi-Hazard Sensor Clusters
            </h2>
            <span className="text-[10px] font-mono text-teal-400 hidden sm:inline">
              [EPSG:4326 WGS84 • Esri Dark GIS]
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden md:inline font-mono text-amber-300 font-semibold">
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
      <div className="w-full lg:w-96 bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl flex flex-col h-72 lg:h-full overflow-hidden shrink-0 shadow-2xl">
        {/* Panel Header */}
        <div className="p-3.5 border-b border-teal-900/30 flex items-center justify-between bg-[#060D17]/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("incidents")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "incidents"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Plotted Incidents ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "details"
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Active GIS Target
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
          {activeTab === "incidents" ? (
            reports.map((item) => {
              const isSelected = selectedIncident && selectedIncident.id === item.id;
              const srcMeta = item.sourceMeta || { name: item.source?.platform || "Crowd", icon: "📍" };
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIncident(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-teal-950/40 border-teal-500/70 shadow-lg shadow-teal-950/60"
                      : "bg-[#060D17]/80 border-teal-900/30 hover:border-teal-500/40 hover:bg-[#0D1824]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                    <SeverityBadge severity={item.severity} size="xs" />
                  </div>

                  <h4 className="font-bold text-slate-200 text-xs mb-1 line-clamp-1">{item.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate">📍 {item.location}</span>
                    <span className="text-teal-400 font-semibold">{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-teal-900/20 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">
                      {item.latitude ? item.latitude.toFixed(2) : "0.00"}°N, {item.longitude ? item.longitude.toFixed(2) : "0.00"}°E
                    </span>
                    <span className="text-amber-300 font-bold">
                      Confidence: {Math.round(item.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>
              );
            })
          ) : selectedIncident ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#060D17] rounded-xl border border-teal-900/40 space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <DisasterTypeBadge type={selectedIncident.disasterType} />
                  <SeverityBadge severity={selectedIncident.severity} />
                </div>
                <h3 className="text-sm font-bold text-white">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIncident.description}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-teal-900/30">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-teal-400 font-semibold">
                    {selectedIncident.latitude ? selectedIncident.latitude.toFixed(4) : "0.0000"}°N, {selectedIncident.longitude ? selectedIncident.longitude.toFixed(4) : "0.0000"}°E
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-teal-900/30">
                  <span className="text-slate-400">District / State:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedIncident.district || selectedIncident.location}, {selectedIncident.state}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-teal-900/30">
                  <span className="text-slate-400">Reporting Feed:</span>
                  <span className="text-amber-300 font-semibold capitalize">
                    {selectedIncident.sourceMeta?.name || selectedIncident.source?.platform}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-teal-900/30">
                  <span className="text-slate-400">Verification Consensus:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {Math.round(selectedIncident.confidenceScore * 100)}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-teal-900/30">
                  <span className="text-slate-400">Surface Rain Gauge:</span>
                  <span className="font-mono text-teal-300 font-semibold">
                    {selectedIncident.checks?.physical?.rainfall_mm || selectedIncident.telemetry?.rainfall_mm || 78.4} mm
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectIncident(selectedIncident)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-amber-500 hover:from-teal-400 hover:to-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Inspect Forensic Dossier
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50 text-teal-400" />
              <p>Click any map marker or incident to inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

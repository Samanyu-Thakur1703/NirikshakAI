import React, { useState } from "react";
import {
  Layers,
  MapPin,
} from "lucide-react";
import { DisasterMap } from "../components/map/DisasterMap";
import { DisasterTypeBadge, SeverityBadge } from "../components/common/Badge";
import { formatTimeAgo } from "../utils/formatters";

export function IncidentMapPage({
  reports = [],
  selectedIncident,
  onSelectIncident,
}) {
  const [activeTab, setActiveTab] = useState("incidents"); // "incidents" | "details"

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-3">
      {/* Left / Main Map Area */}
      <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] border border-[#E1E5E0] rounded overflow-hidden shadow-2xs">
        {/* Top Console Bar */}
        <div className="px-4 py-2.5 bg-[#F8F9F7] border-b border-[#E1E5E0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#183D35]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#252C2A]">
              GIS Operations Tactical Display & Sensor Clusters
            </h2>
            <span className="text-[10px] font-mono text-[#737D78] hidden sm:inline">
              [EPSG:4326 WGS84 • Esri Light GIS]
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#737D78]">
            <span className="hidden md:inline font-mono font-medium text-[#183D35]">
              Plotting {reports.length} geocoded coordinates
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
      <div className="w-full lg:w-88 bg-[#FFFFFF] border border-[#E1E5E0] rounded flex flex-col h-72 lg:h-full overflow-hidden shrink-0 shadow-2xs">
        {/* Panel Header */}
        <div className="p-2.5 border-b border-[#E1E5E0] flex items-center justify-between bg-[#F8F9F7]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("incidents")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "incidents"
                  ? "bg-[#183D35] text-white"
                  : "text-[#737D78] hover:text-[#252C2A] hover:bg-[#FFFFFF]"
              }`}
            >
              Plotted ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "details"
                  ? "bg-[#183D35] text-white"
                  : "text-[#737D78] hover:text-[#252C2A] hover:bg-[#FFFFFF]"
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
                  className={`p-2.5 rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#183D35]/5 border-[#183D35]"
                      : "bg-[#FFFFFF] border-[#E1E5E0] hover:border-[#183D35] hover:bg-[#F8F9F7]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                    <SeverityBadge severity={item.severity} size="xs" />
                  </div>

                  <h4 className="font-semibold text-[#252C2A] text-xs mb-1 line-clamp-1">{item.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-[#737D78]">
                    <span className="truncate">📍 {item.location}</span>
                    <span className="font-medium text-[#183D35]">{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-[#E1E5E0] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#737D78]">
                      {item.latitude ? item.latitude.toFixed(2) : "0.00"}°N, {item.longitude ? item.longitude.toFixed(2) : "0.00"}°E
                    </span>
                    <span className="text-[#183D35] font-semibold">
                      Confidence: {Math.round((item.confidenceScore || 0.85) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })
          ) : selectedIncident ? (
            <div className="space-y-3">
              <div className="p-3 bg-[#F8F9F7] rounded border border-[#E1E5E0] space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <DisasterTypeBadge type={selectedIncident.disasterType} />
                  <SeverityBadge severity={selectedIncident.severity} />
                </div>
                <h3 className="text-xs font-bold text-[#252C2A]">{selectedIncident.title}</h3>
                <p className="text-xs text-[#737D78] leading-relaxed">{selectedIncident.description}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E1E5E0]">
                  <span className="text-[#737D78]">Coordinates:</span>
                  <span className="font-mono text-[#183D35] font-semibold">
                    {selectedIncident.latitude ? selectedIncident.latitude.toFixed(4) : "0.0000"}°N, {selectedIncident.longitude ? selectedIncident.longitude.toFixed(4) : "0.0000"}°E
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E0]">
                  <span className="text-[#737D78]">District / State:</span>
                  <span className="text-[#252C2A] font-medium">
                    {selectedIncident.district || selectedIncident.location}, {selectedIncident.state}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E0]">
                  <span className="text-[#737D78]">Reporting Channel:</span>
                  <span className="text-[#252C2A] font-medium capitalize">
                    {selectedIncident.sourceMeta?.name || selectedIncident.source?.platform}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E0]">
                  <span className="text-[#737D78]">Consensus Score:</span>
                  <span className="font-mono text-[#183D35] font-bold">
                    {Math.round((selectedIncident.confidenceScore || 0.85) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E1E5E0]">
                  <span className="text-[#737D78]">Surface Rain Gauge:</span>
                  <span className="font-mono text-[#252C2A] font-semibold">
                    {selectedIncident.checks?.physical?.rainfall_mm || selectedIncident.telemetry?.rainfall_mm || 78.4} mm
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectIncident(selectedIncident)}
                className="w-full py-2 rounded bg-[#183D35] hover:bg-[#214D43] text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Inspect Forensic Dossier
              </button>
            </div>
          ) : (
            <div className="text-center py-10 text-[#737D78]">
              <MapPin className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-[#183D35]" />
              <p>Click any map marker or incident to inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

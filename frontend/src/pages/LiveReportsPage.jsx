import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Radio,
  Clock,
  Layers,
  Download,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "../components/common/Badge";
import { formatTimeAgo, formatUtcTime } from "../utils/formatters";
import { DISASTER_COLORS } from "../data/mockDisasters";

export function LiveReportsPage({
  reports = [],
  filteredReports = [],
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  selectedSeverity,
  setSelectedSeverity,
  onSelectIncident,
  onVerify,
  onFlag,
}) {
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [selectedSource, setSelectedSource] = useState("all");

  const sources = [
    { id: "all", label: "All Sources" },
    { id: "imd", label: "🏛️ IMD Mausam" },
    { id: "sachet", label: "🚨 NDMA SACHET" },
    { id: "satellite", label: "🛰️ NASA / Radar" },
    { id: "gdelt", label: "📰 GDELT News" },
    { id: "bluesky", label: "🌐 Bluesky Social" },
    { id: "citizen", label: "📍 Citizen Mobile" },
  ];

  // Filter with local source channel filter as well
  const displayedReports = filteredReports.filter((item) => {
    if (selectedSource === "all") return true;
    const channel = item.sourceMeta?.channel || item.source?.platform;
    return channel === selectedSource || (item.source?.platform && item.source.platform.includes(selectedSource));
  });

  const exportDataJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(displayedReports, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `DisasterWatch_Intelligence_Reports_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search / Filter Controls */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
              Live Incident Intelligence Feed & Influx Stream
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {displayedReports.length} of {reports.length} multi-channel signals collected, verified & normalized
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#060D17] border border-teal-900/40 rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-teal-500/20 text-teal-300" : "text-slate-400 hover:text-white"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-teal-500/20 text-teal-300" : "text-slate-400 hover:text-white"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={exportDataJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1B28] hover:bg-[#142333] text-slate-200 text-xs font-semibold border border-teal-900/50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Search & Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-teal-900/30">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full bg-[#060D17] border border-teal-900/40 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          {/* Disaster Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#060D17] border border-teal-900/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-400 capitalize transition-colors"
          >
            <option value="all">All Disaster Hazards</option>
            <option value="flood">Flood Inundation</option>
            <option value="landslide">Landslide</option>
            <option value="cyclone">Cyclone / Storm</option>
            <option value="heavy_rainfall">Heavy Rainfall</option>
            <option value="earthquake">Earthquake</option>
            <option value="extreme_temperature">Extreme Temperature</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#060D17] border border-teal-900/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition-colors"
          >
            <option value="all">All Operational Lanes</option>
            <option value="verified">Verified Intelligence</option>
            <option value="pending">Review Lane (Pending)</option>
            <option value="duplicate">Duplicate Reports</option>
            <option value="rejected">Rejected / Hoaxes (Hard-Fails)</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-[#060D17] border border-teal-900/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition-colors"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (Immediate)</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Quick Lane Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
          <span className="text-slate-400 font-semibold text-[11px]">Lane Filter:</span>
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              selectedStatus === "all"
                ? "bg-[#0F1B28] text-white border border-teal-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setSelectedStatus("verified")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              selectedStatus === "verified"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Verified Intelligence
          </button>
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              selectedStatus === "pending"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Review Lane
          </button>
          <button
            onClick={() => setSelectedStatus("rejected")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              selectedStatus === "rejected" || selectedStatus === "flagged"
                ? "bg-[#ff5f1f]/20 text-orange-200 border border-orange-500/50"
                : "text-orange-400/80 hover:text-orange-300 hover:bg-[#431407]/30"
            }`}
          >
            🚨 Rejected / Hoaxes
          </button>
        </div>

        {/* Real Source Channel Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
          <span className="text-slate-400 font-medium">Channel Feed:</span>
          {sources.map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedSource === src.id
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                  : "bg-[#060D17] text-slate-400 hover:text-slate-200 border border-teal-900/30"
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {displayedReports.length === 0 ? (
        <div className="bg-[#0A111A]/80 border border-teal-900/30 rounded-2xl p-12 text-center text-slate-400 shadow-xl">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-bold text-slate-200 mb-1">No Matching Telemetry Reports</h3>
          <p className="text-xs text-slate-500">Try adjusting your source channel filters or search terms.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#060D17]/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-teal-900/40">
                <tr>
                  <th className="py-3 px-3.5">Report ID</th>
                  <th className="py-3 px-3.5">Hazard</th>
                  <th className="py-3 px-3.5">Location & District</th>
                  <th className="py-3 px-3.5">Timestamp</th>
                  <th className="py-3 px-3.5">Source Channel</th>
                  <th className="py-3 px-3.5">Severity</th>
                  <th className="py-3 px-3.5">Verification</th>
                  <th className="py-3 px-3.5">Confidence</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/20 font-sans">
                {displayedReports.map((item) => {
                  const srcMeta = item.sourceMeta || { name: item.source?.platform || "Crowd", icon: "📍" };
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectIncident(item)}
                      className="hover:bg-teal-950/25 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3.5 font-mono text-[11px] text-teal-400 font-bold whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <DisasterTypeBadge type={item.disasterType} size="xs" />
                      </td>

                      <td className="py-3 px-3.5 min-w-[200px] max-w-[280px]">
                        <div className="font-semibold text-slate-200 group-hover:text-teal-300 transition-colors truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">📍 {item.location}</div>
                        {(item.verdict === "rejected" || item.status === "flagged") && item.reasons?.[0] && (
                          <div className="text-[10px] text-[#ff5f1f] font-mono mt-0.5 truncate max-w-[260px] font-semibold">
                            ⚠ {item.reasons[0]}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                        <div>{formatTimeAgo(item.timestamp)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{formatUtcTime(item.timestamp)}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                          <span>{srcMeta.icon}</span>
                          <span className="truncate max-w-[110px]">{srcMeta.name}</span>
                        </div>
                        <div className="text-[10px] text-teal-400/90 font-mono truncate max-w-[100px]">
                          {item.source?.account || "Verified Feed"}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <SeverityBadge severity={item.severity} size="xs" />
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <StatusBadge status={item.status} size="xs" />
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-amber-300 font-bold text-[11px]">
                        {Math.round(item.confidenceScore * 100)}%
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== "verified" && (
                            <button
                              onClick={() => onVerify(item.id)}
                              title="Verify Report"
                              className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {item.status !== "flagged" && (
                            <button
                              onClick={() => onFlag(item.id)}
                              title="Flag as Hoax"
                              className="p-1.5 rounded-lg bg-[#ff5f1f]/10 hover:bg-[#ff5f1f]/20 text-[#ff5f1f] border border-[#ff5f1f]/30 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectIncident(item)}
                            className="px-2.5 py-1 rounded-lg bg-[#0F1B28] hover:bg-[#142333] text-slate-200 text-[11px] font-semibold border border-teal-900/50 cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedReports.map((item) => {
            const srcMeta = item.sourceMeta || { name: item.source?.platform || "Crowd", icon: "📍" };
            return (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-4.5 hover:border-teal-500/50 hover:bg-[#0D1622] transition-all cursor-pointer flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                    <SeverityBadge severity={item.severity} size="xs" />
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 hover:text-teal-300 transition-colors mb-1.5 line-clamp-2">
                    {item.title}
                  </h3>

                  {(item.verdict === "rejected" || item.status === "flagged") && item.reasons?.[0] && (
                    <div className="p-2 rounded-xl bg-[#431407]/60 border border-[#ff5f1f]/60 text-[10px] text-orange-200 mb-2 font-mono font-semibold">
                      ⚠ {item.reasons[0]}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-teal-900/30 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="truncate">📍 {item.location}</span>
                    <span className="font-mono text-teal-400 font-semibold">{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-300">
                      <span>{srcMeta.icon}</span>
                      <span className="font-semibold text-[10px]">{srcMeta.name}</span>
                    </div>
                    <span className="font-mono text-amber-300 font-bold">
                      {Math.round(item.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

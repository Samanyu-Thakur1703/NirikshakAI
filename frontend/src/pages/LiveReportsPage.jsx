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

  const sources = ["all", "imd", "sachet", "citizen_app", "gdacs", "twitter_x", "news"];

  // Filter with local source filter as well
  const displayedReports = filteredReports.filter((item) => {
    if (selectedSource === "all") return true;
    return item.source?.platform === selectedSource;
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              Live Incident Intelligence Feed
            </h2>
            <p className="text-xs text-slate-400">
              Showing {displayedReports.length} of {reports.length} total reports collected and normalized
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "table" ? "bg-slate-800 text-cyan-300" : "text-slate-400 hover:text-white"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "grid" ? "bg-slate-800 text-cyan-300" : "text-slate-400 hover:text-white"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={exportDataJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Search & Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Disaster Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
          >
            <option value="all">All Disaster Types</option>
            <option value="flood">Flood</option>
            <option value="landslide">Landslide</option>
            <option value="cyclone">Cyclone</option>
            <option value="heavy_rainfall">Heavy Rainfall</option>
            <option value="earthquake">Earthquake</option>
            <option value="extreme_temperature">Extreme Temperature</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Review</option>
            <option value="duplicate">Duplicate Reports</option>
            <option value="flagged">Flagged / Hoaxes</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Source Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
          <span className="text-slate-400 font-medium">Platform:</span>
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                selectedSource === src
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {src === "all" ? "All Platforms" : src.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {displayedReports.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-slate-200 mb-1">No Matching Reports</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Report ID</th>
                  <th className="py-3 px-3.5">Hazard</th>
                  <th className="py-3 px-3.5">Location & District</th>
                  <th className="py-3 px-3.5">Timestamp</th>
                  <th className="py-3 px-3.5">Source</th>
                  <th className="py-3 px-3.5">Severity</th>
                  <th className="py-3 px-3.5">Verification</th>
                  <th className="py-3 px-3.5">Confidence</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {displayedReports.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectIncident(item)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3.5 font-mono text-[11px] text-cyan-400 font-semibold whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <DisasterTypeBadge type={item.disasterType} size="xs" />
                    </td>

                    <td className="py-3 px-3.5 min-w-[200px] max-w-[280px]">
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">📍 {item.location}</div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      <div>{formatTimeAgo(item.timestamp)}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{formatUtcTime(item.timestamp)}</div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="capitalize text-slate-200 font-medium">{item.source?.platform}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[100px]">{item.source?.account}</div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <SeverityBadge severity={item.severity} size="xs" />
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={item.status} size="xs" />
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-emerald-400 font-bold text-[11px]">
                      {Math.round(item.confidenceScore * 100)}%
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== "verified" && (
                          <button
                            onClick={() => onVerify(item.id)}
                            title="Verify Report"
                            className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.status !== "flagged" && (
                          <button
                            onClick={() => onFlag(item.id)}
                            title="Flag as Hoax"
                            className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectIncident(item)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedReports.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectIncident(item)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <DisasterTypeBadge type={item.disasterType} size="xs" />
                  <SeverityBadge severity={item.severity} size="xs" />
                </div>

                <h3 className="text-xs font-bold text-slate-100 hover:text-cyan-300 transition-colors mb-1.5 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="truncate">📍 {item.location}</span>
                  <span className="font-mono text-cyan-400">{formatTimeAgo(item.timestamp)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} size="xs" />
                  <span className="font-mono text-emerald-400 font-bold">
                    Score: {Math.round(item.confidenceScore * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

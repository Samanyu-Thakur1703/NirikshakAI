import React, { useState } from "react";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Radio,
  Download,
  LayoutGrid,
  List,
} from "lucide-react";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "../components/common/Badge";
import { formatTimeAgo, formatUtcTime } from "../utils/formatters";

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
    <div className="space-y-4">
      {/* Top Filter & Control Panel */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-[#252C2A] flex items-center gap-2 uppercase tracking-wide">
              <Radio className="w-3.5 h-3.5 text-[#183D35]" />
              Live Incident Intelligence Feed & Inflow Stream
            </h2>
            <p className="text-xs text-[#737D78] mt-0.5">
              Showing {displayedReports.length} of {reports.length} signals collected, verified & geocoded across India
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F8F9F7] border border-[#E1E5E0] rounded p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-[#FFFFFF] text-[#183D35] shadow-2xs" : "text-[#737D78] hover:text-[#252C2A]"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-[#FFFFFF] text-[#183D35] shadow-2xs" : "text-[#737D78] hover:text-[#252C2A]"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={exportDataJson}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#252C2A] text-xs font-medium border border-[#E1E5E0] transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-[#183D35]" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Search & Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2.5 border-t border-[#E1E5E0]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#737D78] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full bg-[#FFFFFF] border border-[#E1E5E0] rounded pl-8 pr-2.5 py-1.5 text-xs text-[#252C2A] placeholder-[#737D78] focus:outline-none focus:border-[#183D35] transition-colors"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E1E5E0] rounded px-2.5 py-1.5 text-xs text-[#252C2A] focus:outline-none focus:border-[#183D35] capitalize transition-colors"
          >
            <option value="all">All Disaster Hazards</option>
            <option value="flood">Flood Inundation</option>
            <option value="landslide">Landslide</option>
            <option value="cyclone">Cyclone / Storm</option>
            <option value="heavy_rainfall">Heavy Rainfall</option>
            <option value="earthquake">Earthquake</option>
            <option value="extreme_temperature">Extreme Temperature</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E1E5E0] rounded px-2.5 py-1.5 text-xs text-[#252C2A] focus:outline-none focus:border-[#183D35] transition-colors"
          >
            <option value="all">All Operational Lanes</option>
            <option value="verified">Verified Intelligence</option>
            <option value="pending">Review Lane (Pending)</option>
            <option value="duplicate">Duplicate Reports</option>
            <option value="rejected">Rejected / Hoaxes (Hard-Fails)</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E1E5E0] rounded px-2.5 py-1.5 text-xs text-[#252C2A] focus:outline-none focus:border-[#183D35] transition-colors"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (Immediate)</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Operational Lane Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
          <span className="text-[#737D78] font-semibold text-[11px]">Lane Filter:</span>
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              selectedStatus === "all"
                ? "bg-[#183D35] text-white"
                : "bg-[#FFFFFF] text-[#737D78] border border-[#E1E5E0] hover:text-[#252C2A]"
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setSelectedStatus("verified")}
            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors border ${
              selectedStatus === "verified"
                ? "bg-[#183D35] text-white border-[#183D35]"
                : "bg-[#FFFFFF] text-[#737D78] border-[#E1E5E0] hover:text-[#252C2A]"
            }`}
          >
            Verified Intelligence
          </button>
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors border ${
              selectedStatus === "pending"
                ? "bg-[#D98236] text-white border-[#D98236]"
                : "bg-[#FFFFFF] text-[#737D78] border-[#E1E5E0] hover:text-[#252C2A]"
            }`}
          >
            Review Lane
          </button>
          <button
            onClick={() => setSelectedStatus("rejected")}
            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors border ${
              selectedStatus === "rejected" || selectedStatus === "flagged"
                ? "bg-[#C94C4C] text-white border-[#C94C4C]"
                : "bg-[#FFFFFF] text-[#C94C4C] border-[#E1E5E0] hover:bg-[#C94C4C]/5"
            }`}
          >
            Rejected / Hoaxes
          </button>
        </div>

        {/* Source Channels */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
          <span className="text-[#737D78] font-medium">Channel:</span>
          {sources.map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id)}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer border ${
                selectedSource === src.id
                  ? "bg-[#183D35] text-white border-[#183D35]"
                  : "bg-[#FFFFFF] text-[#737D78] border-[#E1E5E0] hover:text-[#252C2A]"
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {displayedReports.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-10 text-center text-[#737D78]">
          <AlertTriangle className="w-6 h-6 text-[#D98236] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#252C2A] mb-1">No Matching Telemetry Reports</h3>
          <p className="text-xs text-[#737D78]">Try adjusting your source channel filters or search terms.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#252C2A]">
              <thead className="bg-[#F8F9F7] text-[11px] uppercase tracking-wider text-[#737D78] border-b border-[#E1E5E0]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Report ID</th>
                  <th className="py-2.5 px-3 font-semibold">Hazard</th>
                  <th className="py-2.5 px-3 font-semibold">Location & District</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Channel</th>
                  <th className="py-2.5 px-3 font-semibold">Severity</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Confidence</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5E0]">
                {displayedReports.map((item) => {
                  const srcMeta = item.sourceMeta || { name: item.source?.platform || "Crowd", icon: "📍" };
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectIncident(item)}
                      className="hover:bg-[#F8F9F7] cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#183D35] font-semibold whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <DisasterTypeBadge type={item.disasterType} size="xs" />
                      </td>

                      <td className="py-2.5 px-3 min-w-[200px] max-w-[280px]">
                        <div className="font-semibold text-[#252C2A] group-hover:text-[#183D35] transition-colors truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#737D78] truncate">📍 {item.location}</div>
                        {(item.verdict === "rejected" || item.status === "flagged") && item.reasons?.[0] && (
                          <div className="text-[10px] text-[#C94C4C] font-mono mt-0.5 truncate max-w-[260px] font-semibold">
                            ⚠ {item.reasons[0]}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-[#737D78] text-[11px]">
                        <div>{formatTimeAgo(item.timestamp)}</div>
                        <div className="text-[10px] text-[#737D78] font-mono">{formatUtcTime(item.timestamp)}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[#252C2A] font-medium">
                          <span>{srcMeta.icon}</span>
                          <span className="truncate max-w-[110px]">{srcMeta.name}</span>
                        </div>
                        <div className="text-[10px] text-[#737D78] font-mono truncate max-w-[100px]">
                          {item.source?.account || "Verified Stream"}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <SeverityBadge severity={item.severity} size="xs" />
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={item.status} size="xs" />
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[#183D35] font-bold text-[11px]">
                        {Math.round((item.confidenceScore || 0.85) * 100)}%
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {item.status !== "verified" && (
                            <button
                              onClick={() => onVerify(item.id)}
                              title="Verify Report"
                              className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#183D35] border border-[#E1E5E0] transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {item.status !== "flagged" && (
                            <button
                              onClick={() => onFlag(item.id)}
                              title="Flag as Hoax"
                              className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#C94C4C] border border-[#E1E5E0] transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectIncident(item)}
                            className="px-2 py-0.5 rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#252C2A] text-[11px] font-medium border border-[#E1E5E0] cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedReports.map((item) => {
            const srcMeta = item.sourceMeta || { name: item.source?.platform || "Crowd", icon: "📍" };
            return (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-3.5 hover:border-[#183D35] transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                    <SeverityBadge severity={item.severity} size="xs" />
                  </div>

                  <h3 className="text-xs font-bold text-[#252C2A] hover:text-[#183D35] transition-colors mb-1 line-clamp-2">
                    {item.title}
                  </h3>

                  {(item.verdict === "rejected" || item.status === "flagged") && item.reasons?.[0] && (
                    <div className="p-1.5 rounded bg-[#C94C4C]/10 border border-[#C94C4C]/30 text-[10px] text-[#C94C4C] mb-2 font-mono font-semibold">
                      ⚠ {item.reasons[0]}
                    </div>
                  )}

                  <p className="text-[11px] text-[#737D78] line-clamp-2 mb-2">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-[#E1E5E0] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-[#737D78]">
                    <span className="truncate">📍 {item.location}</span>
                    <span className="font-mono text-[#183D35] font-medium">{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#252C2A]">
                      <span>{srcMeta.icon}</span>
                      <span className="font-semibold text-[10px]">{srcMeta.name}</span>
                    </div>
                    <span className="font-mono text-[#183D35] font-bold">
                      {Math.round((item.confidenceScore || 0.85) * 100)}%
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

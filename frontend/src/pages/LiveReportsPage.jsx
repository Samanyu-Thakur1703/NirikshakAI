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
    downloadAnchor.setAttribute("download", `CrisisOps_DamageReports_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-3">
      {/* Top Filter & Control Panel */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
              <Radio className="w-4 h-4 text-[#38BDF8]" />
              Damage Reports & Disaster Telemetry Influx
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Showing {displayedReports.length} of {reports.length} signals collected, verified & geocoded
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#111827] border border-[#1E293B] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#94A3B8] hover:text-white"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#94A3B8] hover:text-white"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={exportDataJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-200 text-xs font-medium border border-[#1E293B] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Search & Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2.5 border-t border-[#1E293B]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full bg-[#111827] border border-[#1E293B] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8] transition-colors"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#38BDF8] capitalize transition-colors"
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
            className="bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#38BDF8] transition-colors"
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
            className="bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#38BDF8] transition-colors"
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
          <span className="text-[#64748B] font-semibold text-[11px]">Lane:</span>
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedStatus === "all"
                ? "bg-[#2563EB] text-white font-bold"
                : "bg-[#111827] text-[#94A3B8] border border-[#1E293B] hover:text-white"
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setSelectedStatus("verified")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
              selectedStatus === "verified"
                ? "bg-[#10B981] text-slate-950 font-bold border-[#10B981]"
                : "bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-white"
            }`}
          >
            Verified Intelligence
          </button>
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
              selectedStatus === "pending"
                ? "bg-[#F59E0B] text-slate-950 font-bold border-[#F59E0B]"
                : "bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-white"
            }`}
          >
            Review Lane
          </button>
          <button
            onClick={() => setSelectedStatus("rejected")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
              selectedStatus === "rejected" || selectedStatus === "flagged"
                ? "bg-[#DC2626] text-white font-bold border-[#DC2626]"
                : "bg-[#111827] text-[#EF4444] border-[#1E293B] hover:bg-[#7F1D1D]/30"
            }`}
          >
            Rejected / Hoaxes
          </button>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {displayedReports.length === 0 ? (
        <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-10 text-center text-[#94A3B8]">
          <AlertTriangle className="w-8 h-8 text-[#F59E0B] mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-white mb-1">No Matching Damage Reports</h3>
          <p className="text-xs text-[#64748B]">Try adjusting your search query or filters.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#0E1526] text-[11px] uppercase tracking-wider text-[#94A3B8] border-b border-[#1E293B]">
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
              <tbody className="divide-y divide-[#1E293B]">
                {displayedReports.map((item) => {
                  const srcMeta = item.sourceMeta || { name: item.source?.platform || "Crowd", icon: "📍" };
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectIncident(item)}
                      className="hover:bg-[#131D31] cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#38BDF8] font-semibold whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <DisasterTypeBadge type={item.disasterType} size="xs" />
                      </td>

                      <td className="py-2.5 px-3 min-w-[200px] max-w-[280px]">
                        <div className="font-semibold text-white group-hover:text-[#38BDF8] transition-colors truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] truncate">📍 {item.location}</div>
                        {(item.verdict === "rejected" || item.status === "flagged") && item.reasons?.[0] && (
                          <div className="text-[10px] text-[#EF4444] font-mono mt-0.5 truncate max-w-[260px] font-semibold">
                            ⚠ {item.reasons[0]}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-[#94A3B8] text-[11px]">
                        <div>{formatTimeAgo(item.timestamp)}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{formatUtcTime(item.timestamp)}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-200 font-medium">
                          <span>{srcMeta.icon}</span>
                          <span className="truncate max-w-[110px]">{srcMeta.name}</span>
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono truncate max-w-[100px]">
                          {item.source?.account || "Verified Stream"}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <SeverityBadge severity={item.severity} size="xs" />
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={item.status} size="xs" />
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[#38BDF8] font-bold text-[11px]">
                        {Math.round((item.confidenceScore || 0.85) * 100)}%
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {item.status !== "verified" && (
                            <button
                              onClick={() => onVerify(item.id)}
                              title="Verify Report"
                              className="p-1 rounded bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/30 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {item.status !== "flagged" && (
                            <button
                              onClick={() => onFlag(item.id)}
                              title="Flag as Hoax"
                              className="p-1 rounded bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectIncident(item)}
                            className="px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-[11px] font-medium border border-[#334155] cursor-pointer"
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
                className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-3.5 hover:border-[#38BDF8] transition-colors cursor-pointer flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                    <SeverityBadge severity={item.severity} size="xs" />
                  </div>

                  <h3 className="text-xs font-bold text-white hover:text-[#38BDF8] transition-colors mb-1 line-clamp-2">
                    {item.title}
                  </h3>

                  {(item.verdict === "rejected" || item.status === "flagged") && item.reasons?.[0] && (
                    <div className="p-1.5 rounded-lg bg-[#7F1D1D]/30 border border-[#EF4444]/40 text-[10px] text-red-300 mb-2 font-mono font-semibold">
                      ⚠ {item.reasons[0]}
                    </div>
                  )}

                  <p className="text-[11px] text-[#94A3B8] line-clamp-2 mb-2">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-[#1E293B] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="truncate">📍 {item.location}</span>
                    <span className="font-mono text-[#38BDF8] font-medium">{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-200">
                      <span>{srcMeta.icon}</span>
                      <span className="font-semibold text-[10px]">{srcMeta.name}</span>
                    </div>
                    <span className="font-mono text-[#38BDF8] font-bold">
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

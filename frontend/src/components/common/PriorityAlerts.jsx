import React from "react";
import { AlertCircle, ChevronRight, ShieldAlert, Users } from "lucide-react";
import { DisasterTypeBadge, SeverityBadge } from "./Badge";
import { formatTimeAgo } from "../../utils/formatters";

export function PriorityAlerts({ alerts = [], onSelectIncident }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 text-center text-[#737D78] text-xs">
        No active priority alerts at this time. All channels nominal.
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded overflow-hidden shadow-2xs">
      <div className="px-4 py-3 border-b border-[#E1E5E0] flex items-center justify-between bg-[#F8F9F7]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/25">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#252C2A] flex items-center gap-2 uppercase tracking-wide">
              Emergency Priority Alerts
              <span className="text-[10px] bg-[#C94C4C]/10 text-[#C94C4C] font-mono font-bold px-1.5 py-0.2 rounded border border-[#C94C4C]/30">
                {alerts.length} Critical / High
              </span>
            </h3>
            <p className="text-[11px] text-[#737D78]">Immediate attention & dispatch evaluation required</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#E1E5E0] max-h-[320px] overflow-y-auto">
        {alerts.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectIncident(item)}
            className="p-3.5 hover:bg-[#F8F9F7] transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <DisasterTypeBadge type={item.disasterType} size="xs" />
                <SeverityBadge severity={item.severity} size="xs" />
                <span className="text-[11px] font-mono text-[#737D78]">ID: {item.id}</span>
                <span className="text-[11px] text-[#737D78]">• {formatTimeAgo(item.timestamp)}</span>
                {item.sourceMeta && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F3F4F0] text-[#252C2A] border border-[#E1E5E0]">
                    {item.sourceMeta.icon} {item.sourceMeta.name}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-[#252C2A] group-hover:text-[#183D35] transition-colors truncate">
                {item.title}
              </h4>

              <div className="flex items-center gap-3 mt-1 text-[11px] text-[#737D78]">
                <span className="truncate">📍 {item.location}</span>
                {item.casualties?.evacuated > 0 && (
                  <span className="flex items-center gap-1 text-[#183D35] font-medium">
                    <Users className="w-3 h-3" />
                    {item.casualties.evacuated} Evacuated
                  </span>
                )}
                <span className="font-mono text-[#183D35] font-semibold">
                  Confidence: {Math.round((item.confidenceScore || 0.85) * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                className="px-2.5 py-1 text-xs font-medium rounded bg-[#FFFFFF] text-[#252C2A] border border-[#E1E5E0] group-hover:bg-[#183D35] group-hover:text-white group-hover:border-[#183D35] flex items-center gap-1 transition-colors cursor-pointer"
              >
                Inspect
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { AlertCircle, ChevronRight, ShieldAlert, Users, Radio, Zap } from "lucide-react";
import { DisasterTypeBadge, SeverityBadge } from "./Badge";
import { formatTimeAgo } from "../../utils/formatters";

export function PriorityAlerts({ alerts = [], onSelectIncident }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-[#0A111A]/80 border border-teal-900/30 rounded-2xl p-6 text-center text-slate-400 text-xs">
        No active priority alerts at this time. All channels nominal.
      </div>
    );
  }

  return (
    <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="px-5 py-3.5 border-b border-teal-900/30 flex items-center justify-between bg-gradient-to-r from-[#0C141F] to-[#0A111A]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ff5f1f]/15 border border-[#ff5f1f]/40 text-[#ff5f1f]">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Emergency Priority Alerts
              <span className="text-[10px] bg-[#ff5f1f]/20 text-orange-200 font-mono font-bold px-2.5 py-0.5 rounded-full border border-orange-500/50">
                {alerts.length} Critical / Urgent
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Immediate attention & emergency dispatch evaluation required</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-teal-900/20 max-h-[350px] overflow-y-auto">
        {alerts.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectIncident(item)}
            className="p-4 hover:bg-teal-950/25 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <DisasterTypeBadge type={item.disasterType} size="xs" />
                <SeverityBadge severity={item.severity} size="xs" />
                <span className="text-[11px] font-mono text-teal-400 font-medium">ID: {item.id}</span>
                <span className="text-[11px] text-slate-500">• {formatTimeAgo(item.timestamp)}</span>
                {item.sourceMeta && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#070D14] text-amber-300 border border-teal-900/50">
                    {item.sourceMeta.icon} {item.sourceMeta.name}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-slate-100 group-hover:text-teal-300 transition-colors truncate">
                {item.title}
              </h4>

              <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-400">
                <span className="truncate">📍 {item.location}</span>
                {item.casualties?.evacuated > 0 && (
                  <span className="flex items-center gap-1 text-teal-400 font-medium">
                    <Users className="w-3 h-3" />
                    {item.casualties.evacuated} Evacuated
                  </span>
                )}
                <span className="font-mono text-amber-300 font-semibold">
                  Confidence: {Math.round(item.confidenceScore * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#0F1B28] text-slate-200 group-hover:bg-teal-500/20 group-hover:text-teal-300 group-hover:border-teal-400/40 border border-teal-900/50 flex items-center gap-1 transition-all cursor-pointer"
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

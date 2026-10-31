import React from "react";
import { AlertCircle, ChevronRight, ShieldAlert, Users } from "lucide-react";
import { DisasterTypeBadge, SeverityBadge } from "./Badge";
import { formatTimeAgo } from "../../utils/formatters";

export function PriorityAlerts({ alerts = [], onSelectIncident }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-slate-400 text-xs">
        No active priority alerts at this time.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Priority Incident Alerts
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded-full border border-rose-500/30">
                {alerts.length} Critical / High
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Immediate attention & emergency dispatch evaluation required</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800/70 max-h-[340px] overflow-y-auto">
        {alerts.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectIncident(item)}
            className="p-3.5 hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <DisasterTypeBadge type={item.disasterType} size="xs" />
                <SeverityBadge severity={item.severity} size="xs" />
                <span className="text-[11px] font-mono text-slate-400">ID: {item.id}</span>
                <span className="text-[11px] text-slate-500">• {formatTimeAgo(item.timestamp)}</span>
              </div>

              <h4 className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                {item.title}
              </h4>

              <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-400">
                <span className="truncate">📍 {item.location}</span>
                {item.casualties?.evacuated > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Users className="w-3 h-3" />
                    {item.casualties.evacuated} Evacuated
                  </span>
                )}
                <span className="font-mono text-slate-400">Confidence: {Math.round(item.confidenceScore * 100)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-300 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 group-hover:border-cyan-500/30 border border-slate-700/80 flex items-center gap-1 transition-all"
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

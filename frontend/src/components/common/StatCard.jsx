import React from "react";
import { formatNumber } from "../../utils/formatters";

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeColor = "emerald",
  accentColor = "cyan",
  trend,
  onClick,
}) {
  const accentBorder = {
    cyan: "hover:border-cyan-500/50",
    emerald: "hover:border-emerald-500/50",
    amber: "hover:border-amber-500/50",
    purple: "hover:border-purple-500/50",
    rose: "hover:border-rose-500/50",
  }[accentColor] || "hover:border-slate-600";

  const iconBg = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[accentColor] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/80 border border-slate-800/80 rounded-xl p-4.5 transition-all duration-200 backdrop-blur-sm ${accentBorder} ${
        onClick ? "cursor-pointer hover:bg-slate-800/60 shadow-lg shadow-black/20" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wide">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2.5">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        {badgeText && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              badgeColor === "emerald"
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                : badgeColor === "amber"
                ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                : badgeColor === "blue"
                ? "bg-blue-950/60 text-blue-300 border-blue-800/50"
                : "bg-rose-950/60 text-rose-300 border-rose-800/50"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{subtext}</span>
          {trend && <span className="text-cyan-400 font-mono text-[11px]">{trend}</span>}
        </div>
      )}
    </div>
  );
}

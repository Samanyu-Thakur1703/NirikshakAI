import React from "react";
import { formatNumber } from "../../utils/formatters";

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeColor = "teal",
  accentColor = "teal",
  trend,
  onClick,
}) {
  const accentBorder = {
    teal: "hover:border-teal-400/60 hover:shadow-teal-950/40",
    gold: "hover:border-amber-400/60 hover:shadow-amber-950/40",
    orange: "hover:border-[#ff5f1f]/60 hover:shadow-orange-950/40",
    cyan: "hover:border-cyan-500/50 hover:shadow-cyan-950/40",
    emerald: "hover:border-emerald-500/50 hover:shadow-emerald-950/40",
    amber: "hover:border-amber-500/50 hover:shadow-amber-950/40",
    rose: "hover:border-rose-500/50 hover:shadow-rose-950/40",
  }[accentColor] || "hover:border-teal-500/40";

  const iconBg = {
    teal: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    gold: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    orange: "bg-[#ff5f1f]/15 text-orange-300 border-orange-500/40",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[accentColor] || "bg-teal-950/40 text-teal-300 border-teal-800/40";

  const valueColor = {
    gold: "text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    orange: "text-[#ff5f1f] drop-shadow-[0_0_12px_rgba(255,95,31,0.3)]",
    teal: "text-teal-300 drop-shadow-[0_0_10px_rgba(45,212,191,0.2)]",
  }[accentColor] || "text-white";

  return (
    <div
      onClick={onClick}
      className={`bg-[#0A111A]/90 border border-teal-900/30 rounded-2xl p-5 transition-all duration-300 backdrop-blur-md shadow-xl ${accentBorder} ${
        onClick ? "cursor-pointer hover:bg-[#0D1622] hover:scale-[1.01]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border shadow-sm ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${valueColor}`}>
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        {badgeText && (
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              badgeColor === "gold" || badgeColor === "amber"
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                : badgeColor === "orange" || badgeColor === "rose"
                ? "bg-[#ff5f1f]/15 text-orange-200 border-orange-500/40"
                : badgeColor === "teal" || badgeColor === "emerald"
                ? "bg-teal-500/15 text-teal-300 border-teal-500/40"
                : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span className="truncate">{subtext}</span>
          {trend && <span className="text-teal-400 font-mono text-[11px] font-semibold">{trend}</span>}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { formatNumber } from "../../utils/formatters";

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeColor = "primary",
  trend,
  onClick,
}) {
  const badgeStyles = {
    primary: "bg-[#183D35]/10 text-[#183D35] border-[#183D35]/30",
    secondary: "bg-[#397568]/10 text-[#397568] border-[#397568]/30",
    warning: "bg-[#D98236]/10 text-[#D98236] border-[#D98236]/30",
    critical: "bg-[#C94C4C]/10 text-[#C94C4C] border-[#C94C4C]/30",
    teal: "bg-[#183D35]/10 text-[#183D35] border-[#183D35]/30",
    gold: "bg-[#D98236]/10 text-[#D98236] border-[#D98236]/30",
    orange: "bg-[#D98236]/10 text-[#D98236] border-[#D98236]/30",
    rose: "bg-[#C94C4C]/10 text-[#C94C4C] border-[#C94C4C]/30",
    emerald: "bg-[#183D35]/10 text-[#183D35] border-[#183D35]/30",
  }[badgeColor] || "bg-[#F3F4F0] text-[#737D78] border-[#E1E5E0]";

  return (
    <div
      onClick={onClick}
      className={`bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 transition-colors ${
        onClick ? "cursor-pointer hover:border-[#183D35]/60 hover:bg-[#F8F9F7]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold text-[#737D78] tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded bg-[#F3F4F0] text-[#183D35] border border-[#E1E5E0]">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight font-mono text-[#252C2A]">
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        {badgeText && (
          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${badgeStyles}`}>
            {badgeText}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#737D78] pt-2 border-t border-[#E1E5E0]">
          <span className="truncate">{subtext}</span>
          {trend && <span className="text-[#183D35] font-mono font-medium">{trend}</span>}
        </div>
      )}
    </div>
  );
}

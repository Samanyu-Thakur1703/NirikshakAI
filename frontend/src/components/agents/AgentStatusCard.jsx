import React from "react";
import { Radio, ShieldCheck, MapPin, TrendingUp, Cpu } from "lucide-react";

export function AgentStatusCard({ agent, onActionClick }) {
  const iconMap = {
    Radio: Radio,
    ShieldCheck: ShieldCheck,
    MapPin: MapPin,
    TrendingUp: TrendingUp,
  };

  const IconComponent = iconMap[agent.icon] || Cpu;

  const statusBadge = {
    active: {
      label: "Active",
      badge: "bg-[#183D35]/10 text-[#183D35] border-[#183D35]/30",
      dot: "bg-[#183D35]",
    },
    processing: {
      label: "Processing",
      badge: "bg-[#D98236]/10 text-[#D98236] border-[#D98236]/30",
      dot: "bg-[#D98236]",
    },
    idle: {
      label: "Standby",
      badge: "bg-[#F3F4F0] text-[#737D78] border-[#E1E5E0]",
      dot: "bg-[#737D78]",
    },
    completed: {
      label: "Completed",
      badge: "bg-[#183D35]/10 text-[#183D35] border-[#183D35]/30",
      dot: "bg-[#183D35]",
    },
  }[agent.status] || {
    label: agent.status,
    badge: "bg-[#F3F4F0] text-[#737D78] border-[#E1E5E0]",
    dot: "bg-[#737D78]",
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#F8F9F7] border border-[#E1E5E0] text-[#183D35]">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#252C2A] leading-tight">{agent.name}</h3>
              <span className="text-[10px] font-mono text-[#737D78] font-medium">{agent.code}</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${statusBadge.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#737D78] line-clamp-2 mb-3 leading-relaxed">{agent.description}</p>

        {/* Throughput & Latency Metrics */}
        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded bg-[#F8F9F7] border border-[#E1E5E0] text-center mb-3">
          <div>
            <span className="text-[10px] text-[#737D78] block font-medium">Throughput</span>
            <span className="text-xs font-mono font-bold text-[#252C2A]">{agent.throughput}</span>
          </div>
          <div className="border-x border-[#E1E5E0]">
            <span className="text-[10px] text-[#737D78] block font-medium">Avg Latency</span>
            <span className="text-xs font-mono font-bold text-[#183D35]">{agent.avgLatency}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#737D78] block font-medium">Pass Rate</span>
            <span className="text-xs font-mono font-bold text-[#252C2A]">{agent.acceptedRate}</span>
          </div>
        </div>

        {/* Load Bar */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#737D78]">Compute Workload</span>
            <span className="font-mono text-[#252C2A] font-semibold">{agent.loadPercent}%</span>
          </div>
          <div className="w-full bg-[#E1E5E0] rounded h-1.5 overflow-hidden">
            <div
              className={`h-full rounded transition-all duration-300 ${
                agent.loadPercent > 85 ? "bg-[#C94C4C]" : "bg-[#183D35]"
              }`}
              style={{ width: `${agent.loadPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onActionClick}
        className="w-full mt-2 py-1.5 px-3 rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#183D35] border border-[#E1E5E0] hover:border-[#183D35] text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>Execute Agent Cycle</span>
      </button>
    </div>
  );
}

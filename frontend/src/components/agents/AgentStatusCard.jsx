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
      badge: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40",
      dot: "bg-[#10B981] animate-pulse",
    },
    processing: {
      label: "Processing",
      badge: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40",
      dot: "bg-[#F59E0B] animate-pulse",
    },
    idle: {
      label: "Standby",
      badge: "bg-[#1E293B] text-[#94A3B8] border-[#334155]",
      dot: "bg-[#64748B]",
    },
    completed: {
      label: "Completed",
      badge: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40",
      dot: "bg-[#10B981]",
    },
  }[agent.status] || {
    label: agent.status,
    badge: "bg-[#1E293B] text-slate-300",
    dot: "bg-slate-400",
  };

  return (
    <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] text-[#38BDF8]">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight">{agent.name}</h3>
              <span className="text-[10px] font-mono text-[#64748B] font-medium">{agent.code}</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${statusBadge.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#94A3B8] line-clamp-2 mb-3 leading-relaxed">{agent.description}</p>

        {/* Throughput & Latency Metrics */}
        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-lg bg-[#0E1526] border border-[#1E293B] text-center mb-3">
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">Throughput</span>
            <span className="text-xs font-mono font-bold text-white">{agent.throughput}</span>
          </div>
          <div className="border-x border-[#1E293B]">
            <span className="text-[10px] text-[#64748B] block font-medium">Avg Latency</span>
            <span className="text-xs font-mono font-bold text-[#38BDF8]">{agent.avgLatency}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">Pass Rate</span>
            <span className="text-xs font-mono font-bold text-[#10B981]">{agent.acceptedRate}</span>
          </div>
        </div>

        {/* Load Bar */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#64748B]">Compute Workload</span>
            <span className="font-mono text-white font-semibold">{agent.loadPercent}%</span>
          </div>
          <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden border border-[#1E293B]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                agent.loadPercent > 85 ? "bg-[#EF4444]" : "bg-[#2563EB]"
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
        className="w-full mt-2 py-1.5 px-3 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-[#38BDF8] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>Execute Agent Cycle</span>
      </button>
    </div>
  );
}

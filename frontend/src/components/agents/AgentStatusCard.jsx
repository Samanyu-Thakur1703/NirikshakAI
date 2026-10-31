import React from "react";
import { Radio, ShieldCheck, MapPin, TrendingUp, Cpu, CheckCircle2 } from "lucide-react";

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
      badge: "bg-teal-500/15 text-teal-300 border-teal-500/40",
      dot: "bg-teal-400 animate-pulse",
    },
    processing: {
      label: "Processing",
      badge: "bg-amber-400/15 text-amber-300 border-amber-400/40",
      dot: "bg-amber-400 animate-pulse",
    },
    idle: {
      label: "Standby",
      badge: "bg-slate-800 text-slate-400 border-slate-700",
      dot: "bg-slate-500",
    },
    completed: {
      label: "Completed",
      badge: "bg-teal-500/15 text-teal-300 border-teal-500/40",
      dot: "bg-teal-400",
    },
  }[agent.status] || {
    label: agent.status,
    badge: "bg-slate-800 text-slate-300",
    dot: "bg-slate-400",
  };

  return (
    <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md hover:border-teal-500/50 hover:bg-[#0D1622] transition-all shadow-xl flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#060D17] border border-teal-500/30 text-teal-300 shadow-sm">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{agent.name}</h3>
              <span className="text-[10px] font-mono text-teal-400 font-semibold">{agent.code}</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-3.5 leading-relaxed">{agent.description}</p>

        {/* Throughput & Latency Metrics */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#060D17] border border-teal-900/40 text-center mb-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Throughput</span>
            <span className="text-xs font-mono font-bold text-slate-200">{agent.throughput}</span>
          </div>
          <div className="border-x border-teal-900/30">
            <span className="text-[10px] text-slate-400 block font-semibold">Avg Latency</span>
            <span className="text-xs font-mono font-bold text-teal-300">{agent.avgLatency}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Pass Rate</span>
            <span className="text-xs font-mono font-bold text-amber-300">{agent.acceptedRate}</span>
          </div>
        </div>

        {/* Load Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400">Compute Workload</span>
            <span className="font-mono text-amber-300 font-bold">{agent.loadPercent}%</span>
          </div>
          <div className="w-full bg-[#060D17] rounded-full h-1.5 overflow-hidden border border-teal-900/30">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                agent.loadPercent > 85 ? "bg-[#ff5f1f]" : "bg-gradient-to-r from-teal-500 to-amber-400"
              }`}
              style={{ width: `${agent.loadPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Trigger Button */}
      <button
        type="button"
        onClick={onActionClick}
        className="w-full mt-2 py-2 px-3 rounded-xl bg-[#0F1B28] hover:bg-[#142333] text-teal-300 hover:text-teal-200 border border-teal-900/50 hover:border-teal-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
      >
        <span>Run Pipeline Cycle</span>
      </button>
    </div>
  );
}

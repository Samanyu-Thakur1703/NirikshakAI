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
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
      dot: "bg-emerald-400",
    },
    processing: {
      label: "Processing",
      badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
      dot: "bg-cyan-400 animate-pulse",
    },
    idle: {
      label: "Idle",
      badge: "bg-slate-700/40 text-slate-400 border-slate-700",
      dot: "bg-slate-500",
    },
    completed: {
      label: "Completed",
      badge: "bg-blue-500/15 text-blue-300 border-blue-500/40",
      dot: "bg-blue-400",
    },
  }[agent.status] || {
    label: agent.status,
    badge: "bg-slate-800 text-slate-300",
    dot: "bg-slate-400",
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4.5 backdrop-blur-sm hover:border-slate-700 transition-all">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-cyan-400">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{agent.name}</h3>
            <span className="text-[10px] font-mono text-slate-400">{agent.code}</span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
          {statusBadge.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 line-clamp-2 mb-3.5 leading-relaxed">{agent.description}</p>

      {/* Throughput & Latency Metrics */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-slate-950/60 border border-slate-800/70 text-center mb-3">
        <div>
          <span className="text-[10px] text-slate-400 block">Throughput</span>
          <span className="text-xs font-mono font-bold text-slate-200">{agent.throughput}</span>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[10px] text-slate-400 block">Avg Latency</span>
          <span className="text-xs font-mono font-bold text-cyan-400">{agent.avgLatency}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Pass Rate</span>
          <span className="text-xs font-mono font-bold text-emerald-400">{agent.acceptedRate}</span>
        </div>
      </div>

      {/* Load Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400">Compute Load</span>
          <span className="font-mono text-slate-300 font-semibold">{agent.loadPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              agent.loadPercent > 85 ? "bg-amber-400" : "bg-cyan-500"
            }`}
            style={{ width: `${agent.loadPercent}%` }}
          />
        </div>
      </div>

      {/* Recent task preview */}
      {agent.recentTasks && agent.recentTasks.length > 0 && (
        <div className="border-t border-slate-800/80 pt-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Latest Operation:</span>
          <div className="text-[11px] text-slate-300 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="truncate">{agent.recentTasks[0].action}</span>
          </div>
        </div>
      )}
    </div>
  );
}

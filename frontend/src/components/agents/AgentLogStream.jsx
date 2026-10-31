import React from "react";
import { Terminal, Shield, RefreshCw } from "lucide-react";
import { MOCK_AGENT_LOGS } from "../../data/agentData";

export function AgentLogStream({ logs = MOCK_AGENT_LOGS, className = "" }) {
  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs ${className}`}>
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-xs tracking-wide">Multi-Agent Event Dispatch Stream</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-emerald-400">STREAMING</span>
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-72 overflow-y-auto bg-black/50 text-[11px]">
        {logs.map((log) => {
          const levelColor =
            log.level === "CRITICAL"
              ? "text-rose-400 font-bold"
              : log.level === "WARN"
              ? "text-amber-400 font-semibold"
              : "text-cyan-400";

          return (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-slate-900/60 p-1 rounded">
              <span className="text-slate-500 shrink-0 font-mono">[{log.timestamp}]</span>
              <span className="text-slate-400 shrink-0 font-semibold">[{log.agent}]</span>
              <span className={`shrink-0 ${levelColor}`}>[{log.level}]</span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

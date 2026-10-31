import React from "react";
import { Terminal } from "lucide-react";
import { MOCK_AGENT_LOGS } from "../../data/agentData";

export function AgentLogStream({ logs = MOCK_AGENT_LOGS, className = "" }) {
  return (
    <div className={`bg-[#0B101B] border border-[#1E293B] rounded-xl overflow-hidden font-mono text-xs shadow-md ${className}`}>
      <div className="px-3.5 py-2.5 bg-[#0E1526] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Terminal className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="font-semibold text-xs tracking-wide uppercase">Multi-Agent Event Dispatch Stream</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          <span className="text-[10px] text-[#10B981] font-semibold">STREAMING</span>
        </div>
      </div>

      <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto bg-[#080D17] text-[11px]">
        {logs.map((log) => {
          const levelColor =
            log.level === "CRITICAL"
              ? "text-[#EF4444] font-bold"
              : log.level === "WARN"
              ? "text-[#F59E0B] font-semibold"
              : "text-[#38BDF8]";

          return (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-[#0E1526] p-1 rounded transition-colors">
              <span className="text-[#64748B] shrink-0 font-mono">[{log.timestamp}]</span>
              <span className="text-white shrink-0 font-semibold">[{log.agent}]</span>
              <span className={`shrink-0 ${levelColor}`}>[{log.level}]</span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

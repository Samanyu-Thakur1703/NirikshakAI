import React from "react";
import { Terminal } from "lucide-react";
import { MOCK_AGENT_LOGS } from "../../data/agentData";

export function AgentLogStream({ logs = MOCK_AGENT_LOGS, className = "" }) {
  return (
    <div className={`bg-[#FFFFFF] border border-[#E1E5E0] rounded overflow-hidden font-mono text-xs shadow-2xs ${className}`}>
      <div className="px-3.5 py-2 bg-[#F8F9F7] border-b border-[#E1E5E0] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#252C2A]">
          <Terminal className="w-3.5 h-3.5 text-[#183D35]" />
          <span className="font-semibold text-xs tracking-wide uppercase">Multi-Agent Event Dispatch Stream</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#183D35] animate-pulse"></span>
          <span className="text-[10px] text-[#183D35] font-semibold">STREAMING</span>
        </div>
      </div>

      <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto bg-[#FFFFFF] text-[11px]">
        {logs.map((log) => {
          const levelColor =
            log.level === "CRITICAL"
              ? "text-[#C94C4C] font-bold"
              : log.level === "WARN"
              ? "text-[#D98236] font-semibold"
              : "text-[#183D35]";

          return (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-[#F8F9F7] p-1 rounded transition-colors">
              <span className="text-[#737D78] shrink-0 font-mono">[{log.timestamp}]</span>
              <span className="text-[#252C2A] shrink-0 font-semibold">[{log.agent}]</span>
              <span className={`shrink-0 ${levelColor}`}>[{log.level}]</span>
              <span className="text-[#252C2A] break-words">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

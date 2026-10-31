import React, { useState } from "react";
import {
  Bot,
  Cpu,
  Zap,
} from "lucide-react";
import { AI_AGENTS, MOCK_AGENT_LOGS } from "../data/agentData";
import { AgentStatusCard } from "../components/agents/AgentStatusCard";
import { AgentLogStream } from "../components/agents/AgentLogStream";

export function AiAgentsPage({ onTriggerAgent, onTriggerSimulation }) {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("all");
  const [logs, setLogs] = useState(MOCK_AGENT_LOGS);
  const [isSimulatingBatch, setIsSimulatingBatch] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (selectedAgentFilter === "all") return true;
    return log.agent.toLowerCase().includes(selectedAgentFilter.toLowerCase());
  });

  const triggerSimulatedAction = (agentName) => {
    setIsSimulatingBatch(true);
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toTimeString().substring(0, 8),
      agent: agentName,
      level: "INFO",
      message: `Operator manual trigger: Executed real-world feed polling & verification cycle`,
    };
    setLogs((prev) => [newLog, ...prev]);
    if (agentName.toLowerCase().includes("ingest")) {
      onTriggerAgent?.("ingestion");
    } else {
      onTriggerSimulation?.();
    }
    setTimeout(() => setIsSimulatingBatch(false), 1200);
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Bot className="w-4 h-4 text-[#38BDF8]" />
            Multi-Agent Pipeline Architecture
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Four specialized agents collaborating in a sequential pipeline: Ingestion → Verification → Mapping → Ranking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerAgent ? onTriggerAgent("ingestion") : triggerSimulatedAction("Ingestion Agent")}
            disabled={isSimulatingBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#FDE047]" />
            {isSimulatingBatch ? "Running Ingestion..." : "Open Ingest Console"}
          </button>
        </div>
      </div>

      {/* 4 Core Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {AI_AGENTS.map((agent) => (
          <AgentStatusCard
            key={agent.id}
            agent={agent}
            onActionClick={() => triggerSimulatedAction(agent.name)}
          />
        ))}
      </div>

      {/* Agent Workflow Contract Spec Box */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#38BDF8]" />
          Autonomous Pipeline Architecture & Handshake Contracts (SPEC.md)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#0E1526] rounded-lg border border-[#1E293B] space-y-1">
            <div className="font-bold text-[#38BDF8] mb-0.5">
              1. Ingestion Agent
            </div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Normalizes heterogeneous signals (SACHET, IMD, NASA GIBS, GDELT News, Bluesky) into strict DisasterReport format. Enforces relevance threshold &gt; 0.70.
            </p>
          </div>

          <div className="p-3 bg-[#0E1526] rounded-lg border border-[#1E293B] space-y-1">
            <div className="font-bold text-[#10B981] mb-0.5">
              2. Verification Agent
            </div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Performs 5-pillar checks: C1 Official alerts, C2 Physical weather radar, C3 Perceptual hash (pHash) against historical archives to catch recycled fakes, C4 Location, C5 Multi-source.
            </p>
          </div>

          <div className="p-3 bg-[#0E1526] rounded-lg border border-[#1E293B] space-y-1">
            <div className="font-bold text-[#38BDF8] mb-0.5">
              3. Mapping Agent
            </div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Applies DBSCAN spatio-temporal clustering within 5km radius & 60min window. Calculates geographic polygon impact buffers and renders MapLibre GL layers.
            </p>
          </div>

          <div className="p-3 bg-[#0E1526] rounded-lg border border-[#1E293B] space-y-1">
            <div className="font-bold text-[#EF4444] mb-0.5">
              4. Ranking Agent
            </div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Calculates severity using weighted multi-criteria formula: 0.30 C1 + 0.25 C2 + 0.20 C5 + 0.15 C3 + 0.10 C4. Dispatches India NDMA SACHET compliant CAP 1.2 XML alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Live Agent Terminal Log Stream */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-xs font-semibold text-[#64748B]">Filter Event Stream:</span>
          {["all", "Ingestion", "Verification", "Mapping", "Ranking"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedAgentFilter(filter)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer border ${
                selectedAgentFilter === filter
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <AgentLogStream logs={filteredLogs} />
      </div>
    </div>
  );
}

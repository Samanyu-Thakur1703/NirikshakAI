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
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#252C2A] flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#183D35]" />
            Multi-Agent Pipeline Architecture
          </h2>
          <p className="text-xs text-[#737D78] mt-0.5">
            Four specialized agents collaborating in a sequential pipeline: Ingestion → Verification → Mapping → Ranking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerAgent ? onTriggerAgent("ingestion") : triggerSimulatedAction("Ingestion Agent")}
            disabled={isSimulatingBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#183D35] hover:bg-[#214D43] disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
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
      <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#252C2A] mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#183D35]" />
          Autonomous Pipeline Architecture & Handshake Contracts (SPEC.md)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F8F9F7] rounded border border-[#E1E5E0] space-y-1">
            <div className="font-bold text-[#183D35] mb-0.5">
              1. Ingestion Agent
            </div>
            <p className="text-[#737D78] text-[11px] leading-relaxed">
              Normalizes heterogeneous signals (SACHET, IMD, NASA GIBS, GDELT News, Bluesky) into strict DisasterReport format. Enforces relevance threshold &gt; 0.70.
            </p>
          </div>

          <div className="p-3 bg-[#F8F9F7] rounded border border-[#E1E5E0] space-y-1">
            <div className="font-bold text-[#183D35] mb-0.5">
              2. Verification Agent
            </div>
            <p className="text-[#737D78] text-[11px] leading-relaxed">
              Performs 5-pillar checks: C1 Official alerts, C2 Physical weather radar, C3 Perceptual hash (pHash) against historical archives to catch recycled fakes, C4 Location, C5 Multi-source.
            </p>
          </div>

          <div className="p-3 bg-[#F8F9F7] rounded border border-[#E1E5E0] space-y-1">
            <div className="font-bold text-[#183D35] mb-0.5">
              3. Mapping Agent
            </div>
            <p className="text-[#737D78] text-[11px] leading-relaxed">
              Applies DBSCAN spatio-temporal clustering within 5km radius & 60min window. Calculates geographic polygon impact buffers and renders MapLibre GL layers.
            </p>
          </div>

          <div className="p-3 bg-[#F8F9F7] rounded border border-[#E1E5E0] space-y-1">
            <div className="font-bold text-[#C94C4C] mb-0.5">
              4. Ranking Agent
            </div>
            <p className="text-[#737D78] text-[11px] leading-relaxed">
              Calculates severity using weighted multi-criteria formula: 0.30 C1 + 0.25 C2 + 0.20 C5 + 0.15 C3 + 0.10 C4. Dispatches India NDMA SACHET compliant CAP 1.2 XML alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Live Agent Terminal Log Stream */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-xs font-semibold text-[#737D78]">Filter Event Stream:</span>
          {["all", "Ingestion", "Verification", "Mapping", "Ranking"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedAgentFilter(filter)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer border ${
                selectedAgentFilter === filter
                  ? "bg-[#183D35] text-white border-[#183D35]"
                  : "bg-[#FFFFFF] text-[#737D78] border-[#E1E5E0] hover:text-[#252C2A]"
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

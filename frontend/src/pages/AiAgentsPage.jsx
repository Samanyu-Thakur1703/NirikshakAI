import React, { useState } from "react";
import {
  Bot,
  Radio,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Terminal,
  Activity,
  CheckCircle,
  Play,
  Cpu,
  Layers,
  Sparkles,
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-400" />
            Autonomous AI Multi-Agent Mesh
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Four specialized agents collaborating in a decentralized pipeline: Ingestion → Verification → Mapping → Ranking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerAgent ? onTriggerAgent("ingestion") : triggerSimulatedAction("Ingestion Agent")}
            disabled={isSimulatingBatch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 hover:from-teal-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-teal-950/40 transition-all cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            {isSimulatingBatch ? "Running Ingestion..." : "Open Ingest Console"}
          </button>
        </div>
      </div>

      {/* 4 Core Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {AI_AGENTS.map((agent) => (
          <AgentStatusCard
            key={agent.id}
            agent={agent}
            onActionClick={() => triggerSimulatedAction(agent.name)}
          />
        ))}
      </div>

      {/* Agent Workflow Contract Spec Box */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          Autonomous Pipeline Architecture & Handshake Contracts (SPEC.md)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-[#060D17] rounded-xl border border-teal-900/40 space-y-1.5 shadow-sm">
            <div className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
              <span>1. Ingestion Agent</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Normalizes heterogeneous signals (SACHET, IMD, NASA GIBS, GDELT News, Bluesky) into strict DisasterReport format. Enforces relevance threshold &gt; 0.70.
            </p>
          </div>

          <div className="p-3.5 bg-[#060D17] rounded-xl border border-teal-900/40 space-y-1.5 shadow-sm">
            <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>2. Verification Agent</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Performs 5-pillar checks: C1 Official alerts, C2 Physical weather radar, C3 Perceptual hash (pHash) against historical archives to catch recycled fakes, C4 Location, C5 Multi-source.
            </p>
          </div>

          <div className="p-3.5 bg-[#060D17] rounded-xl border border-teal-900/40 space-y-1.5 shadow-sm">
            <div className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
              <span>3. Mapping Agent</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Applies DBSCAN spatio-temporal clustering within 5km radius & 60min window. Calculates geographic polygon impact buffers and renders MapLibre GL layers.
            </p>
          </div>

          <div className="p-3.5 bg-[#060D17] rounded-xl border border-teal-900/40 space-y-1.5 shadow-sm">
            <div className="font-bold text-[#ff5f1f] mb-1 flex items-center gap-1.5">
              <span>4. Ranking Agent</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Calculates severity using weighted multi-criteria formula: 0.30 C1 + 0.25 C2 + 0.20 C5 + 0.15 C3 + 0.10 C4. Dispatches India NDMA SACHET compliant CAP 1.2 XML alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Live Agent Terminal Log Stream */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-300">Filter Event Stream:</span>
            {["all", "Ingestion", "Verification", "Mapping", "Ranking"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedAgentFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                  selectedAgentFilter === filter
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                    : "bg-[#0A111A] text-slate-400 hover:text-slate-200 border border-teal-900/30"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <AgentLogStream logs={filteredLogs} />
      </div>
    </div>
  );
}

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

export function AiAgentsPage({ onTriggerSimulation }) {
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
      message: `Operator manual trigger: Executed telemetry resync & confidence recalibration`,
    };
    setLogs((prev) => [newLog, ...prev]);
    onTriggerSimulation?.();
    setTimeout(() => setIsSimulatingBatch(false), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Autonomous AI Multi-Agent Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Four specialized agents collaborating in a decentralized pipeline: Ingestion → Verification → Mapping → Ranking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSimulatedAction("Ingestion Agent")}
            disabled={isSimulatingBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSimulatingBatch ? "Running resync..." : "Trigger Batch Ingestion"}
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Autonomous Pipeline Architecture & Handshake Contracts (SPEC.md)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
              <span>1. Ingestion Agent</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Normalizes heterogeneous signals (SACHET, IMD, citizen mobile, social media) into strict DisasterReport format. Enforces relevance threshold &gt; 0.70.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
              <span>2. Verification Agent</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Performs 5-pillar checks: C1 Official alerts, C2 Physical weather radar, C3 Perceptual hash (pHash) against historical archives to catch recycled fakes, C4 Location, C5 Multi-source.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
              <span>3. Mapping Agent</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Applies DBSCAN spatio-temporal clustering within 5km radius & 60min window. Calculates geographic polygon impact buffers and renders MapLibre GL layers.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Filter Event Stream:</span>
            {["all", "Ingestion", "Verification", "Mapping", "Ranking"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedAgentFilter(filter)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  selectedAgentFilter === filter
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-500 hover:text-slate-300"
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

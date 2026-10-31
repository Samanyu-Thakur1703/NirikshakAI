import React from "react";
import {
  Radio,
  ShieldCheck,
  Copy,
  Clock,
  AlertOctagon,
  ArrowRight,
  Filter,
  Layers,
  MapPin,
  ExternalLink,
  Zap,
} from "lucide-react";
import { StatCard } from "../components/common/StatCard";
import { DisasterMap } from "../components/map/DisasterMap";
import { PriorityAlerts } from "../components/common/PriorityAlerts";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "../components/common/Badge";
import { AI_AGENTS } from "../data/agentData";
import { AgentStatusCard } from "../components/agents/AgentStatusCard";
import { formatTimeAgo } from "../utils/formatters";

export function OverviewPage({
  stats,
  reports = [],
  filteredReports = [],
  priorityAlerts = [],
  selectedIncident,
  onSelectIncident,
  onNavigateTo,
  onOpenIngestConsole,
}) {
  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards with Teal, Gold, and Orange Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Signal Inflow"
          value={stats.total}
          subtext="Multi-channel telemetry streams"
          trend="+18% this hour"
          icon={Radio}
          accentColor="teal"
          badgeText="Active Inflow"
          badgeColor="teal"
          onClick={() => onNavigateTo("reports")}
        />

        <StatCard
          title="Verified Intelligence"
          value={stats.verified}
          subtext={`${stats.verificationRate}% cross-source consensus`}
          trend="C1-C5 Corroborated"
          icon={ShieldCheck}
          accentColor="gold"
          badgeText="Official Consensus"
          badgeColor="gold"
          onClick={() => onNavigateTo("reports")}
        />

        <StatCard
          title="GIS De-Duplications"
          value={stats.duplicate}
          subtext={`${stats.duplicateRate}% redundancy merged`}
          trend="DBSCAN Spatio-temporal"
          icon={Copy}
          accentColor="teal"
          badgeText="Merged Clusters"
          badgeColor="teal"
          onClick={() => onNavigateTo("queue")}
        />

        <StatCard
          title="Under Verification"
          value={stats.pending}
          subtext={`${stats.critical || 0} Critical priority dispatches`}
          trend="Forensic inspection"
          icon={Clock}
          accentColor="orange"
          badgeText={`${stats.critical || 0} Urgent`}
          badgeColor="orange"
          onClick={() => onNavigateTo("queue")}
        />
      </div>

      {/* 2. Main Disaster Map (The Core Visual Element) */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-4.5 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              Live India Incident Map & Multi-Hazard GIS Clusters
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time multi-hazard GIS mapping, severity-scaled markers, and cluster radius visualization
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenIngestConsole && (
              <button
                onClick={onOpenIngestConsole}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-semibold border border-teal-500/40 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                Ingest Real Feeds
              </button>
            )}

            <button
              onClick={() => onNavigateTo("map")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1A26] hover:bg-[#142333] text-slate-200 text-xs font-semibold border border-teal-900/50 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              Expanded GIS Console
            </button>
          </div>
        </div>

        <DisasterMap
          incidents={reports}
          selectedIncident={selectedIncident}
          onSelectIncident={onSelectIncident}
        />
      </div>

      {/* 3. Priority Alerts & Agent Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Alerts (High & Critical) styled with Electric Orange accents */}
        <div className="lg:col-span-2">
          <PriorityAlerts
            alerts={priorityAlerts}
            onSelectIncident={onSelectIncident}
          />
        </div>

        {/* AI Agents Quick Status styled with Teal & Champagne Gold */}
        <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-teal-900/30 mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Autonomous AI Multi-Agent Mesh
              </h3>
              <button
                onClick={() => onNavigateTo("agents")}
                className="text-amber-300 hover:text-amber-200 text-xs flex items-center gap-1 font-semibold cursor-pointer"
              >
                Inspect All
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </button>
            </div>

            <div className="space-y-2.5">
              {AI_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => onNavigateTo("agents")}
                  className="p-3 rounded-xl bg-[#060D17]/80 border border-teal-900/40 hover:border-teal-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                      {agent.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-teal-300 capitalize bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-800/60">
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>{agent.throughput}</span>
                    <span className="text-amber-300 font-semibold">{agent.acceptedRate} pass</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-900/30 flex items-center justify-between text-[11px] text-slate-400">
            <span>Throughput: 530 records/sec</span>
            <span className="text-amber-300 font-mono font-semibold">CAP 1.2 Ready</span>
          </div>
        </div>
      </div>

      {/* 4. Live Incident Feed Snapshot */}
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
              Recent Incidents Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live incoming official alerts & crowd dispatches across India
            </p>
          </div>

          <button
            onClick={() => onNavigateTo("reports")}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 cursor-pointer"
          >
            View Complete Feed ({reports.length} Reports)
            <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#060D17]/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-teal-900/40">
              <tr>
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Disaster</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-900/20 font-sans">
              {reports.slice(0, 7).map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectIncident(item)}
                  className="hover:bg-teal-950/30 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-[11px] text-teal-400 font-semibold">
                    {item.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-[200px]">
                    📍 {item.location}
                  </td>
                  <td className="py-2.5 px-3">
                    <SeverityBadge severity={item.severity} size="xs" />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={item.status} size="xs" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-300 font-semibold text-[11px]">
                    {Math.round(item.confidenceScore * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {formatTimeAgo(item.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-teal-400 hover:text-teal-300 text-xs font-semibold">Inspect →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

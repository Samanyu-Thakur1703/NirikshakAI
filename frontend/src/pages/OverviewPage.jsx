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
}) {
  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Signal Inflow"
          value={stats.total}
          subtext="Crowdsourced & official feeds"
          trend="+14% this hour"
          icon={Radio}
          accentColor="cyan"
          badgeText="Active Inflow"
          badgeColor="blue"
          onClick={() => onNavigateTo("reports")}
        />

        <StatCard
          title="Verified Disasters"
          value={stats.verified}
          subtext={`${stats.verificationRate}% corroboration rate`}
          trend="5-Pillar pass"
          icon={ShieldCheck}
          accentColor="emerald"
          badgeText="Corroborated"
          badgeColor="emerald"
          onClick={() => onNavigateTo("reports")}
        />

        <StatCard
          title="GIS Deduplications"
          value={stats.duplicate}
          subtext={`${stats.duplicateRate}% redundancy identified`}
          trend="DBSCAN Clustered"
          icon={Copy}
          accentColor="purple"
          badgeText="Merged Pairs"
          badgeColor="blue"
          onClick={() => onNavigateTo("queue")}
        />

        <StatCard
          title="Pending Verification"
          value={stats.pending}
          subtext="Awaiting secondary checks"
          trend="Review queue"
          icon={Clock}
          accentColor="amber"
          badgeText={`${stats.critical} Critical`}
          badgeColor="amber"
          onClick={() => onNavigateTo("queue")}
        />
      </div>

      {/* 2. Main Disaster Map (The Core Visual Element) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              Live India Incident Map & Spatial Clusters
            </h3>
            <p className="text-xs text-slate-400">
              Real-time multi-hazard GIS mapping, severity-scaled markers, and cluster radius visualization
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTo("map")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
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
        {/* Priority Alerts (High & Critical) */}
        <div className="lg:col-span-2">
          <PriorityAlerts
            alerts={priorityAlerts}
            onSelectIncident={onSelectIncident}
          />
        </div>

        {/* AI Agents Quick Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Autonomous AI Pipeline
              </h3>
              <button
                onClick={() => onNavigateTo("agents")}
                className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 font-medium"
              >
                Inspect All
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {AI_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => onNavigateTo("agents")}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{agent.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 capitalize bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{agent.throughput}</span>
                    <span className="text-emerald-400">{agent.acceptedRate} pass</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pipeline Throughput: 530/sec</span>
            <span className="text-cyan-400 font-mono">CAP 1.2 Ready</span>
          </div>
        </div>
      </div>

      {/* 4. Live Incident Feed Snapshot */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              Recent Incidents Stream
            </h3>
            <p className="text-xs text-slate-400">Latest incoming crowd & official reports across India</p>
          </div>

          <button
            onClick={() => onNavigateTo("reports")}
            className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            View Complete Feed ({reports.length} Reports)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {reports.slice(0, 7).map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectIncident(item)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-400 font-medium">
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
                  <td className="py-2.5 px-3 font-mono text-emerald-400 text-[11px]">
                    {Math.round(item.confidenceScore * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {formatTimeAgo(item.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-cyan-400 hover:text-cyan-300 text-xs font-medium">Inspect →</span>
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

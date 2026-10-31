import React from "react";
import {
  Radio,
  ShieldCheck,
  Copy,
  Clock,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";
import { StatCard } from "../components/common/StatCard";
import { DisasterMap } from "../components/map/DisasterMap";
import { PriorityAlerts } from "../components/common/PriorityAlerts";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "../components/common/Badge";
import { AI_AGENTS } from "../data/agentData";
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
    <div className="space-y-4">
      {/* 1. Operational Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Signal Inflow"
          value={stats.total}
          subtext="Multi-channel telemetry streams"
          trend="+18% / hour"
          icon={Radio}
          badgeText="Active Feeds"
          badgeColor="primary"
          onClick={() => onNavigateTo("reports")}
        />

        <StatCard
          title="Verified Intelligence"
          value={stats.verified}
          subtext={`${stats.verificationRate}% cross-source consensus`}
          trend="C1-C5 Corroborated"
          icon={ShieldCheck}
          badgeText="Consensus Pass"
          badgeColor="primary"
          onClick={() => onNavigateTo("reports")}
        />

        <StatCard
          title="GIS De-Duplications"
          value={stats.duplicate}
          subtext={`${stats.duplicateRate}% redundancy merged`}
          trend="DBSCAN Spatio-temporal"
          icon={Copy}
          badgeText="Merged Clusters"
          badgeColor="secondary"
          onClick={() => onNavigateTo("queue")}
        />

        <StatCard
          title="Under Verification"
          value={stats.pending}
          subtext={`${stats.critical || 0} Critical priority dispatches`}
          trend="Forensic inspection"
          icon={Clock}
          badgeText={`${stats.critical || 0} Urgent`}
          badgeColor="warning"
          onClick={() => onNavigateTo("queue")}
        />
      </div>

      {/* 2. Main Disaster Map (Core Visual Element) */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-[#252C2A] flex items-center gap-2 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#183D35]" />
              India Disaster Map & Geospatial Intelligence
            </h3>
            <p className="text-xs text-[#737D78] mt-0.5">
              Multi-hazard GIS monitoring, severity-scaled markers, and district cluster visualization
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenIngestConsole && (
              <button
                onClick={onOpenIngestConsole}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#F3F4F0] text-[#183D35] text-xs font-medium border border-[#E1E5E0] transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#D98236]" />
                Ingest Real Feeds
              </button>
            )}

            <button
              onClick={() => onNavigateTo("map")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#183D35] hover:bg-[#214D43] text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Alerts */}
        <div className="lg:col-span-2">
          <PriorityAlerts
            alerts={priorityAlerts}
            onSelectIncident={onSelectIncident}
          />
        </div>

        {/* AI Agents Quick Status */}
        <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E1E5E0] mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#252C2A] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#183D35]" />
                Multi-Agent Pipeline Core
              </h3>
              <button
                onClick={() => onNavigateTo("agents")}
                className="text-xs text-[#183D35] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                Inspect All
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {AI_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => onNavigateTo("agents")}
                  className="p-2.5 rounded bg-[#F8F9F7] border border-[#E1E5E0] hover:border-[#183D35] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-[#252C2A] group-hover:text-[#183D35] transition-colors">
                      {agent.name}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-[#183D35] capitalize bg-[#183D35]/10 px-1.5 py-0.2 rounded border border-[#183D35]/25">
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#737D78] font-mono mt-1">
                    <span>{agent.throughput}</span>
                    <span className="text-[#183D35] font-semibold">{agent.acceptedRate} pass</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E1E5E0] flex items-center justify-between text-[11px] text-[#737D78]">
            <span>Throughput: ~530 rec/s</span>
            <span className="text-[#183D35] font-mono font-semibold">CAP 1.2 Protocol Ready</span>
          </div>
        </div>
      </div>

      {/* 4. Live Incident Feed Snapshot */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E0] rounded p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-[#252C2A] flex items-center gap-2 uppercase tracking-wide">
              <Radio className="w-3.5 h-3.5 text-[#183D35]" />
              Recent Incidents Stream
            </h3>
            <p className="text-xs text-[#737D78] mt-0.5">
              Live incoming official alerts & crowdsourced reports across India
            </p>
          </div>

          <button
            onClick={() => onNavigateTo("reports")}
            className="flex items-center gap-1 text-xs font-medium text-[#183D35] hover:underline cursor-pointer"
          >
            View Complete Feed ({reports.length} Reports)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#252C2A]">
            <thead className="bg-[#F8F9F7] text-[11px] uppercase tracking-wider text-[#737D78] border-b border-[#E1E5E0]">
              <tr>
                <th className="py-2 px-3 font-semibold">Report ID</th>
                <th className="py-2 px-3 font-semibold">Hazard</th>
                <th className="py-2 px-3 font-semibold">Location</th>
                <th className="py-2 px-3 font-semibold">Severity</th>
                <th className="py-2 px-3 font-semibold">Status</th>
                <th className="py-2 px-3 font-semibold">Confidence</th>
                <th className="py-2 px-3 font-semibold">Time</th>
                <th className="py-2 px-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E5E0]">
              {reports.slice(0, 7).map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectIncident(item)}
                  className="hover:bg-[#F8F9F7] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#183D35] font-semibold">
                    {item.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <DisasterTypeBadge type={item.disasterType} size="xs" />
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#252C2A] truncate max-w-[200px]">
                    📍 {item.location}
                  </td>
                  <td className="py-2.5 px-3">
                    <SeverityBadge severity={item.severity} size="xs" />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={item.status} size="xs" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#183D35] font-semibold text-[11px]">
                    {Math.round((item.confidenceScore || 0.85) * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-[#737D78] text-[11px]">
                    {formatTimeAgo(item.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[#183D35] hover:underline text-xs font-medium">Inspect →</span>
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

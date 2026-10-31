import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Radio,
  Clock,
  Activity,
  Layers,
} from "lucide-react";
import { DISASTER_COLORS } from "../data/mockDisasters";

export function AnalyticsPage({ reports = [], stats }) {
  // 1. Hourly Trend Simulation Data
  const hourlyData = [
    { time: "00:00", inflow: 18, verified: 12, duplicates: 4 },
    { time: "02:00", inflow: 22, verified: 15, duplicates: 6 },
    { time: "04:00", inflow: 34, verified: 26, duplicates: 7 },
    { time: "06:00", inflow: 78, verified: 55, duplicates: 19 },
    { time: "08:00", inflow: 112, verified: 84, duplicates: 24 },
    { time: "10:00", inflow: 95, verified: 72, duplicates: 18 },
    { time: "12:00", inflow: 68, verified: 51, duplicates: 14 },
    { time: "14:00", inflow: 82, verified: 63, duplicates: 16 },
    { time: "16:00", inflow: 64, verified: 49, duplicates: 12 },
    { time: "18:00", inflow: 45, verified: 36, duplicates: 8 },
  ];

  // 2. Hazard Distribution from actual current reports
  const hazardData = Object.entries(stats.byType || {}).map(([type, count]) => ({
    name: DISASTER_COLORS[type]?.label || type,
    value: count,
    color: DISASTER_COLORS[type]?.hex || "#38bdf8",
  }));

  // 3. Status Breakdown
  const statusData = [
    { name: "Verified", count: stats.verified, color: "#10b981" },
    { name: "Duplicates", count: stats.duplicate, color: "#6366f1" },
    { name: "Pending", count: stats.pending, color: "#f59e0b" },
    { name: "Flagged Hoax", count: stats.flagged, color: "#f43f5e" },
  ];

  // 4. Source Platform Breakdown
  const sourceCounts = {};
  reports.forEach((r) => {
    const src = r.source?.platform || "other";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const sourceData = Object.entries(sourceCounts).map(([src, count]) => ({
    platform: src.replace("_", " ").toUpperCase(),
    reports: count,
  }));

  // 5. Agent Latency & Efficiency
  const agentBenchmark = [
    { agent: "Ingestion", latency: 115, throughput: 142 },
    { agent: "Verification", latency: 380, throughput: 98 },
    { agent: "Mapping", latency: 65, throughput: 180 },
    { agent: "Ranking", latency: 140, throughput: 110 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Disaster Intelligence & Agent Telemetry Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Real-time analytics across signal ingestion, cross-verification confidence, deduplication efficiency, and agent response latency
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Window: Past 24 Hours</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Live Synced</span>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Incident Inflow vs Verified Timeline */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                24h Signal Inflow vs. Verified Incidents
              </h3>
              <p className="text-[11px] text-slate-400">Total raw signals ingested vs corroborated alerts</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Hourly Aggregate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Raw Signals"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInflow)"
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  name="Verified Incidents"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerified)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Hazard Type Breakdown Donut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Disaster Hazard Classification
              </h3>
              <p className="text-[11px] text-slate-400">Distribution across active emergency categories</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {reports.length} Incidents
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hazardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hazardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0f17" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Verification & Deduplication Pipeline Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Pipeline Verification Status
              </h3>
              <p className="text-[11px] text-slate-400">Corroborated, deduplicated, and flagged hoaxes</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {stats.verificationRate}% Pass Rate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reports" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Agent Latency Benchmarks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Agent Latency Benchmarks (ms)
              </h3>
              <p className="text-[11px] text-slate-400">Response time per processing stage</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Avg 175ms
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentBenchmark} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} unit="ms" />
                <YAxis dataKey="agent" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="latency" name="Latency (ms)" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

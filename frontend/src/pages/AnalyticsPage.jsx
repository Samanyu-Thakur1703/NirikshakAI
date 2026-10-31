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
  Zap,
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
    color: DISASTER_COLORS[type]?.hex || "#2dd4bf",
  }));

  // 3. Status Breakdown with Teal, Champagne Gold, and Electric Orange
  const statusData = [
    { name: "Verified Intelligence", count: stats.verified, color: "#d4af37" },
    { name: "De-duplicated", count: stats.duplicate, color: "#2dd4bf" },
    { name: "Under Review", count: stats.pending, color: "#0d9488" },
    { name: "Rejected / Hoaxes", count: stats.flagged, color: "#ff5f1f" },
  ];

  // 4. Source Platform Breakdown
  const sourceCounts = {};
  reports.forEach((r) => {
    const src = r.sourceMeta?.name || r.source?.platform || "other";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const sourceData = Object.entries(sourceCounts).map(([src, count]) => ({
    platform: src.toUpperCase(),
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
        <div className="bg-[#0A121D] border border-teal-500/40 p-3 rounded-xl shadow-2xl text-xs font-mono">
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
      <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Disaster Intelligence & Agent Telemetry Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics across signal ingestion, cross-verification confidence, deduplication efficiency, and agent response latency
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Window: Past 24 Hours</span>
          <span className="text-teal-700">•</span>
          <span className="text-amber-300 font-bold">Live Synced</span>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Incident Inflow vs Verified Timeline */}
        <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                24h Signal Inflow vs. Verified Incidents
              </h3>
              <p className="text-[11px] text-slate-400">Total raw signals ingested vs corroborated alerts</p>
            </div>
            <span className="text-[10px] font-mono text-teal-300 bg-[#060D17] px-2.5 py-0.5 rounded-full border border-teal-900/40 font-semibold">
              Hourly Aggregate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#132738" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Raw Signals Inflow"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInflow)"
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  name="Verified Alerts"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerified)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Operational Lanes Breakdown */}
        <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Operational Pipeline Status Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">Distribution across 3-lane verification architecture</p>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-[#060D17] px-2.5 py-0.5 rounded-full border border-teal-900/40 font-semibold">
              Active Records
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#132738" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Hazard Distribution */}
        <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Multi-Hazard Incidence Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Breakdown by extreme weather disaster category</p>
            </div>
            <span className="text-[10px] font-mono text-teal-300 bg-[#060D17] px-2.5 py-0.5 rounded-full border border-teal-900/40 font-semibold">
              GIS Categorization
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hazardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  fontSize={10}
                >
                  {hazardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Agent Performance & Latency Benchmark */}
        <div className="bg-[#0A111A]/95 border border-teal-900/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Autonomous Multi-Agent Latency Benchmarks
              </h3>
              <p className="text-[11px] text-slate-400">Average execution processing latency in milliseconds</p>
            </div>
            <span className="text-[10px] font-mono text-teal-300 bg-[#060D17] px-2.5 py-0.5 rounded-full border border-teal-900/40 font-semibold">
              Benchmark (ms)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentBenchmark} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#132738" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="agent" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="latency" name="Latency (ms)" fill="#2dd4bf" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

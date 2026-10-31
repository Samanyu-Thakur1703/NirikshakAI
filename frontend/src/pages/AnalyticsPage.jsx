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
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
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
    color: DISASTER_COLORS[type]?.hex || "#38BDF8",
  }));

  // 3. Status Breakdown with Command Palette
  const statusData = [
    { name: "Verified", count: stats.verified, color: "#10B981" },
    { name: "De-duplicated", count: stats.duplicate, color: "#38BDF8" },
    { name: "Review Lane", count: stats.pending, color: "#F59E0B" },
    { name: "Rejected", count: stats.flagged, color: "#EF4444" },
  ];

  // 4. Agent Latency & Efficiency
  const agentBenchmark = [
    { agent: "Ingestion", latency: 115, throughput: 142 },
    { agent: "Verification", latency: 380, throughput: 98 },
    { agent: "Mapping", latency: 65, throughput: 180 },
    { agent: "Ranking", latency: 140, throughput: 110 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0E1526] border border-[#1E293B] p-2.5 rounded-lg shadow-xl text-xs font-mono text-white">
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
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
            Readiness Index & Telemetry Analytics
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Operational analytics across signal ingestion, cross-verification consensus, deduplication, and agent latency
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <span>Window: Past 24 Hours</span>
          <span className="text-[#334155]">•</span>
          <span className="text-[#10B981] font-semibold">Live Synced</span>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 1. Incident Inflow vs Verified Timeline */}
        <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Signal Inflow vs. Verified Incidents
              </h3>
              <p className="text-[11px] text-[#94A3B8]">Raw signals ingested vs corroborated alerts</p>
            </div>
            <span className="text-[10px] font-mono text-[#38BDF8] bg-[#0E1526] px-2 py-0.5 rounded border border-[#1E293B]">
              Hourly Aggregate
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Raw Signals Inflow"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInflow)"
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  name="Verified Alerts"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerified)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Operational Lanes Breakdown */}
        <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Operational Pipeline Status Breakdown
              </h3>
              <p className="text-[11px] text-[#94A3B8]">Distribution across 3-lane verification architecture</p>
            </div>
            <span className="text-[10px] font-mono text-[#F59E0B] bg-[#0E1526] px-2 py-0.5 rounded border border-[#1E293B]">
              Active Records
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Hazard Distribution */}
        <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Multi-Hazard Incidence Distribution
              </h3>
              <p className="text-[11px] text-[#94A3B8]">Breakdown by extreme weather disaster category</p>
            </div>
            <span className="text-[10px] font-mono text-[#38BDF8] bg-[#0E1526] px-2 py-0.5 rounded border border-[#1E293B]">
              GIS Categorization
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hazardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
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
        <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Agent Execution Latency Benchmarks
              </h3>
              <p className="text-[11px] text-[#94A3B8]">Average processing latency in milliseconds</p>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] bg-[#0E1526] px-2 py-0.5 rounded border border-[#1E293B]">
              Benchmark (ms)
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentBenchmark} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="agent" type="category" stroke="#64748B" fontSize={11} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="latency" name="Latency (ms)" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Waves,
  Flame,
  Plus,
  Bell,
  Radio,
  Clock,
  Maximize2,
  AlertTriangle,
  CloudRain,
  Wind,
  Thermometer,
  Mountain,
  Zap,
  Users,
  Send,
  Sparkles,
  Bot,
  Activity,
  HeartPulse,
  Truck,
  Car,
  ChevronRight,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { DisasterMap } from "../components/map/DisasterMap";
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
  // Command Center Mode: "normal" | "disaster" | "evacuation"
  const [commandMode, setCommandMode] = useState("disaster");
  const [currentTime, setCurrentTime] = useState("");
  const [ewsActive, setEwsActive] = useState(false);
  const [dispatchedUnits, setDispatchedUnits] = useState({
    avail: 3,
    deployed: 5,
  });
  const [dispatchAlertMsg, setDispatchAlertMsg] = useState(null);

  // Live real-time ticking clock (e.g. "11:42:59 AM")
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Map mock incidents into the exact layout seen in reference screenshot:
  // Flood, Fire, Medical, Landslide, Accident
  const incidentCards = [
    {
      id: "INC-01",
      hazard: "Flood",
      location: "Brgy. San Roque",
      time: "10m",
      status: "Responding",
      statusColor: "bg-[#2563EB] text-white",
      units: "2 units",
      icon: Waves,
      iconColor: "text-[#3B82F6] bg-[#1E3A8A]/30 border-[#2563EB]/40",
      rawIncident: reports.find((r) => r.disasterType === "flood") || reports[0],
    },
    {
      id: "INC-02",
      hazard: "Fire",
      location: "Brgy. Tetuan",
      time: "18m",
      status: "On Scene",
      statusColor: "bg-[#F59E0B] text-slate-950 font-bold",
      units: "3 units",
      icon: Flame,
      iconColor: "text-[#EF4444] bg-[#7F1D1D]/30 border-[#EF4444]/40",
      rawIncident: reports.find((r) => r.disasterType === "extreme_temperature") || reports[1] || reports[0],
    },
    {
      id: "INC-03",
      hazard: "Medical",
      location: "Brgy. Zone III",
      time: "25m",
      status: "Responding",
      statusColor: "bg-[#2563EB] text-white",
      units: "1 units",
      icon: HeartPulse,
      iconColor: "text-[#F59E0B] bg-[#78350F]/30 border-[#F59E0B]/40",
      rawIncident: reports.find((r) => r.disasterType === "earthquake") || reports[2] || reports[0],
    },
    {
      id: "INC-04",
      hazard: "Landslide",
      location: "Brgy. Pasonanca",
      time: "32m",
      status: "New",
      statusColor: "bg-[#EF4444] text-white font-bold",
      units: null,
      icon: Mountain,
      iconColor: "text-[#F97316] bg-[#7C2D12]/30 border-[#F97316]/40",
      rawIncident: reports.find((r) => r.disasterType === "landslide") || reports[3] || reports[0],
    },
    {
      id: "INC-05",
      hazard: "Accident",
      location: "Brgy. Canelar",
      time: "45m",
      status: "Validated",
      statusColor: "bg-[#334155] text-slate-200",
      units: "1 units",
      icon: Car,
      iconColor: "text-[#EAB308] bg-[#713F12]/30 border-[#EAB308]/40",
      rawIncident: reports.find((r) => r.disasterType === "cyclone") || reports[4] || reports[0],
    },
  ];

  // Responders data (from screenshot)
  const [responders, setResponders] = useState([
    { id: "r1", name: "Rescue Alpha", code: "R", status: "deployed", badge: "bg-[#2563EB] text-white" },
    { id: "r2", name: "Rescue Bravo", code: "R", status: "available", badge: "bg-[#10B981] text-slate-950 font-bold" },
    { id: "r3", name: "Fire Truck 1", code: "F", status: "on-scene", badge: "bg-[#F59E0B] text-slate-950 font-bold" },
    { id: "r4", name: "Fire Truck 2", code: "F", status: "deployed", badge: "bg-[#2563EB] text-white" },
  ]);

  const handleDispatchNearest = () => {
    // Find first available unit and deploy it
    const availIdx = responders.findIndex((r) => r.status === "available");
    if (availIdx !== -1) {
      const updated = [...responders];
      updated[availIdx] = {
        ...updated[availIdx],
        status: "deployed",
        badge: "bg-[#2563EB] text-white",
      };
      setResponders(updated);
      setDispatchedUnits((prev) => ({
        avail: Math.max(0, prev.avail - 1),
        deployed: prev.deployed + 1,
      }));
      setDispatchAlertMsg(`Dispatched ${updated[availIdx].name} to nearest active hazard.`);
      setTimeout(() => setDispatchAlertMsg(null), 3500);
    } else {
      setDispatchAlertMsg("All frontline responder units are currently deployed.");
      setTimeout(() => setDispatchAlertMsg(null), 3000);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 1. Top Unified Command Action Header (Exact layout from reference screenshot) */}
      <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
        {/* Left: Title & Mode Selector */}
        <div className="flex items-center gap-3">
          <h2 className="text-base font-extrabold text-white tracking-tight">Unified Command</h2>

          {/* Mode Selector Segmented Pills */}
          <div className="flex items-center bg-[#111827] border border-[#1E293B] rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setCommandMode("normal")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                commandMode === "normal"
                  ? "bg-[#2563EB] text-white font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setCommandMode("disaster")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                commandMode === "disaster"
                  ? "bg-[#DC2626] text-white font-bold shadow-sm"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Disaster
            </button>
            <button
              onClick={() => setCommandMode("evacuation")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                commandMode === "evacuation"
                  ? "bg-[#F59E0B] text-slate-950 font-bold shadow-sm"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Evacuation
            </button>
          </div>
        </div>

        {/* Right: Operational Actions & Clock */}
        <div className="flex items-center gap-2">
          {/* Add Incident Button */}
          <button
            onClick={onOpenIngestConsole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#334155] text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Incident</span>
          </button>

          {/* Send Alert Button */}
          <button
            onClick={() => onSelectIncident(reports[0] || null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#334155] text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Send Alert</span>
          </button>

          {/* Activate EWS (Emergency Warning System) - Red Button */}
          <button
            onClick={() => setEwsActive(!ewsActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
              ewsActive
                ? "bg-[#B91C1C] text-white animate-pulse border border-red-500"
                : "bg-[#DC2626] hover:bg-[#EF4444] text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{ewsActive ? "EWS ACTIVE" : "Activate EWS"}</span>
          </button>

          {/* Live Clock Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E293B] text-xs font-mono font-medium text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            <span>{currentTime || "11:42:59 AM"}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Emergency Warning System Active Banner */}
      {ewsActive && (
        <div className="bg-[#7F1D1D]/90 border border-[#EF4444] text-white px-4 py-2 rounded-lg text-xs flex items-center justify-between shadow-lg animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] animate-pulse" />
            <span className="font-bold uppercase tracking-wider">EARLY WARNING BROADCAST ACTIVE:</span>
            <span>All emergency responder channels locked to priority evacuation protocol. NDMA SACHET alert broadcasted.</span>
          </div>
          <button
            onClick={() => setEwsActive(false)}
            className="text-xs font-bold text-red-200 hover:text-white underline cursor-pointer"
          >
            Stand Down
          </button>
        </div>
      )}

      {/* Dispatch feedback toast */}
      {dispatchAlertMsg && (
        <div className="bg-[#064E3B] border border-[#10B981] text-emerald-100 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-lg animate-fade-in shrink-0">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{dispatchAlertMsg}</span>
        </div>
      )}

      {/* 2. Tactical 3-Column Command Grid (Exact Layout from Reference Screenshot) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px] overflow-hidden">
        {/* ======================================================== */}
        {/* COLUMN 1: Active Incidents (Left - ~3 columns)           */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 bg-[#0B101B] border border-[#1E293B] rounded-xl flex flex-col overflow-hidden shadow-md">
          {/* Header */}
          <div className="p-3 border-b border-[#1E293B] flex items-center justify-between bg-[#0E1526]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <h3 className="text-xs font-bold text-white tracking-wide">Active Incidents</h3>
            </div>
            <span className="px-2 py-0.2 rounded-full text-[11px] font-mono font-bold bg-[#7F1D1D]/40 text-[#EF4444] border border-[#EF4444]/40">
              5
            </span>
          </div>

          {/* Incidents List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {incidentCards.map((card) => {
              const Icon = card.icon;
              const isSelected = selectedIncident && selectedIncident.id === card.rawIncident?.id;

              return (
                <div
                  key={card.id}
                  onClick={() => onSelectIncident(card.rawIncident)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-[#131D31] border-[#38BDF8] shadow-md shadow-blue-950/40"
                      : "bg-[#0E1526] border-[#1E293B] hover:border-[#334155] hover:bg-[#121B2E]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {/* Hazard Icon */}
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors leading-tight">
                          {card.hazard}
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">{card.location}</p>
                      </div>
                    </div>

                    {/* Elapsed Time */}
                    <span className="text-[10px] font-mono text-[#64748B] shrink-0">{card.time}</span>
                  </div>

                  {/* Status Pill and Units Footer */}
                  <div className="mt-2.5 pt-2 border-t border-[#1E293B]/80 flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium leading-none ${card.statusColor}`}>
                      {card.status}
                    </span>

                    {card.units && (
                      <span className="text-[10px] text-[#64748B] font-mono font-medium">
                        {card.units}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: Center - Aerial Satellite GIS Map (~6 columns) */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 bg-[#0B101B] border border-[#1E293B] rounded-xl overflow-hidden shadow-md flex flex-col relative min-h-[460px]">
          <DisasterMap
            incidents={reports}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
            fullHeight={true}
          />
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: Right - Intelligence & Responders (~3 columns) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-2.5 overflow-y-auto">
          {/* Card A: Weather & Hazard Intelligence */}
          <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-3 shadow-md space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <CloudRain className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Weather & Hazard Intelligence</span>
            </div>

            {/* 2-Column Grid of 6 Dark Tiles */}
            <div className="grid grid-cols-2 gap-1.5 text-xs font-sans">
              {/* Rainfall */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-0.5">
                <span className="text-[9.5px] text-[#94A3B8] block">Rainfall</span>
                <span className="text-xs font-bold font-mono text-white block">12.5 mm/hr</span>
                <span className="text-[9px] text-[#64748B] block truncate">Heavy in 23 min</span>
              </div>

              {/* Flood Risk */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-0.5">
                <span className="text-[9.5px] text-[#94A3B8] block">Flood Risk</span>
                <span className="text-xs font-bold font-mono text-white block">Level 2</span>
                <span className="text-[9px] text-[#38BDF8] block truncate">Rising</span>
              </div>

              {/* Wind Gust */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-0.5">
                <span className="text-[9.5px] text-[#94A3B8] block">Wind Gust</span>
                <span className="text-xs font-bold font-mono text-white block">45 km/h</span>
                <span className="text-[9px] text-[#64748B] block truncate">Steady</span>
              </div>

              {/* Heat Index */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-0.5">
                <span className="text-[9.5px] text-[#94A3B8] block">Heat index</span>
                <span className="text-xs font-bold font-mono text-white block">34°C</span>
                <span className="text-[9px] text-[#F59E0B] block truncate">High</span>
              </div>

              {/* Landslide */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-0.5">
                <span className="text-[9.5px] text-[#94A3B8] block">Landslide</span>
                <span className="text-xs font-bold font-mono text-white block">Moderate</span>
                <span className="text-[9px] text-[#64748B] block truncate">Soil saturated</span>
              </div>

              {/* Storm Cell */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-0.5">
                <span className="text-[9.5px] text-[#94A3B8] block">Storm Cell</span>
                <span className="text-xs font-bold font-mono text-white block">15 km</span>
                <span className="text-[9px] text-[#EF4444] block truncate">Approaching</span>
              </div>
            </div>
          </div>

          {/* Card B: Responders */}
          <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-3 shadow-md space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Responders</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-[#10B981] font-semibold">{dispatchedUnits.avail} avail</span>
                <span className="text-[#38BDF8] font-semibold">{dispatchedUnits.deployed} deployed</span>
              </div>
            </div>

            {/* Units List */}
            <div className="space-y-1.5 text-xs">
              {responders.map((r) => (
                <div
                  key={r.id}
                  className="p-1.5 rounded-lg bg-[#0E1526] border border-[#1E293B] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#1E293B] text-[9.5px] font-bold text-[#94A3B8] flex items-center justify-center font-mono">
                      {r.code}
                    </span>
                    <span className="text-xs font-medium text-slate-200">{r.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-medium uppercase font-mono ${r.badge}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Dispatch Nearest Button - Green Accent */}
            <button
              onClick={handleDispatchNearest}
              className="w-full py-2 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Nearest</span>
            </button>
          </div>

          {/* Card C: AI Recommendations */}
          <div className="bg-[#0B101B] border border-[#1E293B] rounded-xl p-3 shadow-md space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Bot className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>AI Recommendations</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Rec 1 */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-1">
                <p className="text-[11px] text-slate-300 leading-snug">
                  Recommend evacuation for Brgy. San Roque coastal areas within 1 hour
                </p>
                <button
                  onClick={() => {
                    setEwsActive(true);
                  }}
                  className="text-[10.5px] text-[#38BDF8] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>&gt; Issue Alert</span>
                </button>
              </div>

              {/* Rec 2 */}
              <div className="p-2 rounded-lg bg-[#0E1526] border border-[#1E293B] space-y-1">
                <p className="text-[11px] text-slate-300 leading-snug">
                  Dispatch RESCUE-2 to Pasonanca landslide (nearest unit, ETA 8 min)
                </p>
                <button
                  onClick={handleDispatchNearest}
                  className="text-[10.5px] text-[#10B981] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>&gt; Dispatch Unit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

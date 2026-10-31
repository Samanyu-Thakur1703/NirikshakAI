import React from "react";
import { AlertCircle, Activity, Sparkles } from "lucide-react";

export function SimulatedBanner({ isSimulatingLive, onToggleSimulation, onInjectReport }) {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-semibold text-cyan-400 tracking-wide uppercase text-[11px]">
          Simulation & Demonstration Environment
        </span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-400 hidden md:inline">
          Telemetry & reports shown are synthetic scenario records for hackathon demonstration. Not real-time emergency orders.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
            isSimulatingLive
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
          }`}
          title="Toggle periodic simulated report streaming"
        >
          <Activity className={`w-3.5 h-3.5 ${isSimulatingLive ? "animate-spin text-emerald-400" : ""}`} />
          {isSimulatingLive ? "Live Simulation: ACTIVE" : "Live Simulation: OFF"}
        </button>

        <button
          onClick={onInjectReport}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/80 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          + Inject Influx Report
        </button>
      </div>
    </div>
  );
}

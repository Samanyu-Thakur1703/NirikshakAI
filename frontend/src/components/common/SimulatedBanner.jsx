import React from "react";
import {
  AlertTriangle,
  Activity,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Zap,
  Radio,
} from "lucide-react";

export function SimulatedBanner({
  isBackendConnected = false,
  backendError = null,
  isRefreshing = false,
  isIngesting = false,
  onRefresh,
  isSimulatingLive,
  onToggleSimulation,
  onTriggerIngest,
  onOpenIngestConsole,
}) {
  return (
    <div
      className={`border-b px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 backdrop-blur-md transition-colors ${
        isBackendConnected
          ? "bg-[#060D17]/95 border-teal-900/40 text-slate-300"
          : "bg-[#160E08]/95 border-amber-900/60 text-amber-200"
      }`}
    >
      {/* Left: Backend Status */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {isBackendConnected ? (
          <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-teal-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <Wifi className="w-3 h-3 text-teal-400" />
            <span className="font-semibold">FastAPI Agent Core Live</span>
            <span className="text-teal-700 hidden sm:inline">•</span>
            <span className="text-amber-300/90 hidden sm:inline font-semibold">Port 8000</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-amber-300">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Backend Disconnected</span>
            <span className="text-amber-500/60">•</span>
            <span className="text-amber-300/80">Offline Fallback Active</span>
          </div>
        )}

        <span className="text-slate-600 hidden md:inline">|</span>

        <span className="text-[11px] text-slate-400 hidden lg:inline">
          {isBackendConnected
            ? "Live ingestion active: IMD Mausam district warnings, NASA GIBS radar, GDELT & Bluesky feeds."
            : "Backend unreachable at port 8000. Verified synthetic dataset active for complete demonstration."}
        </span>
      </div>

      {/* Right: Actions with Teal & Champagne Gold styling */}
      <div className="flex items-center gap-2">
        {/* Refresh / Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#0A131F] text-slate-200 border border-teal-900/50 hover:border-teal-500/50 disabled:opacity-50 transition-colors cursor-pointer"
          title="Refresh backend records"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-teal-400" : "text-teal-400"}`} />
          <span>{isRefreshing ? "Syncing..." : "Sync Feeds"}</span>
        </button>

        {/* Live Ingestion Console Trigger */}
        <button
          onClick={onOpenIngestConsole || onTriggerIngest}
          disabled={isIngesting}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Configure & trigger real-world multi-channel ingestion"
        >
          {isIngesting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Polling IMD & Satellite...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Real-World Ingest Console</span>
            </>
          )}
        </button>

        {/* Continuous Stream Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            isSimulatingLive
              ? "bg-[#431407]/90 text-orange-300 border border-orange-500/60 shadow-sm"
              : "bg-[#0A131F] text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
          title="Toggle automated periodic telemetry polling"
        >
          <Activity className={`w-3.5 h-3.5 ${isSimulatingLive ? "animate-pulse text-[#ff5f1f]" : ""}`} />
          <span>{isSimulatingLive ? "Auto-Patrol: ON" : "Auto-Patrol: OFF"}</span>
        </button>
      </div>
    </div>
  );
}

import React from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Zap,
  Activity,
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
    <div className="bg-[#0B101B] border-b border-[#1E293B] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2.5 shrink-0">
      {/* Left: Operational Link Status */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {isBackendConnected ? (
          <div className="flex items-center gap-1.5 bg-[#10B981]/15 border border-[#10B981]/30 px-2 py-0.5 rounded text-[11px] font-mono text-[#10B981] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
            <Wifi className="w-3 h-3 text-[#10B981]" />
            <span>FastAPI Agent Core Live</span>
            <span className="text-[#334155]">•</span>
            <span className="text-slate-300">Port 8000</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#F59E0B]/15 border border-[#F59E0B]/30 px-2 py-0.5 rounded text-[11px] font-mono text-[#F59E0B] font-medium">
            <WifiOff className="w-3 h-3 text-[#F59E0B]" />
            <span>Backend Disconnected</span>
            <span className="text-[#F59E0B]/60">•</span>
            <span>Offline Backup Active</span>
          </div>
        )}

        <span className="text-[#1E293B] hidden md:inline">|</span>

        <span className="text-[11px] text-[#94A3B8] hidden lg:inline">
          {isBackendConnected
            ? "Live operational telemetry: IMD Mausam district warnings, NASA GIBS radar, GDELT & verified ground feeds."
            : "Emergency backup mode: local geospatial dataset active for inspection and simulation."}
        </span>
      </div>

      {/* Right: Operational Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] disabled:opacity-50 transition-colors cursor-pointer text-xs"
          title="Refresh backend records"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#38BDF8]" : "text-[#94A3B8]"}`} />
          <span>{isRefreshing ? "Syncing..." : "Sync Feeds"}</span>
        </button>

        <button
          onClick={onOpenIngestConsole || onTriggerIngest}
          disabled={isIngesting}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-50 transition-colors cursor-pointer text-xs font-medium"
          title="Open real-world multi-channel ingestion console"
        >
          {isIngesting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-white" />
              <span>Polling Feeds...</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-[#FDE047]" />
              <span>Ingestion Console</span>
            </>
          )}
        </button>

        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
            isSimulatingLive
              ? "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50"
              : "bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-white"
          }`}
          title="Toggle automated periodic telemetry polling"
        >
          <Activity className="w-3 h-3" />
          <span>{isSimulatingLive ? "Auto-Patrol: Active" : "Auto-Patrol: Standby"}</span>
        </button>
      </div>
    </div>
  );
}

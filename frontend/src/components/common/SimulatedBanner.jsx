import React from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Zap,
  Activity,
  Layers,
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
    <div className="bg-[#FFFFFF] border-b border-[#E1E5E0] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
      {/* Left: Operational Link Status */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {isBackendConnected ? (
          <div className="flex items-center gap-1.5 bg-[#183D35]/10 border border-[#183D35]/25 px-2 py-0.5 rounded text-[11px] font-mono text-[#183D35] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#183D35] inline-block animate-pulse"></span>
            <Wifi className="w-3 h-3 text-[#183D35]" />
            <span>FastAPI Core Connected</span>
            <span className="text-[#397568]/60">•</span>
            <span>Port 8000</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#D98236]/10 border border-[#D98236]/30 px-2 py-0.5 rounded text-[11px] font-mono text-[#D98236] font-medium">
            <WifiOff className="w-3 h-3 text-[#D98236]" />
            <span>Backend Disconnected</span>
            <span className="text-[#D98236]/60">•</span>
            <span>Offline Fallback Active</span>
          </div>
        )}

        <span className="text-[#E1E5E0] hidden md:inline">|</span>

        <span className="text-[11px] text-[#737D78] hidden lg:inline">
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
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#FFFFFF] text-[#252C2A] border border-[#E1E5E0] hover:bg-[#F3F4F0] disabled:opacity-50 transition-colors cursor-pointer"
          title="Refresh backend records"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#183D35]" : "text-[#737D78]"}`} />
          <span>{isRefreshing ? "Syncing..." : "Sync Feeds"}</span>
        </button>

        <button
          onClick={onOpenIngestConsole || onTriggerIngest}
          disabled={isIngesting}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#183D35] text-white hover:bg-[#214D43] disabled:opacity-50 transition-colors cursor-pointer"
          title="Open real-world multi-channel ingestion console"
        >
          {isIngesting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-white" />
              <span>Polling IMD & Radar...</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Ingestion Console</span>
            </>
          )}
        </button>

        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
            isSimulatingLive
              ? "bg-[#397568] text-white border-[#397568]"
              : "bg-[#FFFFFF] text-[#737D78] border-[#E1E5E0] hover:bg-[#F3F4F0] hover:text-[#252C2A]"
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

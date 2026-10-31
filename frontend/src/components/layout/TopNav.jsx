import React from "react";
import {
  Search,
  Bell,
  Radio,
  Shield,
  User,
  Menu,
  Activity,
  Globe,
  RefreshCw,
} from "lucide-react";

export function TopNav({
  activePage,
  pageTitles = {},
  searchQuery,
  setSearchQuery,
  criticalCount = 0,
  onOpenMobileMenu,
}) {
  const currentTitle = pageTitles[activePage] || "Disaster Intelligence Command Center";

  return (
    <header className="h-16 bg-[#080C15]/95 border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            {currentTitle}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 hidden sm:flex">
            <span>India Disaster Management System</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">CAP 1.2 Compliant</span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md hidden lg:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports, locations, hazards, tags, or report IDs..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px] font-mono px-1 bg-slate-800 rounded"
            >
              ESC
            </button>
          )}
        </div>
      </div>

      {/* Right: Telemetry Status, Live Monitoring & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Status Indicators */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-medium">LIVE MONITORING</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-mono text-slate-400">EOC ACTIVE</span>
        </div>

        {/* Priority Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={`${criticalCount} Critical Incidents`}
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[10px] font-mono text-white rounded-full flex items-center justify-center font-bold">
                {criticalCount}
              </span>
            )}
          </button>
        </div>

        {/* User / Officer Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-cyan-400/30">
            ND
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Cmdr. Harshdeep S.</div>
            <div className="text-[10px] text-cyan-400 font-mono">Disaster Ops Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
}

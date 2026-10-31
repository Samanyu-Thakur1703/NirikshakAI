import React, { useState } from "react";
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
  LogOut,
  LogIn,
  UserPlus,
  Wifi,
  WifiOff,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function TopNav({
  activePage,
  pageTitles = {},
  searchQuery,
  setSearchQuery,
  criticalCount = 0,
  isBackendConnected = false,
  onOpenMobileMenu,
  onNavigateToAuth,
  onOpenIngestConsole,
}) {
  const currentTitle = pageTitles[activePage] || "Disaster Intelligence Command Center";
  const { user, isAuthenticated, signOut, isDemoAuth } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-[#070C13]/95 border-b border-teal-900/30 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            {currentTitle}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 hidden sm:flex">
            <span className="text-slate-300 font-medium">India Disaster Management System</span>
            <span className="text-teal-600">•</span>
            <span className="text-amber-300 font-mono font-semibold">CAP 1.2 Compliant</span>
            <span className="text-teal-600">•</span>
            <span className="text-teal-400 font-mono">IMD & NASA Satellite Verified</span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar with Teal accents */}
      <div className="flex-1 max-w-md hidden lg:block">
        <div className="relative">
          <Search className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports, coordinates, IMD alerts, GDELT news, hazards..."
            className="w-full bg-[#0A121D] border border-teal-900/40 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 rounded cursor-pointer"
            >
              ESC
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Telemetry Status & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Live Ingestion Console Trigger Button */}
        {onOpenIngestConsole && (
          <button
            onClick={onOpenIngestConsole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 via-teal-300 to-amber-300 hover:from-teal-300 hover:to-amber-200 transition-all shadow-md shadow-teal-950/40 cursor-pointer active:scale-95"
            title="Open Real-World Ingestion Console"
          >
            <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span className="hidden sm:inline">Ingest Feeds</span>
          </button>
        )}

        {/* API Backend Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border bg-[#0B131E] border-teal-900/40">
          {isBackendConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-300 font-semibold">API LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-300 font-semibold">OFFLINE FALLBACK</span>
            </>
          )}
        </div>

        {/* Priority Notifications in Electric Orange */}
        <div className="relative">
          <button
            className="p-2 rounded-xl bg-[#0A121D] border border-teal-900/40 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={`${criticalCount} Critical Incidents`}
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff5f1f] text-[10px] font-mono text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-orange-900/50 animate-pulse">
                {criticalCount}
              </span>
            )}
          </button>
        </div>

        {/* User / Officer Profile with Dropdown */}
        <div className="relative">
          {isAuthenticated && user ? (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2 border-l border-teal-900/30 text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-amber-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md border border-teal-300/40 group-hover:border-amber-300 transition-colors">
                {user.name?.slice(0, 2).toUpperCase() || "OP"}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight group-hover:text-teal-300 transition-colors">
                  {user.name}
                </div>
                <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                  <span>{user.role || "Analyst"}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-teal-900/30">
              <button
                onClick={() => onNavigateToAuth?.("signin")}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigateToAuth?.("signup")}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer"
              >
                Register
              </button>
            </div>
          )}

          {/* Profile Dropdown Menu */}
          {showProfileMenu && isAuthenticated && user && (
            <div className="absolute right-0 top-12 w-64 bg-[#0B131E] border border-teal-500/30 rounded-2xl shadow-2xl p-3.5 z-50 text-xs space-y-2 backdrop-blur-md">
              <div className="pb-2 border-b border-slate-800">
                <span className="font-bold text-white block text-sm">{user.name}</span>
                <span className="text-[11px] text-slate-400 font-mono block">{user.email}</span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono font-semibold">
                    Role: {user.role || "Analyst"}
                  </span>
                  {isDemoAuth && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                      Demo Mode
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateToAuth?.("signup");
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-teal-950/40 text-slate-300 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                  <span>Register Another Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateToAuth?.("signin");
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-teal-950/40 text-slate-300 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch Operator Station</span>
                </button>

                <button
                  onClick={() => {
                    signOut();
                    setShowProfileMenu(false);
                    onNavigateToAuth?.("signin");
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-800 mt-1 pt-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

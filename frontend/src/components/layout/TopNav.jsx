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
  const currentTitle = pageTitles[activePage] || "Geospatial Intelligence Operations";
  const { user, isAuthenticated, signOut, isDemoAuth } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-[#E1E5E0] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile trigger & Hierarchy Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-1 rounded text-[#737D78] hover:text-[#252C2A] hover:bg-[#F3F4F0] md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-[#737D78] font-medium uppercase tracking-wider hidden sm:flex">
            <span>DisasterWatch EOC</span>
            <span>/</span>
            <span>India Command</span>
            <span>/</span>
            <span className="text-[#397568] font-semibold">{currentTitle}</span>
          </div>
          <h2 className="text-sm font-bold text-[#252C2A] tracking-tight truncate leading-tight">
            {currentTitle}
          </h2>
        </div>
      </div>

      {/* Center: Functional Search Bar */}
      <div className="flex-1 max-w-sm hidden lg:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#737D78] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, district, hazard, coordinates..."
            className="w-full bg-[#F8F9F7] border border-[#E1E5E0] rounded pl-8.5 pr-3 py-1.5 text-xs text-[#252C2A] placeholder-[#737D78] focus:outline-none focus:border-[#397568] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737D78] hover:text-[#252C2A] text-[10px] font-mono px-1 bg-[#E1E5E0] rounded cursor-pointer"
            >
              ESC
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Telemetry Status & Station User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Real-World Ingestion Console Button */}
        {onOpenIngestConsole && (
          <button
            onClick={onOpenIngestConsole}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold text-white bg-[#183D35] hover:bg-[#122E28] transition-colors cursor-pointer shadow-xs"
            title="Configure real-world ingestion sources"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ingest Feeds</span>
          </button>
        )}

        {/* Backend Connection Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-medium border bg-[#F8F9F7] border-[#E1E5E0]">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? "bg-[#397568]" : "bg-[#D98236]"
            }`}
          />
          <span className={isBackendConnected ? "text-[#183D35]" : "text-[#D98236]"}>
            {isBackendConnected ? "FEED ONLINE" : "OFFLINE FALLBACK"}
          </span>
        </div>

        {/* Priority Notifications */}
        <div className="relative">
          <button
            className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              criticalCount > 0
                ? "bg-[#FBF0F0] text-[#C94C4C] border-[#F4CECE] hover:bg-[#F8E2E2]"
                : "bg-[#F8F9F7] text-[#737D78] border-[#E1E5E0] hover:text-[#252C2A]"
            }`}
            title={`${criticalCount} Critical Incidents`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono font-bold">{criticalCount}</span>
          </button>
        </div>

        {/* Operator Profile */}
        <div className="relative border-l border-[#E1E5E0] pl-3">
          {isAuthenticated && user ? (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded bg-[#EBF2F0] border border-[#C5DCD6] flex items-center justify-center text-[#183D35] font-bold text-[11px]">
                {user.name?.slice(0, 2).toUpperCase() || "OP"}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-[#252C2A] leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#737D78] font-mono">
                  {user.role || "Analyst"}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#737D78] hidden md:block" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToAuth?.("signin")}
                className="px-2.5 py-1 text-xs font-medium rounded border border-[#E1E5E0] hover:bg-[#F3F4F0] text-[#252C2A] cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Profile Dropdown Menu */}
          {showProfileMenu && isAuthenticated && user && (
            <div className="absolute right-0 top-10 w-56 bg-white border border-[#E1E5E0] rounded-md shadow-lg p-2.5 z-50 text-xs space-y-1.5">
              <div className="pb-2 border-b border-[#E1E5E0]">
                <span className="font-semibold text-[#252C2A] block">{user.name}</span>
                <span className="text-[11px] text-[#737D78] font-mono block truncate">{user.email}</span>
                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-[#EBF2F0] text-[#183D35] font-mono">
                  {user.role || "Analyst"}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigateToAuth?.("signup");
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F8F9F7] text-[#252C2A] flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#737D78]" />
                <span>New Operator</span>
              </button>

              <button
                onClick={() => {
                  signOut();
                  setShowProfileMenu(false);
                  onNavigateToAuth?.("signin");
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#FBF0F0] text-[#C94C4C] flex items-center gap-2 cursor-pointer border-t border-[#E1E5E0] pt-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>End Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

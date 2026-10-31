import React from "react";
import {
  Search,
  Bell,
  Sun,
  User,
  Menu,
  Shield,
  Radio,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function TopNav({
  activePage,
  pageTitles = {},
  searchQuery,
  setSearchQuery,
  criticalCount = 0,
  isBackendConnected = true,
  onOpenMobileMenu,
  onNavigateToAuth,
  onOpenIngestConsole,
}) {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <header className="h-14 bg-[#0B101B] border-b border-[#1E293B] px-4 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (From Reference Screenshot) */}
        <div className="relative w-64 sm:w-80 md:w-96">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts, locations, responders..."
            className="w-full bg-[#111827] border border-[#1E293B] hover:border-[#334155] focus:border-[#38BDF8] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-[#64748B] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Notifications, Sun/Moon, Avatar */}
      <div className="flex items-center gap-3">
        {/* Rapid Ingest Console Button */}
        {onOpenIngestConsole && (
          <button
            onClick={onOpenIngestConsole}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-[#334155] text-xs font-medium transition-colors cursor-pointer"
            title="Real-World Ingestion Console (IMD, NASA, Bluesky)"
          >
            <Zap className="w-3 h-3 text-[#F59E0B]" />
            <span className="text-[11px]">Ingest Feeds</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors">
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
          )}
        </div>

        {/* Theme Mode Toggle (Visual) */}
        <button
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          title="Theme Toggle"
        >
          <Sun className="w-4 h-4 text-[#F59E0B]" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1E293B]">
          <div
            onClick={() => onNavigateToAuth?.("signin")}
            className="w-7 h-7 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:border-[#38BDF8] transition-colors"
            title={isAuthenticated ? user?.name : "Sign In"}
          >
            {isAuthenticated && user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <User className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

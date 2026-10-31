import React from "react";
import {
  LayoutDashboard,
  Radio,
  Map,
  ShieldCheck,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  Zap,
  UserCheck,
} from "lucide-react";

export function Sidebar({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  pendingCount = 0,
}) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "reports", label: "Live Reports", icon: Radio, badge: "Live" },
    { id: "map", label: "Incident Map", icon: Map },
    {
      id: "queue",
      label: "Verification Queue",
      icon: ShieldCheck,
      count: pendingCount,
      countColor: "bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold",
    },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "agents", label: "AI Agents", icon: Bot, badge: "4 Active" },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "signin", label: "Operator Station", icon: UserCheck, badge: "Auth" },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#060A0F] border-r border-teal-900/30 transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-teal-900/30 bg-[#080D14]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-amber-500 flex items-center justify-center shadow-lg shadow-teal-900/40 shrink-0 border border-teal-300/40">
            <ShieldAlert className="w-5 h-5 text-slate-950" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                DisasterWatch <span className="text-teal-400 font-mono text-xs">AI</span>
              </h1>
              <p className="text-[10px] text-amber-300/80 font-medium tracking-wide truncate">
                Command Intelligence
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-teal-400" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? "bg-teal-500/15 text-teal-300 border-l-2 border-teal-400 border-y border-r border-teal-500/30 shadow-md shadow-teal-950/60"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/70"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-teal-300" : "text-slate-400 group-hover:text-teal-400"
                }`}
              />

              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>

                  {item.count > 0 && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.countColor}`}>
                      {item.count}
                    </span>
                  )}

                  {item.badge && (
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/60">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Pill at bottom */}
      <div className="p-3 border-t border-teal-900/30 bg-[#070D14]">
        {!isCollapsed ? (
          <div className="bg-[#0B121C] rounded-xl p-2.5 border border-teal-900/40 text-[11px] shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Pipeline Active
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300">4/4 Online</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              IMD Mausam • NASA GIBS • GDELT
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="4 Agents Online">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}

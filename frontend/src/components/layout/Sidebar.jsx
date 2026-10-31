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
      countColor: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "agents", label: "AI Agents", icon: Bot, badge: "4 Active" },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#070B13] border-r border-slate-800/90 transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/90">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0 border border-cyan-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                DisasterWatch <span className="text-cyan-400 font-mono text-xs">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 truncate">GIS & Verification Engine</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />

              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>

                  {item.count > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${item.countColor}`}>
                      {item.count}
                    </span>
                  )}

                  {item.badge && (
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
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
      <div className="p-3 border-t border-slate-800/90 bg-[#060910]">
        {!isCollapsed ? (
          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pipeline Active
              </span>
              <span className="text-[10px] font-mono text-cyan-400">4/4 Online</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              NDMA SACHET • Open-Meteo • GDACS
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="4 Agents Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}

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
  Shield,
  Layers,
  UserCheck,
} from "lucide-react";

export function Sidebar({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  pendingCount = 0,
}) {
  const mainNavItems = [
    { id: "overview", label: "Operations Overview", icon: LayoutDashboard },
    { id: "reports", label: "Live Telemetry Feed", icon: Radio, badge: "Live" },
    { id: "map", label: "GIS Geospatial Map", icon: Map },
    {
      id: "queue",
      label: "Verification Workbench",
      icon: ShieldCheck,
      count: pendingCount,
    },
    { id: "analytics", label: "Incident Analytics", icon: BarChart3 },
    { id: "agents", label: "AI Pipeline Engine", icon: Bot, badge: "4 Active" },
  ];

  const adminNavItems = [
    { id: "settings", label: "System Protocols", icon: Settings },
    { id: "signin", label: "Operator Station", icon: UserCheck },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#183D35] text-white transition-all duration-200 z-30 shrink-0 select-none border-r border-[#122E28] ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[#214D43]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded bg-[#214D43] border border-[#2D6659] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-xs font-bold tracking-tight text-white uppercase flex items-center gap-1 truncate">
                DisasterWatch <span className="text-[#A2B7B1] font-mono text-[10px]">AI</span>
              </h1>
              <p className="text-[10px] text-[#A2B7B1] tracking-wider truncate uppercase">
                Geospatial EOC
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-[#A2B7B1] hover:text-white hover:bg-[#214D43] transition-colors hidden md:block cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {/* Section 1: Operations */}
        <div>
          {!isCollapsed && (
            <div className="px-2 pb-1.5 text-[9px] font-bold text-[#A2B7B1] uppercase tracking-wider">
              Operations
            </div>
          )}
          <nav className="space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors group cursor-pointer ${
                    isActive
                      ? "bg-[#214D43] text-white shadow-xs"
                      : "text-[#D2DDD9] hover:text-white hover:bg-[#1E483F]"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#A2B7B1] group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>

                      {item.count > 0 && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#D98236] text-white">
                          {item.count}
                        </span>
                      )}

                      {item.badge && (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#214D43] text-[#A2B7B1] border border-[#2D6659]">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Administration */}
        <div>
          {!isCollapsed && (
            <div className="px-2 pb-1.5 text-[9px] font-bold text-[#A2B7B1] uppercase tracking-wider">
              Administration
            </div>
          )}
          <nav className="space-y-0.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors group cursor-pointer ${
                    isActive
                      ? "bg-[#214D43] text-white"
                      : "text-[#D2DDD9] hover:text-white hover:bg-[#1E483F]"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#A2B7B1] group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Operational Station Status Footer */}
      <div className="p-2.5 border-t border-[#214D43] bg-[#14332C]">
        {!isCollapsed ? (
          <div className="text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[#A2B7B1]">
              <span className="flex items-center gap-1.5 font-medium text-white text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
                TELEMETRY ACTIVE
              </span>
              <span className="font-mono text-[10px] text-[#A2B7B1]">v2.4-EOC</span>
            </div>
            <div className="text-[10px] text-[#A2B7B1] font-mono truncate">
              SACHET • IMD • GIBS
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Telemetry Active">
            <span className="w-2 h-2 rounded-full bg-[#52B788]" />
          </div>
        )}
      </div>
    </aside>
  );
}

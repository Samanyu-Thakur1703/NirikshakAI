import React from "react";
import {
  Bell,
  Activity,
  LayoutGrid,
  Users,
  FileText,
  HeartHandshake,
  Send,
  Radio,
  PhoneCall,
  MessageSquare,
  Megaphone,
  Clock,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bot,
  Search,
} from "lucide-react";

export function Sidebar({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  pendingCount = 0,
}) {
  const categories = [
    {
      title: "PRE-DISASTER",
      items: [
        { id: "early_warning", label: "Early Warning", icon: Bell },
        { id: "readiness", label: "Readiness Index", icon: Activity },
      ],
    },
    {
      title: "DURING CRISIS",
      items: [
        { id: "unified_command", label: "Unified Command", icon: LayoutGrid },
        { id: "responders", label: "Responders", icon: Users },
      ],
    },
    {
      title: "POST-DISASTER",
      items: [
        { id: "damage_reports", label: "Damage Reports", icon: FileText },
        { id: "humanitarian_aid", label: "Humanitarian Aid", icon: HeartHandshake },
      ],
    },
    {
      title: "COMMUNICATIONS",
      items: [
        { id: "dispatch", label: "Dispatch", icon: Send },
        { id: "radio_comms", label: "Radio Comms", icon: Radio },
        { id: "call_center", label: "Call Center", icon: PhoneCall },
        { id: "messaging", label: "Messaging", icon: MessageSquare },
        { id: "broadcast", label: "Broadcast", icon: Megaphone },
        { id: "comm_logs", label: "Comm Logs", icon: Clock },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#0B101B] border-r border-[#1E293B] transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#1E293B] bg-[#090D17]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Emergency Shield Crest */}
          <div className="w-9 h-9 rounded-xl bg-[#DC2626]/20 border border-[#DC2626]/40 flex items-center justify-center shrink-0 shadow-sm">
            <Shield className="w-5 h-5 text-[#EF4444]" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-white">CrisisOps</span>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold">AI</span>
              </div>
              <p className="text-[8.5px] font-bold tracking-wider uppercase text-[#EF4444] leading-tight">
                Disaster Intelligence Platform
              </p>
              <p className="text-[8px] text-[#64748B] leading-none mt-0.5">by DisasterWatch / Graviton</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors hidden md:block cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#38BDF8]" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto overflow-x-hidden">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 text-[9px] font-bold tracking-widest uppercase text-[#475569]">
                {cat.title}
              </div>
            )}
            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activePage === item.id ||
                  (activePage === "overview" && item.id === "unified_command") ||
                  (activePage === "reports" && item.id === "damage_reports") ||
                  (activePage === "map" && item.id === "early_warning") ||
                  (activePage === "queue" && item.id === "dispatch") ||
                  (activePage === "analytics" && item.id === "readiness");

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "unified_command") setActivePage("overview");
                      else if (item.id === "damage_reports") setActivePage("reports");
                      else if (item.id === "early_warning") setActivePage("map");
                      else if (item.id === "dispatch") setActivePage("queue");
                      else if (item.id === "readiness") setActivePage("analytics");
                      else setActivePage(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-900/40 font-semibold"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#131D31]"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-[#64748B] group-hover:text-[#94A3B8]"
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left text-[11.5px]">{item.label}</span>
                    )}

                    {!isCollapsed && item.id === "dispatch" && pendingCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#EF4444] text-white">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status & Settings */}
      <div className="p-2.5 border-t border-[#1E293B] bg-[#090D17] space-y-1">
        <div
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#94A3B8] ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          {!isCollapsed && <span className="text-[11px] font-medium text-[#10B981]">System Operational</span>}
        </div>

        <button
          onClick={() => setActivePage("settings")}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-[#131D31] transition-colors cursor-pointer ${
            isCollapsed ? "justify-center" : ""
          } ${activePage === "settings" ? "bg-[#1E293B] text-white" : ""}`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 text-[#64748B]" />
          {!isCollapsed && <span className="text-[11.5px]">Settings</span>}
        </button>
      </div>
    </aside>
  );
}

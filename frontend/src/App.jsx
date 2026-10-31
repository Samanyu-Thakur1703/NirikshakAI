import React, { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNav } from "./components/layout/TopNav";
import { SimulatedBanner } from "./components/common/SimulatedBanner";
import { IncidentDetailModal } from "./components/common/IncidentDetailModal";
import { OverviewPage } from "./pages/OverviewPage";
import { LiveReportsPage } from "./pages/LiveReportsPage";
import { IncidentMapPage } from "./pages/IncidentMapPage";
import { VerificationQueuePage } from "./pages/VerificationQueuePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AiAgentsPage } from "./pages/AiAgentsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useDisasterData } from "./hooks/useDisasterData";
import { Radio, AlertCircle } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    reports,
    filteredReports,
    priorityAlerts,
    stats,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    selectedSeverity,
    setSelectedSeverity,
    selectedIncident,
    setSelectedIncident,
    isSimulatingLive,
    setIsSimulatingLive,
    liveStreamAlert,
    verifyReport,
    flagReport,
    mergeDuplicate,
    addSimulatedIncomingReport,
  } = useDisasterData();

  const pageTitles = {
    overview: "Disaster Intelligence Command Center",
    reports: "Live Incident Feed & Influx Stream",
    map: "GIS Operations & Spatial Clusters Map",
    queue: "Verification & Deduplication Workbench",
    analytics: "Incident Intelligence & Latency Analytics",
    agents: "Autonomous Multi-Agent Pipeline Console",
    settings: "System Configuration & Protocols",
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "overview":
        return (
          <OverviewPage
            stats={stats}
            reports={reports}
            filteredReports={filteredReports}
            priorityAlerts={priorityAlerts}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
            onNavigateTo={setActivePage}
          />
        );
      case "reports":
        return (
          <LiveReportsPage
            reports={reports}
            filteredReports={filteredReports}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
            onSelectIncident={setSelectedIncident}
            onVerify={verifyReport}
            onFlag={flagReport}
          />
        );
      case "map":
        return (
          <IncidentMapPage
            reports={reports}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
        );
      case "queue":
        return (
          <VerificationQueuePage
            reports={reports}
            onVerify={verifyReport}
            onFlag={flagReport}
            onMerge={mergeDuplicate}
            onSelectIncident={setSelectedIncident}
          />
        );
      case "analytics":
        return (
          <AnalyticsPage reports={reports} stats={stats} />
        );
      case "agents":
        return (
          <AiAgentsPage onTriggerSimulation={addSimulatedIncomingReport} />
        );
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <OverviewPage
            stats={stats}
            reports={reports}
            filteredReports={filteredReports}
            priorityAlerts={priorityAlerts}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
            onNavigateTo={setActivePage}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#070B13] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setIsMobileMenuOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingCount={stats.pending}
      />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              activePage={activePage}
              setActivePage={(page) => {
                setActivePage(page);
                setIsMobileMenuOpen(false);
              }}
              isCollapsed={false}
              setIsCollapsed={() => setIsMobileMenuOpen(false)}
              pendingCount={stats.pending}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          activePage={activePage}
          pageTitles={pageTitles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          criticalCount={stats.critical}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Clear Simulation & Influx Controls Banner */}
        <SimulatedBanner
          isSimulatingLive={isSimulatingLive}
          onToggleSimulation={() => setIsSimulatingLive(!isSimulatingLive)}
          onInjectReport={addSimulatedIncomingReport}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070B13]">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Influx Alert Notification */}
      {liveStreamAlert && (
        <div className="fixed bottom-5 right-5 z-50 bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
          <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Incoming Signal Intercepted:</span>
            <span>{liveStreamAlert}</span>
          </div>
        </div>
      )}

      {/* Incident Detail Modal / Forensic Dossier */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onVerify={verifyReport}
          onFlag={flagReport}
          onMerge={mergeDuplicate}
        />
      )}
    </div>
  );
}

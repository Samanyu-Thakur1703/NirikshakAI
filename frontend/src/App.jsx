import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNav } from "./components/layout/TopNav";
import { SimulatedBanner } from "./components/common/SimulatedBanner";
import { IncidentDetailModal } from "./components/common/IncidentDetailModal";
import { LiveIngestionModal } from "./components/common/LiveIngestionModal";
import { OverviewPage } from "./pages/OverviewPage";
import { LiveReportsPage } from "./pages/LiveReportsPage";
import { IncidentMapPage } from "./pages/IncidentMapPage";
import { VerificationQueuePage } from "./pages/VerificationQueuePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AiAgentsPage } from "./pages/AiAgentsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { useDisasterData } from "./hooks/useDisasterData";
import { Radio, AlertCircle, Zap } from "lucide-react";

function DashboardContent() {
  const [activePage, setActivePage] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  const {
    reports,
    filteredReports,
    priorityAlerts,
    rejectedReports,
    stats,
    isBackendConnected,
    backendError,
    isRefreshing,
    isIngesting,
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
    triggerLiveIngestion,
    refreshBackendData,
  } = useDisasterData();

  const pageTitles = {
    overview: "Disaster Intelligence Command Center",
    reports: "Live Incident Feed & Influx Stream",
    map: "GIS Operations & Spatial Clusters Map",
    queue: "Verification, Deduplication & Hoax Workbench",
    analytics: "Incident Intelligence & Latency Analytics",
    agents: "Autonomous Multi-Agent Pipeline Console",
    settings: "System Configuration & Protocols",
    signin: "Operator Sign In",
    signup: "Operator Registration",
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
            onOpenIngestConsole={() => setIsIngestModalOpen(true)}
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
            rejectedReports={rejectedReports}
            onSelectIncident={setSelectedIncident}
            onVerify={verifyReport}
            onFlag={flagReport}
            onMerge={mergeDuplicate}
          />
        );
      case "analytics":
        return <AnalyticsPage reports={reports} stats={stats} />;
      case "agents":
        return (
          <AiAgentsPage
            onTriggerAgent={(agentId) => {
              if (agentId === "ingestion") {
                setIsIngestModalOpen(true);
              } else {
                triggerLiveIngestion();
              }
            }}
          />
        );
      case "settings":
        return (
          <SettingsPage
            isBackendConnected={isBackendConnected}
            onRefresh={() => refreshBackendData(false)}
          />
        );
      case "signin":
        return <SignInPage onNavigate={setActivePage} />;
      case "signup":
        return <SignUpPage onNavigate={setActivePage} />;
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
            onOpenIngestConsole={() => setIsIngestModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#060A0F] text-slate-100 overflow-hidden font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#060A0F]">
        {/* Top Navigation */}
        <TopNav
          activePage={activePage}
          pageTitles={pageTitles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          criticalCount={stats.critical}
          isBackendConnected={isBackendConnected}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigateToAuth={(view) => setActivePage(view)}
          onOpenIngestConsole={() => setIsIngestModalOpen(true)}
        />

        {/* Clear Backend Connection & Simulation Status Banner */}
        <SimulatedBanner
          isBackendConnected={isBackendConnected}
          backendError={backendError}
          isRefreshing={isRefreshing}
          isIngesting={isIngesting}
          onRefresh={() => refreshBackendData(false)}
          isSimulatingLive={isSimulatingLive}
          onToggleSimulation={() => setIsSimulatingLive(!isSimulatingLive)}
          onTriggerIngest={triggerLiveIngestion}
          onOpenIngestConsole={() => setIsIngestModalOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#060A0F]">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Influx Alert Notification */}
      {liveStreamAlert && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#071520]/95 border border-teal-400/60 text-teal-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Real-World Influx:</span>
            <span>{liveStreamAlert}</span>
          </div>
        </div>
      )}

      {/* Real-World Ingestion Console Modal */}
      <LiveIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onTriggerIngestion={triggerLiveIngestion}
        isIngesting={isIngesting}
        backendConnected={isBackendConnected}
      />

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

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

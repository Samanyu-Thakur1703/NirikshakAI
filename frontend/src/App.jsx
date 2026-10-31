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
import { Zap } from "lucide-react";

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
    overview: "Unified Command",
    unified_command: "Unified Command",
    reports: "Damage Reports",
    damage_reports: "Damage Reports",
    map: "Early Warning & Incident Map",
    early_warning: "Early Warning & Incident Map",
    queue: "Dispatch & Verification Workbench",
    dispatch: "Dispatch & Verification Workbench",
    analytics: "Readiness Index & Analytics",
    readiness: "Readiness Index & Analytics",
    agents: "Autonomous Multi-Agent Pipeline Console",
    settings: "System Settings",
    signin: "Operator Sign In",
    signup: "Operator Registration",
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "overview":
      case "unified_command":
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
      case "damage_reports":
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
      case "early_warning":
        return (
          <IncidentMapPage
            reports={reports}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
        );
      case "queue":
      case "dispatch":
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
      case "readiness":
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
        return (
          <SignInPage
            onNavigateToSignUp={() => setActivePage("signup")}
            onLoginSuccess={() => setActivePage("overview")}
          />
        );
      case "signup":
        return (
          <SignUpPage
            onNavigateToSignIn={() => setActivePage("signin")}
            onSignUpSuccess={() => setActivePage("overview")}
          />
        );
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
    <div className="flex h-screen bg-[#090D16] text-slate-100 overflow-hidden font-sans selection:bg-[#2563EB]/40 selection:text-white">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#090D16]">
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

        {/* Operational Status Sub-Banner */}
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
        <main className="flex-1 overflow-y-auto p-3 bg-[#090D16]">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Influx Alert Notification */}
      {liveStreamAlert && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0F172A] border border-[#2563EB] text-slate-200 px-3.5 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 animate-fade-in">
          <Zap className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#38BDF8] block">Live Telemetry Influx:</span>
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

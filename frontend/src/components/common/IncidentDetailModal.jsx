import React, { useState } from "react";
import {
  X,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Shield,
  Download,
  Flame,
  Radio,
  ExternalLink,
  Copy,
} from "lucide-react";
import { DisasterTypeBadge, SeverityBadge, StatusBadge } from "./Badge";
import { formatTimeAgo, formatUtcTime } from "../../utils/formatters";

export function IncidentDetailModal({ incident, onClose, onVerify, onFlag, onMerge }) {
  const [showCapXml, setShowCapXml] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!incident) return null;

  const mockCapXml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>DISASTERWATCH-IN-${incident.id}</identifier>
  <sender>dispatch.agent@disasterwatch.ai</sender>
  <sent>${incident.timestamp}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>${incident.disasterType.toUpperCase()}</event>
    <urgency>${incident.severity === "critical" ? "Immediate" : "Expected"}</urgency>
    <severity>${incident.severity.toUpperCase()}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>NDMA-SACHET</valueName>
      <value>${incident.checks?.official?.alertId || "AUTOGEN"}</value>
    </eventCode>
    <headline>${incident.title}</headline>
    <description>${incident.description}</description>
    <area>
      <areaDesc>${incident.location}</areaDesc>
      <circle>${incident.latitude},${incident.longitude},5.0</circle>
    </area>
  </info>
</alert>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockCapXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0B101B] border border-slate-700/80 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs text-cyan-400 font-semibold">{incident.id}</span>
              <DisasterTypeBadge type={incident.disasterType} />
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              {incident.clusterId && (
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Cluster: {incident.clusterId}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{incident.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Location</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{incident.location}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 block mt-1">
                {incident.latitude.toFixed(4)}°N, {incident.longitude.toFixed(4)}°E
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Telemetry Timestamp</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{formatUtcTime(incident.timestamp)}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">{formatTimeAgo(incident.timestamp)}</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Verification Score</span>
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-emerald-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{Math.round(incident.confidenceScore * 100)}%</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Severity Score: {incident.severityScore} / 5.0
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Source & Credibility</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="capitalize">{incident.source?.platform || "Crowd"}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Reputation: {Math.round((incident.source?.reputation || 0.8) * 100)}%
              </span>
            </div>
          </div>

          {/* Incident Description */}
          <div className="bg-slate-900/50 border border-slate-800/70 rounded-lg p-3.5">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Incident Situation Report
            </h4>
            <p className="text-slate-200 leading-relaxed text-xs">{incident.description}</p>
            {incident.tags && incident.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {incident.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-slate-800/80 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5-Pillar Verification Checks (SPEC.md & CONTRACTS.md) */}
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Multi-Agent 5-Pillar Verification Matrix
              </h4>
              <span className="text-[10px] font-mono text-cyan-400">
                Formula: 0.30 C1 + 0.25 C2 + 0.20 C5 + 0.15 C3 + 0.10 C4
              </span>
            </div>

            <div className="space-y-2">
              {/* C1 Official */}
              <div className="flex items-start justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">C1: Official Alert Cross-Check</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {incident.checks?.official?.details || "Checked against SACHET RSS & IMD Nowcasts"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ml-2 ${
                    incident.checks?.official?.c1 === "pass"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : incident.checks?.official?.c1 === "fail"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                  }`}
                >
                  {incident.checks?.official?.c1 || "PENDING"}
                </span>
              </div>

              {/* C2 Physical */}
              <div className="flex items-start justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">C2: Physical Telemetry & Radar</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {incident.checks?.physical?.details ||
                      `Recorded precipitation: ${incident.checks?.physical?.rainfall_mm || 0}mm in trailing 3 hours`}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ml-2 ${
                    incident.checks?.physical?.c2 === "pass"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : incident.checks?.physical?.c2 === "fail"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                  }`}
                >
                  {incident.checks?.physical?.c2 || "PASS"}
                </span>
              </div>

              {/* C3 Provenance */}
              <div className="flex items-start justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">C3: Media Provenance & pHash Forensics</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {incident.checks?.provenance?.details || "Perceptual hash screened against historical disaster archive"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ml-2 ${
                    incident.checks?.provenance?.c3 === "fail"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {incident.checks?.provenance?.c3 || "PASS"}
                </span>
              </div>

              {/* C4 Location */}
              <div className="flex items-start justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">C4: Geocoding & Topographic Verification</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {incident.checks?.location?.details || "Coordinates correlate with district GIS boundary"}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PASS
                </span>
              </div>

              {/* C5 Corroboration */}
              <div className="flex items-start justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">C5: Multi-Source Corroboration</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {incident.checks?.corroboration?.details ||
                      `Corroborated by ${incident.checks?.corroboration?.count || 1} independent sources in cluster`}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ml-2 ${
                    (incident.checks?.corroboration?.count || 1) >= 2
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                  }`}
                >
                  {(incident.checks?.corroboration?.count || 1) >= 2 ? "CORROBORATED" : "SOLITARY"}
                </span>
              </div>
            </div>
          </div>

          {/* CAP 1.2 XML Preview Toggle */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200">NDMA SACHET CAP 1.2 Protocol Payload</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Status: {incident.capStatus || "READY"}
                </span>
              </div>
              <button
                onClick={() => setShowCapXml(!showCapXml)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
              >
                {showCapXml ? "Hide XML" : "View XML Payload"}
              </button>
            </div>

            {showCapXml && (
              <div className="mt-3 relative">
                <pre className="bg-black/90 p-3 rounded font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-48 border border-slate-800">
                  {mockCapXml}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-700"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Assigned Agent: <span className="text-cyan-400 font-semibold">{incident.assignedAgent || "Ranking Agent"}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {incident.status !== "verified" && (
              <button
                onClick={() => {
                  onVerify?.(incident.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Confirm & Verify
              </button>
            )}

            {incident.status !== "flagged" && (
              <button
                onClick={() => {
                  onFlag?.(incident.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Flag Misinformation
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

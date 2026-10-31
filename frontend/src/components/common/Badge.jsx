import React from "react";
import {
  Waves,
  Mountain,
  Wind,
  CloudRain,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { DISASTER_COLORS, SEVERITY_CONFIG, STATUS_CONFIG } from "../../data/mockDisasters";

export function DisasterTypeBadge({ type, size = "sm" }) {
  const config = DISASTER_COLORS[type] || {
    bg: "bg-[#F3F4F0]",
    border: "border-[#E1E5E0]",
    text: "text-[#737D78]",
    label: type || "Unknown",
  };

  const getIcon = () => {
    const iconClass = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";
    switch (type) {
      case "flood":
        return <Waves className={iconClass} />;
      case "landslide":
        return <Mountain className={iconClass} />;
      case "cyclone":
        return <Wind className={iconClass} />;
      case "heavy_rainfall":
        return <CloudRain className={iconClass} />;
      case "earthquake":
        return <Activity className={iconClass} />;
      case "extreme_temperature":
        return <Flame className={iconClass} />;
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const sizeClasses =
    size === "xs" ? "px-1.5 py-0.5 text-[10px]" : size === "lg" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium border ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      {getIcon()}
      <span className="capitalize">{config.label}</span>
    </span>
  );
}

export function SeverityBadge({ severity, size = "sm" }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  const sizeClasses =
    size === "xs" ? "px-1.5 py-0.5 text-[10px]" : size === "lg" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium border ${config.badge} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.pulse}`} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
}

export function StatusBadge({ status, size = "sm" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const sizeClasses =
    size === "xs" ? "px-1.5 py-0.5 text-[10px]" : size === "lg" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";

  const getIcon = () => {
    const iconClass = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";
    switch (status) {
      case "verified":
        return <CheckCircle2 className={iconClass} />;
      case "pending":
        return <Clock className={iconClass} />;
      case "duplicate":
        return <Copy className={iconClass} />;
      case "flagged":
        return <AlertTriangle className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium border ${config.badge} ${sizeClasses}`}
    >
      {getIcon()}
      <span>{config.label}</span>
    </span>
  );
}

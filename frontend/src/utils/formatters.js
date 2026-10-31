/**
 * DisasterWatch AI — Utility formatters & metric calculations
 */

export function formatTimeAgo(isoDate) {
  if (!isoDate) return "just now";
  const now = new Date("2026-10-31T09:30:00Z"); // fixed simulation reference
  const past = new Date(isoDate);
  const diffMs = Math.max(0, now - past);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function formatUtcTime(isoDate) {
  if (!isoDate) return "--:--";
  const d = new Date(isoDate);
  return d.toTimeString().substring(0, 5) + " UTC";
}

export function formatNumber(val) {
  if (val === undefined || val === null) return "0";
  return new Intl.NumberFormat("en-IN").format(val);
}

export function calculateDashboardStats(reports = []) {
  const total = reports.length;
  const verified = reports.filter((r) => r.status === "verified").length;
  const duplicate = reports.filter((r) => r.status === "duplicate").length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const flagged = reports.filter((r) => r.status === "flagged").length;
  const critical = reports.filter((r) => r.severity === "critical").length;
  const high = reports.filter((r) => r.severity === "high").length;

  const totalEvacuated = reports.reduce((acc, r) => acc + (r.casualties?.evacuated || 0), 0);
  const totalStranded = reports.reduce((acc, r) => acc + (r.casualties?.stranded || 0), 0);

  // Group by disaster type
  const byType = {};
  reports.forEach((r) => {
    byType[r.disasterType] = (byType[r.disasterType] || 0) + 1;
  });

  // Calculate verification rate
  const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0;
  const duplicateRate = total > 0 ? Math.round((duplicate / total) * 100) : 0;

  return {
    total,
    verified,
    duplicate,
    pending,
    flagged,
    critical,
    high,
    totalEvacuated,
    totalStranded,
    byType,
    verificationRate,
    duplicateRate,
  };
}

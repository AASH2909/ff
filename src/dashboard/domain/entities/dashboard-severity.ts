export const DASHBOARD_ALERT_SEVERITIES = [
  "information",
  "warning",
  "critical",
  "severe"
] as const;

export type DashboardAlertSeverity = (typeof DASHBOARD_ALERT_SEVERITIES)[number];

export function normalizeDashboardSeverity(value: string | null | undefined): DashboardAlertSeverity {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "severe") {
    return "severe";
  }

  if (normalized === "critical" || normalized === "high") {
    return "critical";
  }

  if (normalized === "warning" || normalized === "medium") {
    return "warning";
  }

  return "information";
}

export function compareDashboardSeverity(
  left: DashboardAlertSeverity,
  right: DashboardAlertSeverity
) {
  const rank: Record<DashboardAlertSeverity, number> = {
    information: 1,
    warning: 2,
    critical: 3,
    severe: 4
  };

  return rank[right] - rank[left];
}

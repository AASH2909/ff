export type DashboardStatusTone = "live" | "ready" | "rush" | "blocked" | "neutral";

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
  tone: DashboardStatusTone;
};

export type DashboardQueueStatus = {
  label: string;
  tone: DashboardStatusTone;
};

export type DashboardOverview = {
  metrics: DashboardMetric[];
  queueStatuses: DashboardQueueStatus[];
};

export interface DashboardRepository {
  getOverview(): Promise<DashboardOverview>;
}

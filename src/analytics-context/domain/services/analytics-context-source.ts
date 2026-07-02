import type { DashboardOverviewDto } from "@/dashboard/application";
import type { RecommendationDto } from "@/recommendation/application";
import type { ExecutiveSummaryDto } from "@/ai-summary/application";
import type { IncidentDto, NotificationDto } from "@/notification/application";

export type FraudInsightItem = {
  id: string;
  status: string;
  severity: string;
  riskScore: number;
  detectedAt: string;
  orderId: string | null;
  employeeId: string | null;
  locationId: string | null;
};

export type FraudInsights = {
  totalIncidents: number;
  criticalCount: number;
  averageRiskScore: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  recentIncidents: FraudInsightItem[];
};

export type AuditHighlight = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: string;
  actorType: string;
  userId: string;
  occurredAt: string;
};

export type AnalyticsContextSourceSnapshot = {
  tenantId: string;
  businessUnitId: string | null;
  generatedAt: Date;
  dashboardOverview: DashboardOverviewDto | null;
  recommendations: RecommendationDto[];
  executiveSummary: ExecutiveSummaryDto | null;
  notifications: NotificationDto[];
  incidents: IncidentDto[];
  fraudInsights: FraudInsights;
  auditHighlights: AuditHighlight[];
  sourceWarnings: string[];
};

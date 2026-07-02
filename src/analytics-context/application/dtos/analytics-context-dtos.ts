import type {
  AnalyticsContext,
  AnalyticsContextMetadata,
  AuditHighlight,
  FraudInsights
} from "@/analytics-context/domain";
import type { DashboardOverviewDto, ControlScoreDto } from "@/dashboard/application";
import type { RecommendationDto } from "@/recommendation/application";
import type { ExecutiveSummaryDto } from "@/ai-summary/application";
import type { IncidentDto, NotificationDto } from "@/notification/application";

export type AnalyticsContextScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type AnalyticsContextQueryDto = AnalyticsContextScopeDto & {
  limit?: number;
};

export type AnalyticsContextDto = {
  tenantId: string;
  businessUnitId: string | null;
  generatedAt: string;
  controlScore: ControlScoreDto | null;
  dashboardOverview: DashboardOverviewDto | null;
  recommendations: RecommendationDto[];
  executiveSummary: ExecutiveSummaryDto | null;
  notifications: NotificationDto[];
  incidents: IncidentDto[];
  fraudInsights: FraudInsights;
  auditHighlights: AuditHighlight[];
  metadata: AnalyticsContextMetadata;
};

export type AnalyticsContextOutputDto = {
  context: AnalyticsContextDto;
};

export function toAnalyticsContextDto(context: AnalyticsContext): AnalyticsContextDto {
  return {
    tenantId: context.tenantId,
    businessUnitId: context.businessUnitId,
    generatedAt: context.generatedAt.toISOString(),
    controlScore: context.controlScore,
    dashboardOverview: context.dashboardOverview,
    recommendations: context.recommendations,
    executiveSummary: context.executiveSummary,
    notifications: context.notifications,
    incidents: context.incidents,
    fraudInsights: context.fraudInsights,
    auditHighlights: context.auditHighlights,
    metadata: context.metadata
  };
}

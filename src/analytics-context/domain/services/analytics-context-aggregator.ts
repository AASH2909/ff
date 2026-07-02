import {
  AnalyticsContext,
  type AnalyticsContextMetadata
} from "@/analytics-context/domain/entities";
import type { AnalyticsContextSourceSnapshot } from "@/analytics-context/domain/services/analytics-context-source";

export class AnalyticsContextAggregator {
  aggregate(source: AnalyticsContextSourceSnapshot) {
    return new AnalyticsContext({
      tenantId: source.tenantId,
      businessUnitId: source.businessUnitId,
      generatedAt: source.generatedAt,
      controlScore: source.dashboardOverview?.currentControlScore ?? null,
      dashboardOverview: source.dashboardOverview,
      recommendations: source.recommendations,
      executiveSummary: source.executiveSummary,
      notifications: source.notifications,
      incidents: source.incidents,
      fraudInsights: source.fraudInsights,
      auditHighlights: source.auditHighlights,
      metadata: buildMetadata(source)
    });
  }
}

function buildMetadata(source: AnalyticsContextSourceSnapshot): AnalyticsContextMetadata {
  return {
    source: "analytics_context",
    sourceModules: [
      "dashboard",
      "recommendation",
      "ai_summary",
      "notification",
      "fraud",
      "audit"
    ],
    sourceWarnings: source.sourceWarnings,
    recommendationCount: source.recommendations.length,
    notificationCount: source.notifications.length,
    incidentCount: source.incidents.length,
    auditHighlightCount: source.auditHighlights.length,
    fraudIncidentCount: source.fraudInsights.totalIncidents
  };
}

import type { AuditRepository } from "@/audit";
import type { AuditRecord } from "@/audit/types";
import type { FraudRepository } from "@/fraud/ports/fraud-repository";
import type { FraudIncident } from "@/fraud/entities/fraud-incident";
import type { Result } from "@/application/result";
import type {
  GetDashboardOverviewUseCase
} from "@/dashboard/application";
import type {
  GetRecommendationsUseCase
} from "@/recommendation/application";
import type {
  GetLatestExecutiveSummaryUseCase
} from "@/ai-summary/application";
import type {
  GetIncidentsUseCase,
  GetNotificationsUseCase
} from "@/notification/application";
import type {
  AnalyticsContextReadQuery,
  AnalyticsContextSourceRepository
} from "@/analytics-context/application";
import type {
  AnalyticsContextSourceSnapshot,
  AuditHighlight,
  FraudInsightItem,
  FraudInsights
} from "@/analytics-context/domain";

export type ModuleAnalyticsContextSourceRepositoryDependencies = {
  getDashboardOverviewUseCase: GetDashboardOverviewUseCase;
  getRecommendationsUseCase: GetRecommendationsUseCase;
  getLatestExecutiveSummaryUseCase: GetLatestExecutiveSummaryUseCase;
  getIncidentsUseCase: GetIncidentsUseCase;
  getNotificationsUseCase: GetNotificationsUseCase;
  fraudRepository: FraudRepository;
  auditRepository: AuditRepository;
  now?: () => Date;
};

export class ModuleAnalyticsContextSourceRepository
  implements AnalyticsContextSourceRepository
{
  constructor(private readonly dependencies: ModuleAnalyticsContextSourceRepositoryDependencies) {}

  async load(query: AnalyticsContextReadQuery): Promise<AnalyticsContextSourceSnapshot> {
    const generatedAt = this.dependencies.now?.() ?? new Date();
    const sourceWarnings: string[] = [];
    const [
      dashboardOverview,
      recommendations,
      executiveSummary,
      incidents,
      notifications,
      fraudInsights,
      auditHighlights
    ] = await Promise.all([
      this.loadDashboardOverview(query, sourceWarnings),
      this.loadRecommendations(query, sourceWarnings),
      this.loadExecutiveSummary(query, sourceWarnings),
      this.loadIncidents(query, sourceWarnings),
      this.loadNotifications(query, sourceWarnings),
      this.loadFraudInsights(query, sourceWarnings),
      this.loadAuditHighlights(query, sourceWarnings)
    ]);

    return {
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId ?? null,
      generatedAt,
      dashboardOverview,
      recommendations,
      executiveSummary,
      notifications,
      incidents,
      fraudInsights,
      auditHighlights,
      sourceWarnings
    };
  }

  private async loadDashboardOverview(
    query: AnalyticsContextReadQuery,
    sourceWarnings: string[]
  ) {
    const result = await this.dependencies.getDashboardOverviewUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    return unwrapOptional(result, "dashboard", sourceWarnings)?.value ?? null;
  }

  private async loadRecommendations(
    query: AnalyticsContextReadQuery,
    sourceWarnings: string[]
  ) {
    const result = await this.dependencies.getRecommendationsUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    return unwrapOptional(result, "recommendation", sourceWarnings)?.value.recommendations ?? [];
  }

  private async loadExecutiveSummary(
    query: AnalyticsContextReadQuery,
    sourceWarnings: string[]
  ) {
    const result = await this.dependencies.getLatestExecutiveSummaryUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId
    });

    return unwrapOptional(result, "ai_summary", sourceWarnings)?.value.summary ?? null;
  }

  private async loadIncidents(query: AnalyticsContextReadQuery, sourceWarnings: string[]) {
    const result = await this.dependencies.getIncidentsUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    return unwrapOptional(result, "notification_incidents", sourceWarnings)?.value.incidents ?? [];
  }

  private async loadNotifications(query: AnalyticsContextReadQuery, sourceWarnings: string[]) {
    const result = await this.dependencies.getNotificationsUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    return (
      unwrapOptional(result, "notification_messages", sourceWarnings)?.value.notifications ?? []
    );
  }

  private async loadFraudInsights(
    query: AnalyticsContextReadQuery,
    sourceWarnings: string[]
  ): Promise<FraudInsights> {
    try {
      const recentIncidents = query.businessUnitId
        ? await this.dependencies.fraudRepository.findByLocation(
            query.businessUnitId,
            query.tenantId
          )
        : await this.dependencies.fraudRepository.findByTenant(query.tenantId, {
            limit: query.limit
          });

      const limitedIncidents = recentIncidents.slice(0, query.limit);

      if (query.businessUnitId) {
        return buildFraudInsights(limitedIncidents, limitedIncidents);
      }

      const statistics = await this.dependencies.fraudRepository.getStatistics(query.tenantId);

      return {
        totalIncidents: statistics.totalIncidents,
        criticalCount: statistics.criticalCount,
        averageRiskScore: statistics.averageRiskScore,
        byStatus: statistics.byStatus,
        bySeverity: statistics.bySeverity,
        recentIncidents: limitedIncidents.map(toFraudInsightItem)
      };
    } catch (error) {
      void error;
      sourceWarnings.push("fraud: unavailable");
      return emptyFraudInsights();
    }
  }

  private async loadAuditHighlights(
    query: AnalyticsContextReadQuery,
    sourceWarnings: string[]
  ): Promise<AuditHighlight[]> {
    try {
      const result = await this.dependencies.auditRepository.query({
        tenantId: query.tenantId,
        limit: query.limit
      });

      if (query.businessUnitId) {
        sourceWarnings.push("audit: business unit filtering is not exposed by audit repository");
      }

      return result.items.slice(0, query.limit).map(toAuditHighlight);
    } catch (error) {
      void error;
      sourceWarnings.push("audit: unavailable");
      return [];
    }
  }
}

function unwrapOptional<TValue>(
  result: Result<TValue>,
  sourceName: string,
  sourceWarnings: string[]
) {
  if (result.ok) {
    return result;
  }

  sourceWarnings.push(`${sourceName}: ${result.error.message}`);
  return null;
}

function buildFraudInsights(
  countedIncidents: FraudIncident[],
  recentIncidents: FraudIncident[]
): FraudInsights {
  const byStatus: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let riskScoreTotal = 0;

  countedIncidents.forEach((incident) => {
    byStatus[incident.status] = (byStatus[incident.status] ?? 0) + 1;
    bySeverity[incident.severity] = (bySeverity[incident.severity] ?? 0) + 1;
    riskScoreTotal += incident.riskScore.value;
  });

  return {
    totalIncidents: countedIncidents.length,
    criticalCount: countedIncidents.filter((incident) => incident.severity === "critical").length,
    averageRiskScore:
      countedIncidents.length > 0 ? Math.round(riskScoreTotal / countedIncidents.length) : 0,
    byStatus,
    bySeverity,
    recentIncidents: recentIncidents.map(toFraudInsightItem)
  };
}

function emptyFraudInsights(): FraudInsights {
  return {
    totalIncidents: 0,
    criticalCount: 0,
    averageRiskScore: 0,
    byStatus: {},
    bySeverity: {},
    recentIncidents: []
  };
}

function toFraudInsightItem(incident: FraudIncident): FraudInsightItem {
  return {
    id: incident.id,
    status: incident.status,
    severity: incident.severity,
    riskScore: incident.riskScore.value,
    detectedAt: incident.detectedAt.toISOString(),
    orderId: incident.orderId,
    employeeId: incident.employeeId,
    locationId: incident.locationId
  };
}

function toAuditHighlight(record: AuditRecord): AuditHighlight {
  return {
    id: record.id,
    action: record.action,
    resourceType: record.resourceType,
    resourceId: record.resourceId ?? null,
    outcome: record.outcome,
    actorType: record.actorType,
    userId: record.userId,
    occurredAt: record.occurredAt
  };
}

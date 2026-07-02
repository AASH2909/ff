import type {
  ControlScoreSnapshot,
  DashboardAlert,
  DomainScoreSnapshot,
  ScoreExplanation
} from "@/dashboard/domain";
import type {
  DashboardReadRepository,
  DashboardReadScope
} from "@/dashboard/application/repositories";
import type {
  RecommendationContextRepository,
  RecommendationReadScope
} from "@/recommendation/application/repositories";
import type {
  RecommendationAlertFact,
  RecommendationDomainFact,
  RecommendationExplanationFact,
  RecommendationRuleContext,
  RecommendationScoreFact
} from "@/recommendation/domain";
import type { RecommendationSource } from "@/recommendation/domain";

const RECOMMENDATION_ALERT_CONTEXT_LIMIT = 25;

export class DashboardRecommendationContextRepository implements RecommendationContextRepository {
  constructor(private readonly dashboardReadRepository: DashboardReadRepository) {}

  async loadContext(scope: RecommendationReadScope): Promise<RecommendationRuleContext | null> {
    const dashboardScope: DashboardReadScope = {
      tenantId: scope.tenantId,
      businessUnitId: scope.businessUnitId
    };
    const currentScore = await this.dashboardReadRepository.findLatestControlScore(dashboardScope);

    if (!currentScore) {
      return null;
    }

    const previousScore = await this.dashboardReadRepository.findPreviousControlScore(
      dashboardScope,
      currentScore.calculatedAt
    );

    const [currentDomains, previousDomains, explanations, dashboardAlerts, riskAlerts] =
      await Promise.all([
        this.dashboardReadRepository.findDomainScores(dashboardScope, currentScore.id),
        previousScore
          ? this.dashboardReadRepository.findDomainScores(dashboardScope, previousScore.id)
          : Promise.resolve([]),
        this.dashboardReadRepository.findScoreExplanations(dashboardScope, currentScore.id),
        this.dashboardReadRepository.findActiveDashboardAlerts(
          dashboardScope,
          RECOMMENDATION_ALERT_CONTEXT_LIMIT
        ),
        this.dashboardReadRepository.findActiveRiskAlerts(
          dashboardScope,
          RECOMMENDATION_ALERT_CONTEXT_LIMIT
        )
      ]);

    return {
      score: mapScoreFact(currentScore, previousScore),
      domains: mapDomainFacts(currentDomains, previousDomains),
      explanations: explanations.map(mapExplanationFact),
      alerts: [...dashboardAlerts, ...riskAlerts].map(mapAlertFact),
      generatedAt: new Date()
    };
  }
}

function mapScoreFact(
  currentScore: ControlScoreSnapshot,
  previousScore: ControlScoreSnapshot | null
): RecommendationScoreFact {
  return {
    id: currentScore.id,
    tenantId: currentScore.tenantId,
    businessUnitId: currentScore.businessUnitId,
    businessUnitName: currentScore.businessUnitName,
    score: currentScore.score,
    status: currentScore.status,
    scoreChange: currentScore.getScoreChange(previousScore),
    calculatedAt: currentScore.calculatedAt
  };
}

function mapDomainFacts(
  currentDomains: DomainScoreSnapshot[],
  previousDomains: DomainScoreSnapshot[]
): RecommendationDomainFact[] {
  const previousByCode = new Map(
    previousDomains.map((domainScore) => [domainScore.domainCode, domainScore])
  );

  return currentDomains.map((domainScore) => {
    const previousDomain = previousByCode.get(domainScore.domainCode) ?? null;

    return {
      id: domainScore.id,
      domainCode: domainScore.domainCode,
      domainName: domainScore.domainName,
      score: domainScore.score,
      previousScore: previousDomain?.score ?? null,
      scoreChange: domainScore.getScoreChange(previousDomain),
      contribution: domainScore.contribution,
      calculatedAt: domainScore.calculatedAt
    };
  });
}

function mapExplanationFact(explanation: ScoreExplanation): RecommendationExplanationFact {
  return {
    id: explanation.id,
    domainCode: explanation.domainCode,
    metricCode: explanation.metricCode,
    metricName: explanation.metricName,
    driverType: explanation.driverType,
    contribution: explanation.contribution,
    severity: explanation.severity,
    explanation: explanation.explanation,
    createdAt: explanation.createdAt
  };
}

function mapAlertFact(alert: DashboardAlert): RecommendationAlertFact {
  return {
    id: alert.id,
    severity: alert.severity,
    title: alert.title,
    message: alert.message,
    source: mapAlertSource(alert),
    domainCode: alert.domainCode,
    metricCode: alert.metricCode,
    resourceType: alert.resourceType,
    resourceId: alert.resourceId,
    occurredAt: alert.occurredAt
  };
}

function mapAlertSource(alert: DashboardAlert): RecommendationSource {
  if (alert.source === "fraud" || alert.resourceType === "fraud_alert") {
    return "fraud_alert";
  }

  if (alert.source === "audit") {
    return "audit_event";
  }

  if (alert.source === "control_score") {
    return "control_score";
  }

  return "dashboard_alert";
}

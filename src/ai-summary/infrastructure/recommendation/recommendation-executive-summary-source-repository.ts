import type { ExecutiveSummarySourceRepository } from "@/ai-summary/application/repositories";
import type {
  ExecutiveSummaryAlertFact,
  ExecutiveSummaryDomainFact,
  ExecutiveSummaryExplanationFact,
  ExecutiveSummaryRecommendationFact,
  ExecutiveSummaryScoreFact,
  ExecutiveSummarySourceContext
} from "@/ai-summary/domain";
import type {
  RecommendationContextRepository,
  RecommendationReadScope
} from "@/recommendation/application";
import {
  RecommendationRuleEngine,
  type RecommendationAlertFact,
  type RecommendationDomainFact,
  type RecommendationExplanationFact,
  type RecommendationRuleContext
} from "@/recommendation/domain";
import type { ExecutiveRecommendation } from "@/recommendation/domain";

export class RecommendationExecutiveSummarySourceRepository
  implements ExecutiveSummarySourceRepository
{
  constructor(
    private readonly recommendationContextRepository: RecommendationContextRepository,
    private readonly recommendationRuleEngine = new RecommendationRuleEngine()
  ) {}

  async loadContext(scope: RecommendationReadScope): Promise<ExecutiveSummarySourceContext | null> {
    const context = await this.recommendationContextRepository.loadContext(scope);

    if (!context) {
      return null;
    }

    const recommendations = this.recommendationRuleEngine.generate(context);

    return {
      score: mapScoreFact(context),
      domains: context.domains.map(mapDomainFact),
      explanations: context.explanations.map(mapExplanationFact),
      alerts: context.alerts.map(mapAlertFact),
      recommendations: recommendations.map(mapRecommendationFact),
      generatedAt: context.generatedAt
    };
  }
}

function mapScoreFact(context: RecommendationRuleContext): ExecutiveSummaryScoreFact {
  return {
    id: context.score.id,
    tenantId: context.score.tenantId,
    businessUnitId: context.score.businessUnitId,
    businessUnitName: context.score.businessUnitName,
    score: context.score.score,
    status: context.score.status,
    scoreChange: context.score.scoreChange,
    periodStart: context.score.periodStart,
    periodEnd: context.score.periodEnd,
    calculatedAt: context.score.calculatedAt
  };
}

function mapDomainFact(domain: RecommendationDomainFact): ExecutiveSummaryDomainFact {
  return {
    id: domain.id,
    domainCode: domain.domainCode,
    domainName: domain.domainName,
    score: domain.score,
    scoreChange: domain.scoreChange,
    contribution: domain.contribution,
    calculatedAt: domain.calculatedAt
  };
}

function mapExplanationFact(
  explanation: RecommendationExplanationFact
): ExecutiveSummaryExplanationFact {
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

function mapAlertFact(alert: RecommendationAlertFact): ExecutiveSummaryAlertFact {
  return {
    id: alert.id,
    severity: alert.severity,
    title: alert.title,
    message: alert.message,
    source: alert.source,
    domainCode: alert.domainCode,
    metricCode: alert.metricCode,
    occurredAt: alert.occurredAt
  };
}

function mapRecommendationFact(
  recommendation: ExecutiveRecommendation
): ExecutiveSummaryRecommendationFact {
  return {
    id: recommendation.id,
    priority: recommendation.priority,
    severity: recommendation.severity,
    category: recommendation.category,
    title: recommendation.title,
    description: recommendation.description,
    businessImpact: recommendation.businessImpact,
    recommendedAction: recommendation.recommendedAction,
    confidence: recommendation.confidence,
    source: recommendation.source,
    createdAt: recommendation.createdAt
  };
}

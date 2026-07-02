import {
  ExecutiveSummary,
  type ExecutiveSummaryMetadata
} from "@/ai-summary/domain/entities";
import type {
  ExecutiveSummaryAlertFact,
  ExecutiveSummaryBuildInput,
  ExecutiveSummaryDomainFact,
  ExecutiveSummaryExplanationFact,
  ExecutiveSummaryRecommendationFact
} from "@/ai-summary/domain/services/executive-summary-source-context";

const SIGNAL_LIMIT = 5;
const ACTION_LIMIT = 6;

export class DeterministicExecutiveSummaryBuilder {
  build(input: ExecutiveSummaryBuildInput) {
    const { context } = input;
    const criticalRecommendations = context.recommendations.filter(isCriticalRecommendation);
    const criticalAlerts = context.alerts.filter(isCriticalAlert);
    const fraudRecommendations = context.recommendations.filter((recommendation) =>
      hasSignal(
        [
          recommendation.category,
          recommendation.title,
          recommendation.description,
          recommendation.businessImpact
        ],
        ["fraud", "refund", "suspicious"]
      )
    );
    const inventoryRecommendations = context.recommendations.filter((recommendation) =>
      hasSignal(
        [
          recommendation.category,
          recommendation.title,
          recommendation.description,
          recommendation.businessImpact
        ],
        ["inventory", "stock", "waste", "spoilage"]
      )
    );

    return new ExecutiveSummary({
      id: input.id,
      tenantId: context.score.tenantId,
      businessUnitId: context.score.businessUnitId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      summaryType: input.summaryType,
      status: "DRAFT",
      headline: buildHeadline(context.score.score, context.score.status, context.score.scoreChange),
      overallAssessment: buildOverallAssessment(context.score.score),
      keyPositiveSignals: buildPositiveSignals(context.domains, context.explanations),
      keyNegativeSignals: buildNegativeSignals(context.domains, context.explanations),
      criticalRisks: buildCriticalRisks(
        criticalRecommendations,
        criticalAlerts,
        fraudRecommendations,
        inventoryRecommendations
      ),
      recommendedActions: buildRecommendedActions(context.recommendations),
      confidence: calculateConfidence(context),
      sourceModules: [
        "dashboard",
        "control_score",
        "domain_scores",
        "score_explanations",
        "dashboard_alerts",
        "executive_recommendations"
      ],
      generatedAt: input.generatedAt,
      metadata: buildMetadata(input, fraudRecommendations.length, inventoryRecommendations.length)
    });
  }
}

function buildHeadline(score: number, status: string, scoreChange: number | null) {
  const changeText =
    scoreChange === null
      ? "no prior comparison"
      : scoreChange > 0
        ? `up ${scoreChange} points`
        : scoreChange < 0
          ? `down ${Math.abs(scoreChange)} points`
          : "unchanged";

  return `Control Score is ${score} (${status}), ${changeText}.`;
}

function buildOverallAssessment(score: number) {
  if (score >= 85) {
    return "Business is operating under strong control.";
  }

  if (score >= 70) {
    return "Business is stable with monitored risks.";
  }

  if (score >= 55) {
    return "Business requires management attention.";
  }

  return "Business requires urgent executive intervention.";
}

function buildPositiveSignals(
  domains: ExecutiveSummaryDomainFact[],
  explanations: ExecutiveSummaryExplanationFact[]
) {
  const improvedDomains = domains
    .filter((domain) => (domain.scoreChange ?? 0) > 0)
    .sort((left, right) => (right.scoreChange ?? 0) - (left.scoreChange ?? 0))
    .map((domain) => `${domain.domainName} improved by ${domain.scoreChange} points.`);

  const positiveDrivers = explanations
    .filter((explanation) => explanation.driverType === "positive")
    .sort((left, right) => right.contribution - left.contribution)
    .map((explanation) => explanation.explanation);

  return [...improvedDomains, ...positiveDrivers].slice(0, SIGNAL_LIMIT);
}

function buildNegativeSignals(
  domains: ExecutiveSummaryDomainFact[],
  explanations: ExecutiveSummaryExplanationFact[]
) {
  const deterioratedDomains = domains
    .filter((domain) => (domain.scoreChange ?? 0) < 0)
    .sort((left, right) => (left.scoreChange ?? 0) - (right.scoreChange ?? 0))
    .map((domain) => `${domain.domainName} declined by ${Math.abs(domain.scoreChange ?? 0)} points.`);

  const negativeDrivers = explanations
    .filter(
      (explanation) =>
        explanation.driverType === "negative" || explanation.driverType === "risk"
    )
    .sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
    .map((explanation) => explanation.explanation);

  return [...deterioratedDomains, ...negativeDrivers].slice(0, SIGNAL_LIMIT);
}

function buildCriticalRisks(
  criticalRecommendations: ExecutiveSummaryRecommendationFact[],
  criticalAlerts: ExecutiveSummaryAlertFact[],
  fraudRecommendations: ExecutiveSummaryRecommendationFact[],
  inventoryRecommendations: ExecutiveSummaryRecommendationFact[]
) {
  const recommendationRisks = criticalRecommendations.map(
    (recommendation) => `${recommendation.title}: ${recommendation.businessImpact}`
  );
  const alertRisks = criticalAlerts.map((alert) => `${alert.title}: ${alert.message}`);
  const fraudRisk =
    fraudRecommendations.length > 0
      ? ["Fraud-related recommendations require executive review."]
      : [];
  const inventoryRisk =
    inventoryRecommendations.length > 0
      ? ["Inventory control recommendations require executive review."]
      : [];

  return [...recommendationRisks, ...alertRisks, ...fraudRisk, ...inventoryRisk].slice(
    0,
    SIGNAL_LIMIT
  );
}

function buildRecommendedActions(recommendations: ExecutiveSummaryRecommendationFact[]) {
  return recommendations
    .sort((left, right) => {
      const priorityDifference = priorityRank(right.priority) - priorityRank(left.priority);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return severityRank(right.severity) - severityRank(left.severity);
    })
    .map((recommendation) => recommendation.recommendedAction)
    .slice(0, ACTION_LIMIT);
}

function calculateConfidence(context: {
  domains: ExecutiveSummaryDomainFact[];
  explanations: ExecutiveSummaryExplanationFact[];
  alerts: ExecutiveSummaryAlertFact[];
  recommendations: ExecutiveSummaryRecommendationFact[];
}) {
  const signalScore =
    (context.domains.length > 0 ? 0.08 : 0) +
    (context.explanations.length > 0 ? 0.06 : 0) +
    (context.alerts.length > 0 ? 0.04 : 0) +
    (context.recommendations.length > 0 ? 0.06 : 0);

  return Number(Math.min(0.95, 0.72 + signalScore).toFixed(2));
}

function buildMetadata(
  input: ExecutiveSummaryBuildInput,
  fraudRecommendationCount: number,
  inventoryRecommendationCount: number
): ExecutiveSummaryMetadata {
  return {
    builder: "deterministic_rules_v1",
    controlScoreId: input.context.score.id,
    controlScore: input.context.score.score,
    scoreChange: input.context.score.scoreChange,
    recommendationCount: input.context.recommendations.length,
    alertCount: input.context.alerts.length,
    explanationCount: input.context.explanations.length,
    domainCount: input.context.domains.length,
    fraudRecommendationCount,
    inventoryRecommendationCount,
    sourceGeneratedAt: input.context.generatedAt.toISOString()
  };
}

function isCriticalRecommendation(recommendation: ExecutiveSummaryRecommendationFact) {
  return (
    recommendation.priority === "CRITICAL" ||
    recommendation.severity === "critical" ||
    recommendation.severity === "severe"
  );
}

function isCriticalAlert(alert: ExecutiveSummaryAlertFact) {
  return alert.severity === "critical" || alert.severity === "severe";
}

function hasSignal(values: Array<string | null | undefined>, keywords: string[]) {
  const normalized = values
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase();

  return keywords.some((keyword) => normalized.includes(keyword));
}

function priorityRank(priority: ExecutiveSummaryRecommendationFact["priority"]) {
  const rank: Record<ExecutiveSummaryRecommendationFact["priority"], number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  return rank[priority];
}

function severityRank(severity: ExecutiveSummaryRecommendationFact["severity"]) {
  const rank: Record<ExecutiveSummaryRecommendationFact["severity"], number> = {
    information: 1,
    warning: 2,
    critical: 3,
    severe: 4
  };

  return rank[severity];
}

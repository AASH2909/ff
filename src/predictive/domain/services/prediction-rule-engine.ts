import type { AnalyticsContextDto } from "@/analytics-context/application";
import {
  Prediction,
  type PredictionExplanation,
  type PredictionMetadata
} from "@/predictive/domain/entities";
import type {
  PredictionRiskLevel,
  PredictionTrend,
  PredictionType,
  PredictionWindow
} from "@/predictive/domain/value-objects";

export type PredictionRuleInput = {
  context: AnalyticsContextDto;
  predictionWindow: PredictionWindow;
  generatedAt: Date;
};

type PredictionDraft = {
  predictionType: PredictionType;
  riskLevel: PredictionRiskLevel;
  confidence: number;
  predictedControlScore: number | null;
  trend: PredictionTrend;
  summary: string;
  explanations: PredictionExplanation[];
  recommendedActions: string[];
  metadata?: PredictionMetadata;
};

export class PredictionRuleEngine {
  generate(input: PredictionRuleInput): Prediction[] {
    return [
      this.predictControlScore(input),
      this.predictFraud(input),
      this.predictOperations(input),
      this.predictInventory(input),
      this.predictFinancial(input)
    ].map((draft) => this.toPrediction(input, draft));
  }

  private predictControlScore(input: PredictionRuleInput): PredictionDraft {
    const { context } = input;
    const currentScore = context.controlScore?.score ?? null;
    const scoreChange = context.controlScore?.scoreChange ?? null;
    const recentDirections = context.dashboardOverview?.trend.slice(0, 3).map((point) => point.direction) ?? [];
    const consecutiveDeclines = recentDirections.filter((direction) => direction === "down").length;
    const unresolvedIncidents = context.incidents.filter((incident) => incident.status !== "RESOLVED");
    const severeIncidentCount = unresolvedIncidents.filter(
      (incident) => incident.severity === "severe" || incident.severity === "critical"
    ).length;
    const riskPoints =
      (scoreChange !== null && scoreChange <= -5 ? 4 : 0) +
      (consecutiveDeclines >= 3 ? 4 : consecutiveDeclines >= 2 ? 2 : 0) +
      (severeIncidentCount > 0 ? 2 : 0) +
      (currentScore !== null && currentScore < 60 ? 3 : 0);
    const trend = trendFromScoreChange(scoreChange, consecutiveDeclines);
    const predictedControlScore =
      currentScore === null ? null : clampScore(currentScore + projectedScoreDelta(scoreChange, riskPoints));

    return {
      predictionType: "CONTROL_SCORE",
      riskLevel: riskFromPoints(riskPoints),
      confidence: confidenceFromSignals(68, [
        currentScore !== null,
        scoreChange !== null,
        recentDirections.length > 0,
        unresolvedIncidents.length > 0
      ]),
      predictedControlScore,
      trend,
      summary: buildControlScoreSummary(trend, currentScore, predictedControlScore),
      explanations: [
        {
          code: "CONTROL_SCORE_CHANGE",
          message:
            scoreChange === null
              ? "No previous Control Score delta is available in Analytics Context."
              : `Control Score delta is ${scoreChange} points in the latest Analytics Context.`,
          sourceData: "analyticsContext.controlScore.scoreChange"
        },
        {
          code: "INCIDENT_PRESSURE",
          message: `${unresolvedIncidents.length} unresolved incident(s), including ${severeIncidentCount} critical or severe incident(s), are present in Analytics Context.`,
          sourceData: "analyticsContext.incidents"
        }
      ],
      recommendedActions: topRecommendedActions(context, ["Operations", "Performance", "Compliance"]),
      metadata: baseMetadata(context)
    };
  }

  private predictFraud(input: PredictionRuleInput): PredictionDraft {
    const { context } = input;
    const fraudRecommendations = context.recommendations.filter((recommendation) =>
      textIncludes(
        [recommendation.category, recommendation.title, recommendation.description],
        ["fraud", "refund", "suspicious"]
      )
    );
    const fraudIncidentCount = context.fraudInsights.totalIncidents;
    const recentFraudIncidents = context.fraudInsights.recentIncidents.length;
    const riskPoints =
      (context.fraudInsights.criticalCount > 0 ? 4 : 0) +
      (context.fraudInsights.averageRiskScore >= 700 ? 4 : context.fraudInsights.averageRiskScore >= 400 ? 2 : 0) +
      (recentFraudIncidents >= 5 ? 3 : recentFraudIncidents >= 2 ? 1 : 0) +
      (fraudRecommendations.length > 0 ? 2 : 0);

    return {
      predictionType: "FRAUD",
      riskLevel: riskFromPoints(riskPoints),
      confidence: confidenceFromSignals(64, [
        fraudIncidentCount > 0,
        context.fraudInsights.averageRiskScore > 0,
        context.fraudInsights.criticalCount > 0,
        fraudRecommendations.length > 0
      ]),
      predictedControlScore: projectedScoreFromRisk(context.controlScore?.score ?? null, riskPoints),
      trend: riskPoints >= 6 ? "DECLINING" : fraudIncidentCount === 0 ? "STABLE" : "UNKNOWN",
      summary: `Fraud risk is ${riskFromPoints(riskPoints)} based on ${fraudIncidentCount} fraud incident(s) in Analytics Context.`,
      explanations: [
        {
          code: "FRAUD_INCIDENTS",
          message: `Analytics Context reports ${fraudIncidentCount} fraud incident(s), ${context.fraudInsights.criticalCount} critical incident(s), and average risk score ${context.fraudInsights.averageRiskScore}.`,
          sourceData: "analyticsContext.fraudInsights"
        },
        {
          code: "FRAUD_RECOMMENDATIONS",
          message: `${fraudRecommendations.length} upstream recommendation(s) reference fraud, refund, or suspicious activity.`,
          sourceData: "analyticsContext.recommendations"
        }
      ],
      recommendedActions: fraudRecommendations.map((recommendation) => recommendation.recommendedAction),
      metadata: baseMetadata(context)
    };
  }

  private predictOperations(input: PredictionRuleInput): PredictionDraft {
    const { context } = input;
    const unresolvedIncidents = context.incidents.filter((incident) => incident.status !== "RESOLVED");
    const severeIncidents = unresolvedIncidents.filter(
      (incident) => incident.severity === "critical" || incident.severity === "severe"
    );
    const unacknowledgedNotifications = context.notifications.filter(
      (notification) =>
        notification.status === "NEW" ||
        notification.status === "PENDING" ||
        notification.status === "SENT"
    );
    const operationsRecommendations = context.recommendations.filter((recommendation) =>
      ["Operations", "Kitchen", "Staff", "Performance", "Compliance"].includes(recommendation.category)
    );
    const riskPoints =
      (severeIncidents.length > 0 ? 4 : 0) +
      (unresolvedIncidents.length >= 5 ? 3 : unresolvedIncidents.length >= 2 ? 1 : 0) +
      (unacknowledgedNotifications.length >= 5 ? 2 : unacknowledgedNotifications.length >= 1 ? 1 : 0) +
      (operationsRecommendations.length > 0 ? 1 : 0);

    return {
      predictionType: "OPERATIONS",
      riskLevel: riskFromPoints(riskPoints),
      confidence: confidenceFromSignals(66, [
        context.incidents.length > 0,
        context.notifications.length > 0,
        operationsRecommendations.length > 0,
        context.dashboardOverview !== null
      ]),
      predictedControlScore: projectedScoreFromRisk(context.controlScore?.score ?? null, riskPoints),
      trend: riskPoints >= 6 ? "DECLINING" : riskPoints <= 2 ? "STABLE" : "UNKNOWN",
      summary: `Operational risk is ${riskFromPoints(riskPoints)} with ${unresolvedIncidents.length} unresolved incident(s).`,
      explanations: [
        {
          code: "UNRESOLVED_INCIDENTS",
          message: `${unresolvedIncidents.length} unresolved incident(s) and ${severeIncidents.length} critical or severe incident(s) are present.`,
          sourceData: "analyticsContext.incidents"
        },
        {
          code: "UNACKNOWLEDGED_NOTIFICATIONS",
          message: `${unacknowledgedNotifications.length} internal notification(s) remain unacknowledged.`,
          sourceData: "analyticsContext.notifications"
        }
      ],
      recommendedActions: operationsRecommendations.map((recommendation) => recommendation.recommendedAction),
      metadata: baseMetadata(context)
    };
  }

  private predictInventory(input: PredictionRuleInput): PredictionDraft {
    const { context } = input;
    const inventoryDomains =
      context.dashboardOverview?.domainScores.filter((domain) =>
        textIncludes([domain.domainCode, domain.domainName], ["inventory", "stock", "waste", "spoilage"])
      ) ?? [];
    const inventoryRecommendations = context.recommendations.filter((recommendation) =>
      ["Inventory", "Waste"].includes(recommendation.category)
    );
    const lowInventoryDomains = inventoryDomains.filter((domain) => domain.score < 65);
    const decliningInventoryDomains = inventoryDomains.filter((domain) => (domain.scoreChange ?? 0) < 0);
    const riskPoints =
      (lowInventoryDomains.length > 0 ? 3 : 0) +
      (decliningInventoryDomains.length > 0 ? 3 : 0) +
      (inventoryRecommendations.length > 0 ? 2 : 0);

    return {
      predictionType: "INVENTORY",
      riskLevel: riskFromPoints(riskPoints),
      confidence: confidenceFromSignals(60, [
        inventoryDomains.length > 0,
        lowInventoryDomains.length > 0,
        decliningInventoryDomains.length > 0,
        inventoryRecommendations.length > 0
      ]),
      predictedControlScore: projectedScoreFromRisk(context.controlScore?.score ?? null, riskPoints),
      trend:
        decliningInventoryDomains.length > 0
          ? "DECLINING"
          : inventoryDomains.length > 0
            ? "STABLE"
            : "UNKNOWN",
      summary: `Inventory risk is ${riskFromPoints(riskPoints)} based on inventory domain and upstream recommendation signals.`,
      explanations: [
        {
          code: "INVENTORY_DOMAIN_HEALTH",
          message: `${lowInventoryDomains.length} inventory-related domain(s) are below threshold and ${decliningInventoryDomains.length} are declining.`,
          sourceData: "analyticsContext.dashboardOverview.domainScores"
        },
        {
          code: "INVENTORY_RECOMMENDATIONS",
          message: `${inventoryRecommendations.length} upstream recommendation(s) relate to inventory or waste.`,
          sourceData: "analyticsContext.recommendations"
        }
      ],
      recommendedActions: inventoryRecommendations.map((recommendation) => recommendation.recommendedAction),
      metadata: baseMetadata(context)
    };
  }

  private predictFinancial(input: PredictionRuleInput): PredictionDraft {
    const { context } = input;
    const financialRecommendations = context.recommendations.filter((recommendation) =>
      ["Finance", "Cash"].includes(recommendation.category)
    );
    const financialDrivers =
      context.dashboardOverview?.topNegativeDrivers.filter((driver) =>
        textIncludes(
          [driver.title, driver.description, driver.domainCode, driver.metricCode],
          ["revenue", "profit", "margin", "cash", "payment", "refund"]
        )
      ) ?? [];
    const score = context.controlScore?.score ?? null;
    const riskPoints =
      (score !== null && score < 65 ? 3 : 0) +
      (financialDrivers.length > 0 ? 3 : 0) +
      (financialRecommendations.length > 0 ? 2 : 0) +
      ((context.controlScore?.scoreChange ?? 0) < -5 ? 2 : 0);

    return {
      predictionType: "FINANCIAL",
      riskLevel: riskFromPoints(riskPoints),
      confidence: confidenceFromSignals(61, [
        score !== null,
        context.controlScore?.scoreChange !== null,
        financialDrivers.length > 0,
        financialRecommendations.length > 0
      ]),
      predictedControlScore: projectedScoreFromRisk(score, riskPoints),
      trend: riskPoints >= 6 ? "DECLINING" : riskPoints <= 2 ? "STABLE" : "UNKNOWN",
      summary: `Financial risk is ${riskFromPoints(riskPoints)} based on finance, cash, and negative driver signals.`,
      explanations: [
        {
          code: "FINANCIAL_DRIVERS",
          message: `${financialDrivers.length} negative dashboard driver(s) reference revenue, profit, margin, cash, payment, or refund signals.`,
          sourceData: "analyticsContext.dashboardOverview.topNegativeDrivers"
        },
        {
          code: "FINANCIAL_RECOMMENDATIONS",
          message: `${financialRecommendations.length} upstream recommendation(s) relate to finance or cash controls.`,
          sourceData: "analyticsContext.recommendations"
        }
      ],
      recommendedActions: financialRecommendations.map((recommendation) => recommendation.recommendedAction),
      metadata: baseMetadata(context)
    };
  }

  private toPrediction(input: PredictionRuleInput, draft: PredictionDraft) {
    return new Prediction({
      id: buildPredictionId(input.context, draft.predictionType, input.predictionWindow),
      tenantId: input.context.tenantId,
      businessUnitId: input.context.businessUnitId,
      generatedAt: input.generatedAt,
      predictionType: draft.predictionType,
      predictionWindow: input.predictionWindow,
      riskLevel: draft.riskLevel,
      confidence: draft.confidence,
      predictedControlScore: draft.predictedControlScore,
      trend: draft.trend,
      summary: draft.summary,
      explanations: draft.explanations,
      recommendedActions: draft.recommendedActions,
      metadata: {
        ...draft.metadata,
        predictionWindow: input.predictionWindow
      }
    });
  }
}

export function sortPredictions(predictions: Prediction[]) {
  return [...predictions].sort((left, right) => {
    const riskDifference = riskRank(right.riskLevel) - riskRank(left.riskLevel);

    if (riskDifference !== 0) {
      return riskDifference;
    }

    return right.confidence - left.confidence;
  });
}

function buildPredictionId(
  context: AnalyticsContextDto,
  predictionType: PredictionType,
  predictionWindow: PredictionWindow
) {
  const scope = context.businessUnitId ?? "tenant";
  const sourceId = context.controlScore?.id ?? context.executiveSummary?.id ?? "no-source";
  return `prediction:${context.tenantId}:${scope}:${predictionType}:${predictionWindow}:${sourceId}`;
}

function trendFromScoreChange(
  scoreChange: number | null,
  consecutiveDeclines: number
): PredictionTrend {
  if (consecutiveDeclines >= 3 || (scoreChange !== null && scoreChange <= -3)) {
    return "DECLINING";
  }

  if (scoreChange !== null && scoreChange >= 3) {
    return "IMPROVING";
  }

  if (scoreChange !== null) {
    return "STABLE";
  }

  return "UNKNOWN";
}

function projectedScoreDelta(scoreChange: number | null, riskPoints: number) {
  const trendDelta = scoreChange === null ? 0 : Math.max(-10, Math.min(10, scoreChange));
  const riskDrag = riskPoints >= 8 ? -4 : riskPoints >= 5 ? -2 : 0;
  return Number((trendDelta + riskDrag).toFixed(2));
}

function projectedScoreFromRisk(score: number | null, riskPoints: number) {
  if (score === null) {
    return null;
  }

  const riskDrag = riskPoints >= 9 ? -8 : riskPoints >= 6 ? -5 : riskPoints >= 3 ? -2 : 0;
  return clampScore(score + riskDrag);
}

function buildControlScoreSummary(
  trend: PredictionTrend,
  currentScore: number | null,
  predictedScore: number | null
) {
  if (currentScore === null || predictedScore === null) {
    return `Control Score trend is ${trend} because Analytics Context does not include enough score history.`;
  }

  return `Control Score trend is ${trend}; current score is ${currentScore} and deterministic projection is ${predictedScore}.`;
}

function riskFromPoints(points: number): PredictionRiskLevel {
  if (points >= 9) {
    return "CRITICAL";
  }

  if (points >= 6) {
    return "HIGH";
  }

  if (points >= 3) {
    return "MEDIUM";
  }

  return "LOW";
}

function confidenceFromSignals(base: number, signals: boolean[]) {
  const signalCount = signals.filter(Boolean).length;
  return Math.min(95, base + signalCount * 6);
}

function riskRank(riskLevel: PredictionRiskLevel) {
  const ranks: Record<PredictionRiskLevel, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  return ranks[riskLevel];
}

function clampScore(value: number) {
  return Number(Math.min(100, Math.max(0, value)).toFixed(2));
}

function topRecommendedActions(context: AnalyticsContextDto, categories: string[]) {
  return context.recommendations
    .filter((recommendation) => categories.includes(recommendation.category))
    .slice(0, 5)
    .map((recommendation) => recommendation.recommendedAction);
}

function textIncludes(values: Array<string | null | undefined>, keywords: string[]) {
  const normalized = values
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase();

  return keywords.some((keyword) => normalized.includes(keyword));
}

function baseMetadata(context: AnalyticsContextDto): PredictionMetadata {
  return {
    analyticsGeneratedAt: context.generatedAt,
    sourceControlScoreId: context.controlScore?.id ?? null,
    sourceRecommendationCount: context.recommendations.length,
    sourceIncidentCount: context.incidents.length,
    sourceNotificationCount: context.notifications.length,
    sourceWarnings: readSourceWarnings(context)
  };
}

function readSourceWarnings(context: AnalyticsContextDto) {
  const warnings = context.metadata.sourceWarnings;

  if (Array.isArray(warnings)) {
    return warnings.filter((warning): warning is string => typeof warning === "string");
  }

  return [];
}

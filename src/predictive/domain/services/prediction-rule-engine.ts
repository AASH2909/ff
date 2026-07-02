import type { AnalyticsContextDto } from "@/analytics-context/application";
import {
  Prediction,
  PredictionFactor,
  PredictionScenario,
  type PredictionFactorProps,
  type PredictionMetadata,
  type PredictionScenarioProps
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
  createdAt: Date;
};

export type PredictionRuleConfig = {
  controlScoreDeclineDelta: number;
  highPriorityRecommendationThreshold: number;
  healthyControlScoreThreshold: number;
  fraudHighAverageRiskScore: number;
  lowDomainScoreThreshold: number;
};

type PredictionFactorDraft = Omit<PredictionFactorProps, "id" | "predictionId">;
type PredictionScenarioDraft = Omit<PredictionScenarioProps, "id" | "predictionId">;

type PredictionDraft = {
  ruleCode: string;
  predictionType: PredictionType;
  riskLevel: PredictionRiskLevel;
  trend: PredictionTrend;
  confidence: number;
  summary: string;
  predictedControlScore: number | null;
  factors: PredictionFactorDraft[];
  scenarios: PredictionScenarioDraft[];
  metadata?: PredictionMetadata;
};

type RuleSignals = {
  currentScore: number | null;
  previousScore: number | null;
  scoreChange: number | null;
  consecutiveDeclines: number;
  unresolvedIncidents: AnalyticsContextDto["incidents"];
  criticalIncidents: AnalyticsContextDto["incidents"];
  fraudRecommendations: AnalyticsContextDto["recommendations"];
  highPriorityRecommendations: AnalyticsContextDto["recommendations"];
  inventoryRecommendations: AnalyticsContextDto["recommendations"];
  financialRecommendations: AnalyticsContextDto["recommendations"];
  staffRecommendations: AnalyticsContextDto["recommendations"];
};

const DEFAULT_RULE_CONFIG: PredictionRuleConfig = {
  controlScoreDeclineDelta: -3,
  highPriorityRecommendationThreshold: 3,
  healthyControlScoreThreshold: 85,
  fraudHighAverageRiskScore: 700,
  lowDomainScoreThreshold: 65
};

export class PredictionRuleEngine {
  private readonly config: PredictionRuleConfig;

  constructor(config: Partial<PredictionRuleConfig> = {}) {
    this.config = {
      ...DEFAULT_RULE_CONFIG,
      ...config
    };
  }

  generate(input: PredictionRuleInput): Prediction[] {
    const signals = buildSignals(input.context);
    const drafts = [
      this.predictControlScoreDecline(input.context, signals),
      this.predictCriticalIncidents(input.context, signals),
      this.predictFraudSignals(input.context, signals),
      this.predictHighPriorityRecommendations(input.context, signals),
      this.predictInventoryRisk(input.context),
      this.predictFinancialRisk(input.context, signals),
      this.predictStaffRisk(input.context),
      this.predictHealthyStableBusiness(input.context, signals)
    ].filter((draft): draft is PredictionDraft => draft !== null);

    return sortPredictions(drafts.map((draft) => this.toPrediction(input, draft)));
  }

  private predictControlScoreDecline(
    context: AnalyticsContextDto,
    signals: RuleSignals
  ): PredictionDraft | null {
    if (
      signals.currentScore === null ||
      signals.previousScore === null ||
      signals.scoreChange === null ||
      signals.scoreChange > this.config.controlScoreDeclineDelta
    ) {
      return null;
    }

    const riskPoints =
      Math.abs(signals.scoreChange) >= 10 ? 8 : Math.abs(signals.scoreChange) >= 5 ? 6 : 4;
    const trendPenalty = signals.consecutiveDeclines >= 3 ? 4 : signals.consecutiveDeclines >= 2 ? 2 : 0;
    const factors: PredictionFactorDraft[] = [
      {
        factorType: "CONTROL_SCORE_DELTA",
        source: "analyticsContext.controlScore.scoreChange",
        title: "Control Score declined",
        description: `Control Score changed by ${signals.scoreChange} points from the previous score.`,
        impact: riskPoints >= 8 ? "CRITICAL" : riskPoints >= 6 ? "HIGH" : "MEDIUM",
        weight: 45,
        direction: "NEGATIVE",
        evidence: [
          `currentScore=${signals.currentScore}`,
          `previousScore=${signals.previousScore}`,
          `scoreChange=${signals.scoreChange}`
        ]
      },
      {
        factorType: "SCORE_TREND",
        source: "analyticsContext.dashboardOverview.trend",
        title: "Recent score trend",
        description: `${signals.consecutiveDeclines} of the latest trend points are declining.`,
        impact: signals.consecutiveDeclines >= 3 ? "HIGH" : "MEDIUM",
        weight: 25,
        direction: signals.consecutiveDeclines > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence: [`consecutiveDeclines=${signals.consecutiveDeclines}`]
      }
    ];
    const totalRiskPoints = riskPoints + trendPenalty;

    return {
      ruleCode: "CONTROL_SCORE_DECLINE",
      predictionType: "CONTROL_SCORE",
      riskLevel: riskFromPoints(totalRiskPoints),
      trend: "DECLINING",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: totalRiskPoints,
        signalConsistency: signals.consecutiveDeclines >= 2 ? 3 : 2,
        requiresScore: true,
        requiresHistory: true
      }),
      summary: `Control Score is declining from ${signals.previousScore} to ${signals.currentScore}.`,
      predictedControlScore: projectControlScore(signals.currentScore, signals.scoreChange, totalRiskPoints),
      factors,
      scenarios: buildScenarios("CONTROL_SCORE_DECLINE", "Control Score", totalRiskPoints),
      metadata: baseMetadata(context)
    };
  }

  private predictCriticalIncidents(
    context: AnalyticsContextDto,
    signals: RuleSignals
  ): PredictionDraft | null {
    if (signals.criticalIncidents.length === 0) {
      return null;
    }

    const riskPoints =
      signals.criticalIncidents.length >= 3 ? 10 : signals.criticalIncidents.length === 2 ? 8 : 6;
    const factors: PredictionFactorDraft[] = [
      {
        factorType: "CRITICAL_INCIDENTS",
        source: "analyticsContext.incidents",
        title: "Unresolved critical incidents",
        description: `${signals.criticalIncidents.length} unresolved critical or severe incident(s) require executive attention.`,
        impact: riskPoints >= 10 ? "CRITICAL" : "HIGH",
        weight: 50,
        direction: "NEGATIVE",
        evidence: signals.criticalIncidents.map((incident) => incident.id)
      },
      {
        factorType: "UNRESOLVED_INCIDENT_VOLUME",
        source: "analyticsContext.incidents",
        title: "Open incident pressure",
        description: `${signals.unresolvedIncidents.length} incident(s) are not resolved.`,
        impact: signals.unresolvedIncidents.length >= 5 ? "HIGH" : "MEDIUM",
        weight: 25,
        direction: "NEGATIVE",
        evidence: [`unresolvedIncidents=${signals.unresolvedIncidents.length}`]
      }
    ];

    return {
      ruleCode: "CRITICAL_INCIDENTS",
      predictionType: "OPERATIONAL_RISK",
      riskLevel: riskFromPoints(riskPoints),
      trend: signals.criticalIncidents.length > 1 ? "DECLINING" : "UNKNOWN",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: riskPoints,
        signalConsistency: signals.unresolvedIncidents.length >= signals.criticalIncidents.length ? 3 : 1,
        requiresIncidents: true
      }),
      summary: `${signals.criticalIncidents.length} critical or severe incident(s) are still unresolved.`,
      predictedControlScore: projectControlScoreFromRisk(signals.currentScore, riskPoints),
      factors,
      scenarios: buildScenarios("CRITICAL_INCIDENTS", "Operational risk", riskPoints),
      metadata: baseMetadata(context)
    };
  }

  private predictFraudSignals(
    context: AnalyticsContextDto,
    signals: RuleSignals
  ): PredictionDraft | null {
    const fraudIncidents = context.incidents.filter((incident) =>
      textIncludes([incident.category, incident.title, incident.description], ["fraud", "refund", "suspicious"])
    );
    const fraudSignalCount =
      context.fraudInsights.totalIncidents +
      context.fraudInsights.recentIncidents.length +
      fraudIncidents.length +
      signals.fraudRecommendations.length;

    if (fraudSignalCount === 0 && context.fraudInsights.averageRiskScore < this.config.fraudHighAverageRiskScore) {
      return null;
    }

    const riskPoints =
      (context.fraudInsights.criticalCount > 0 ? 5 : 0) +
      (context.fraudInsights.averageRiskScore >= this.config.fraudHighAverageRiskScore ? 4 : 0) +
      (signals.fraudRecommendations.length > 0 ? 3 : 0) +
      (fraudIncidents.length > 0 ? 2 : 0);
    const factors: PredictionFactorDraft[] = [
      {
        factorType: "FRAUD_SIGNAL_VOLUME",
        source: "analyticsContext.fraudInsights",
        title: "Fraud signal activity",
        description: `${context.fraudInsights.totalIncidents} fraud incident(s) and ${context.fraudInsights.recentIncidents.length} recent signal(s) are present.`,
        impact: riskPoints >= 9 ? "CRITICAL" : riskPoints >= 6 ? "HIGH" : "MEDIUM",
        weight: 45,
        direction: "NEGATIVE",
        evidence: [
          `totalIncidents=${context.fraudInsights.totalIncidents}`,
          `criticalCount=${context.fraudInsights.criticalCount}`,
          `averageRiskScore=${context.fraudInsights.averageRiskScore}`
        ]
      },
      {
        factorType: "FRAUD_RECOMMENDATIONS",
        source: "analyticsContext.recommendations",
        title: "Fraud-related recommendations",
        description: `${signals.fraudRecommendations.length} recommendation(s) reference fraud, refund, or suspicious activity.`,
        impact: signals.fraudRecommendations.length > 0 ? "HIGH" : "LOW",
        weight: 30,
        direction: signals.fraudRecommendations.length > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence: recommendationEvidence(signals.fraudRecommendations)
      }
    ];

    return {
      ruleCode: "FRAUD_SIGNALS",
      predictionType: "FRAUD_RISK",
      riskLevel: riskFromPoints(riskPoints),
      trend: riskPoints >= 6 ? "DECLINING" : "UNKNOWN",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: riskPoints,
        signalConsistency: signals.fraudRecommendations.length > 0 && context.fraudInsights.totalIncidents > 0 ? 3 : 1,
        requiresIncidents: true,
        requiresRecommendations: true
      }),
      summary: "Fraud risk signals are present in Analytics Context outputs.",
      predictedControlScore: projectControlScoreFromRisk(signals.currentScore, riskPoints),
      factors,
      scenarios: buildScenarios("FRAUD_SIGNALS", "Fraud risk", riskPoints),
      metadata: baseMetadata(context)
    };
  }

  private predictHighPriorityRecommendations(
    context: AnalyticsContextDto,
    signals: RuleSignals
  ): PredictionDraft | null {
    if (signals.highPriorityRecommendations.length < this.config.highPriorityRecommendationThreshold) {
      return null;
    }

    const riskPoints =
      signals.highPriorityRecommendations.filter((recommendation) => recommendation.priority === "CRITICAL").length *
        3 +
      signals.highPriorityRecommendations.length;
    const factors: PredictionFactorDraft[] = [
      {
        factorType: "HIGH_PRIORITY_RECOMMENDATION_VOLUME",
        source: "analyticsContext.recommendations",
        title: "High priority recommendations",
        description: `${signals.highPriorityRecommendations.length} high or critical recommendation(s) exceed the configured predictive threshold.`,
        impact: riskPoints >= 9 ? "CRITICAL" : "HIGH",
        weight: 45,
        direction: "NEGATIVE",
        evidence: recommendationEvidence(signals.highPriorityRecommendations)
      }
    ];

    return {
      ruleCode: "HIGH_PRIORITY_RECOMMENDATIONS",
      predictionType: "OPERATIONAL_RISK",
      riskLevel: riskFromPoints(riskPoints),
      trend: "DECLINING",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: riskPoints,
        signalConsistency: distinctRecommendationCategories(signals.highPriorityRecommendations).length,
        requiresRecommendations: true
      }),
      summary: "High priority recommendations are accumulating across existing executive outputs.",
      predictedControlScore: projectControlScoreFromRisk(signals.currentScore, riskPoints),
      factors,
      scenarios: buildScenarios("HIGH_PRIORITY_RECOMMENDATIONS", "Operational execution", riskPoints),
      metadata: {
        ...baseMetadata(context),
        recommendationThreshold: this.config.highPriorityRecommendationThreshold
      }
    };
  }

  private predictInventoryRisk(context: AnalyticsContextDto): PredictionDraft | null {
    const inventoryDomains =
      context.dashboardOverview?.domainScores.filter((domain) =>
        textIncludes([domain.domainCode, domain.domainName], ["inventory", "stock", "waste", "spoilage"])
      ) ?? [];
    const lowInventoryDomains = inventoryDomains.filter(
      (domain) => domain.score < this.config.lowDomainScoreThreshold
    );
    const inventoryRecommendations = context.recommendations.filter((recommendation) =>
      ["Inventory", "Waste"].includes(recommendation.category)
    );

    if (lowInventoryDomains.length === 0 && inventoryRecommendations.length === 0) {
      return null;
    }

    const riskPoints = lowInventoryDomains.length * 4 + inventoryRecommendations.length * 2;
    const factors: PredictionFactorDraft[] = [
      {
        factorType: "INVENTORY_DOMAIN_HEALTH",
        source: "analyticsContext.dashboardOverview.domainScores",
        title: "Inventory domain pressure",
        description: `${lowInventoryDomains.length} inventory-related domain(s) are below the configured predictive threshold.`,
        impact: lowInventoryDomains.length > 0 ? "HIGH" : "LOW",
        weight: 35,
        direction: lowInventoryDomains.length > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence:
          lowInventoryDomains.length > 0
            ? lowInventoryDomains.map((domain) => `${domain.domainCode}:${domain.score}`)
            : ["No inventory domain below predictive threshold"]
      },
      {
        factorType: "INVENTORY_RECOMMENDATIONS",
        source: "analyticsContext.recommendations",
        title: "Inventory recommendations",
        description: `${inventoryRecommendations.length} recommendation(s) relate to inventory or waste.`,
        impact: inventoryRecommendations.length > 0 ? "MEDIUM" : "LOW",
        weight: 25,
        direction: inventoryRecommendations.length > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence: recommendationEvidence(inventoryRecommendations)
      }
    ];

    return {
      ruleCode: "INVENTORY_SIGNALS",
      predictionType: "INVENTORY_RISK",
      riskLevel: riskFromPoints(riskPoints),
      trend: lowInventoryDomains.some((domain) => (domain.scoreChange ?? 0) < 0) ? "DECLINING" : "UNKNOWN",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: riskPoints,
        signalConsistency: lowInventoryDomains.length > 0 && inventoryRecommendations.length > 0 ? 3 : 1,
        requiresRecommendations: true
      }),
      summary: "Inventory risk is indicated by existing domain and recommendation outputs.",
      predictedControlScore: projectControlScoreFromRisk(context.controlScore?.score ?? null, riskPoints),
      factors,
      scenarios: buildScenarios("INVENTORY_SIGNALS", "Inventory risk", riskPoints),
      metadata: {
        ...baseMetadata(context),
        domainThreshold: this.config.lowDomainScoreThreshold
      }
    };
  }

  private predictFinancialRisk(
    context: AnalyticsContextDto,
    signals: RuleSignals
  ): PredictionDraft | null {
    const financialDrivers =
      context.dashboardOverview?.topNegativeDrivers.filter((driver) =>
        textIncludes(
          [driver.title, driver.description, driver.domainCode, driver.metricCode],
          ["revenue", "profit", "margin", "cash", "payment", "refund"]
        )
      ) ?? [];

    if (signals.financialRecommendations.length === 0 && financialDrivers.length === 0) {
      return null;
    }

    const riskPoints = signals.financialRecommendations.length * 3 + financialDrivers.length * 2;
    const factors: PredictionFactorDraft[] = [
      {
        factorType: "FINANCIAL_RECOMMENDATIONS",
        source: "analyticsContext.recommendations",
        title: "Financial recommendations",
        description: `${signals.financialRecommendations.length} recommendation(s) reference finance, cash, or revenue controls.`,
        impact: signals.financialRecommendations.length > 0 ? "HIGH" : "LOW",
        weight: 35,
        direction: signals.financialRecommendations.length > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence: recommendationEvidence(signals.financialRecommendations)
      },
      {
        factorType: "FINANCIAL_NEGATIVE_DRIVERS",
        source: "analyticsContext.dashboardOverview.topNegativeDrivers",
        title: "Financial negative drivers",
        description: `${financialDrivers.length} negative driver(s) reference revenue, profit, margin, cash, payment, or refund signals.`,
        impact: financialDrivers.length > 0 ? "MEDIUM" : "LOW",
        weight: 30,
        direction: financialDrivers.length > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence:
          financialDrivers.length > 0
            ? financialDrivers.map((driver) => driver.id)
            : ["No financial negative drivers in Analytics Context"]
      }
    ];

    return {
      ruleCode: "FINANCIAL_SIGNALS",
      predictionType: "FINANCIAL_RISK",
      riskLevel: riskFromPoints(riskPoints),
      trend: riskPoints >= 6 ? "DECLINING" : "UNKNOWN",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: riskPoints,
        signalConsistency: signals.financialRecommendations.length > 0 && financialDrivers.length > 0 ? 3 : 1,
        requiresRecommendations: true
      }),
      summary: "Financial risk is indicated by existing recommendation or dashboard driver outputs.",
      predictedControlScore: projectControlScoreFromRisk(signals.currentScore, riskPoints),
      factors,
      scenarios: buildScenarios("FINANCIAL_SIGNALS", "Financial risk", riskPoints),
      metadata: baseMetadata(context)
    };
  }

  private predictStaffRisk(context: AnalyticsContextDto): PredictionDraft | null {
    const staffDomains =
      context.dashboardOverview?.domainScores.filter((domain) =>
        textIncludes([domain.domainCode, domain.domainName], ["staff", "employee", "labor", "performance"])
      ) ?? [];
    const staffRecommendations = context.recommendations.filter((recommendation) =>
      ["Staff", "Performance"].includes(recommendation.category)
    );
    const lowStaffDomains = staffDomains.filter((domain) => domain.score < this.config.lowDomainScoreThreshold);

    if (staffRecommendations.length === 0 && lowStaffDomains.length === 0) {
      return null;
    }

    const riskPoints = staffRecommendations.length * 2 + lowStaffDomains.length * 4;
    const factors: PredictionFactorDraft[] = [
      {
        factorType: "STAFF_PERFORMANCE_SIGNALS",
        source: "analyticsContext.dashboardOverview.domainScores",
        title: "Staff performance signals",
        description: `${lowStaffDomains.length} staff-related domain(s) are below the configured predictive threshold.`,
        impact: lowStaffDomains.length > 0 ? "HIGH" : "LOW",
        weight: 30,
        direction: lowStaffDomains.length > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence:
          lowStaffDomains.length > 0
            ? lowStaffDomains.map((domain) => `${domain.domainCode}:${domain.score}`)
            : ["No low staff-related domain in Analytics Context"]
      },
      {
        factorType: "STAFF_RECOMMENDATIONS",
        source: "analyticsContext.recommendations",
        title: "Staff recommendations",
        description: `${staffRecommendations.length} recommendation(s) reference staff or performance.`,
        impact: staffRecommendations.length > 0 ? "MEDIUM" : "LOW",
        weight: 25,
        direction: staffRecommendations.length > 0 ? "NEGATIVE" : "NEUTRAL",
        evidence: recommendationEvidence(staffRecommendations)
      }
    ];

    return {
      ruleCode: "STAFF_SIGNALS",
      predictionType: "STAFF_RISK",
      riskLevel: riskFromPoints(riskPoints),
      trend: lowStaffDomains.some((domain) => (domain.scoreChange ?? 0) < 0) ? "DECLINING" : "UNKNOWN",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: riskPoints,
        signalConsistency: staffRecommendations.length > 0 && lowStaffDomains.length > 0 ? 3 : 1,
        requiresRecommendations: true
      }),
      summary: "Staff risk is indicated by existing staff performance and recommendation signals.",
      predictedControlScore: projectControlScoreFromRisk(context.controlScore?.score ?? null, riskPoints),
      factors,
      scenarios: buildScenarios("STAFF_SIGNALS", "Staff risk", riskPoints),
      metadata: baseMetadata(context)
    };
  }

  private predictHealthyStableBusiness(
    context: AnalyticsContextDto,
    signals: RuleSignals
  ): PredictionDraft | null {
    if (
      signals.currentScore === null ||
      signals.currentScore < this.config.healthyControlScoreThreshold ||
      signals.criticalIncidents.length > 0 ||
      signals.highPriorityRecommendations.length > 0
    ) {
      return null;
    }

    const factors: PredictionFactorDraft[] = [
      {
        factorType: "HEALTHY_STABLE_BUSINESS",
        source: "analyticsContext.controlScore",
        title: "Healthy Control Score",
        description: `Control Score is ${signals.currentScore} with no unresolved critical incidents or high-priority recommendations.`,
        impact: "LOW",
        weight: 40,
        direction: "POSITIVE",
        evidence: [
          `currentScore=${signals.currentScore}`,
          `criticalIncidents=${signals.criticalIncidents.length}`,
          `highPriorityRecommendations=${signals.highPriorityRecommendations.length}`
        ]
      }
    ];

    return {
      ruleCode: "HEALTHY_STABLE_BUSINESS",
      predictionType: "CONTROL_SCORE",
      riskLevel: "LOW",
      trend: signals.scoreChange !== null && signals.scoreChange > 0 ? "IMPROVING" : "STABLE",
      confidence: calculateConfidence(context, {
        factors,
        severityStrength: 1,
        signalConsistency: 4,
        requiresScore: true,
        requiresHistory: true
      }),
      summary: "Business health is stable based on existing Control Score and risk outputs.",
      predictedControlScore: signals.currentScore,
      factors,
      scenarios: buildScenarios("HEALTHY_STABLE_BUSINESS", "Business health", 1),
      metadata: {
        ...baseMetadata(context),
        healthyScoreThreshold: this.config.healthyControlScoreThreshold
      }
    };
  }

  private toPrediction(input: PredictionRuleInput, draft: PredictionDraft) {
    const predictionId = buildPredictionId(
      input.context,
      draft.predictionType,
      draft.ruleCode,
      input.predictionWindow
    );

    return new Prediction({
      id: predictionId,
      tenantId: input.context.tenantId,
      businessUnitId: input.context.businessUnitId,
      predictionType: draft.predictionType,
      predictionWindow: input.predictionWindow,
      riskLevel: draft.riskLevel,
      trend: draft.trend,
      confidence: draft.confidence,
      summary: draft.summary,
      predictedControlScore: draft.predictedControlScore,
      factors: draft.factors.map(
        (factor, index) =>
          new PredictionFactor({
            ...factor,
            id: `${predictionId}:factor:${slug(factor.factorType)}:${index + 1}`,
            predictionId
          })
      ),
      scenarios: draft.scenarios.map(
        (scenario, index) =>
          new PredictionScenario({
            ...scenario,
            id: `${predictionId}:scenario:${slug(scenario.scenarioType)}:${index + 1}`,
            predictionId
          })
      ),
      createdAt: input.createdAt,
      metadata: {
        ...draft.metadata,
        ruleCode: draft.ruleCode,
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

    const confidenceDifference = right.confidence - left.confidence;

    if (confidenceDifference !== 0) {
      return confidenceDifference;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

function buildSignals(context: AnalyticsContextDto): RuleSignals {
  const trendDirections = context.dashboardOverview?.trend.slice(0, 3).map((point) => point.direction) ?? [];

  return {
    currentScore: context.controlScore?.score ?? null,
    previousScore: context.controlScore?.previousScore ?? null,
    scoreChange: context.controlScore?.scoreChange ?? null,
    consecutiveDeclines: trendDirections.filter((direction) => direction === "down").length,
    unresolvedIncidents: context.incidents.filter((incident) => incident.status !== "RESOLVED"),
    criticalIncidents: context.incidents.filter(
      (incident) =>
        incident.status !== "RESOLVED" &&
        (incident.severity === "critical" || incident.severity === "severe")
    ),
    fraudRecommendations: context.recommendations.filter((recommendation) =>
      textIncludes(
        [recommendation.category, recommendation.title, recommendation.description],
        ["fraud", "refund", "suspicious"]
      )
    ),
    highPriorityRecommendations: context.recommendations.filter(
      (recommendation) => recommendation.priority === "HIGH" || recommendation.priority === "CRITICAL"
    ),
    inventoryRecommendations: context.recommendations.filter((recommendation) =>
      ["Inventory", "Waste"].includes(recommendation.category)
    ),
    financialRecommendations: context.recommendations.filter((recommendation) =>
      ["Finance", "Cash"].includes(recommendation.category)
    ),
    staffRecommendations: context.recommendations.filter((recommendation) =>
      ["Staff", "Performance"].includes(recommendation.category)
    )
  };
}

function buildScenarios(
  ruleCode: string,
  subject: string,
  riskPoints: number
): PredictionScenarioDraft[] {
  const riskLevel = riskFromPoints(riskPoints);

  return [
    {
      scenarioType: "BASE_CASE",
      title: `${subject} base case`,
      description: `${subject} follows the current Analytics Context signal pattern.`,
      expectedImpact:
        riskLevel === "LOW"
          ? "Risk remains contained if current controls continue."
          : `${riskLevel} risk persists without focused operational follow-up.`,
      confidence: clampConfidence(60 + Math.min(riskPoints, 8) * 3),
      assumptions: [
        "Analytics Context remains the only prediction input.",
        `Rule ${ruleCode} continues to match current source outputs.`
      ]
    },
    {
      scenarioType: "WATCHLIST",
      title: `${subject} watchlist case`,
      description: `${subject} worsens if unresolved signals continue accumulating.`,
      expectedImpact:
        riskLevel === "CRITICAL"
          ? "Executive intervention is likely required to prevent further control deterioration."
          : "Risk may move to the next severity level if upstream signals deteriorate.",
      confidence: clampConfidence(50 + Math.min(riskPoints, 10) * 2),
      assumptions: [
        "No new recommendations, notifications, or incidents are generated by predictive analytics.",
        "Future source modules keep publishing Analytics Context-compatible outputs."
      ]
    }
  ];
}

function calculateConfidence(
  context: AnalyticsContextDto,
  input: {
    factors: PredictionFactorDraft[];
    severityStrength: number;
    signalConsistency: number;
    requiresScore?: boolean;
    requiresHistory?: boolean;
    requiresIncidents?: boolean;
    requiresRecommendations?: boolean;
  }
) {
  let confidence = 50;

  confidence += sourceCompletenessScore(context);
  confidence += Math.min(input.signalConsistency, 4) * 4;
  confidence += Math.min(input.severityStrength, 10) * 3;
  confidence += Math.min(input.factors.length, 4) * 4;

  if (input.requiresScore && !context.controlScore) {
    confidence -= 10;
  }

  if (input.requiresHistory && context.controlScore?.previousScore === null) {
    confidence -= 8;
  }

  if (input.requiresIncidents && context.incidents.length === 0) {
    confidence -= 4;
  }

  if (input.requiresRecommendations && context.recommendations.length === 0) {
    confidence -= 4;
  }

  return clampConfidence(confidence);
}

function sourceCompletenessScore(context: AnalyticsContextDto) {
  const sourceSignals = [
    context.controlScore !== null,
    context.dashboardOverview !== null,
    context.recommendations.length > 0,
    context.notifications.length > 0 || context.incidents.length > 0,
    context.fraudInsights.totalIncidents > 0 || context.fraudInsights.recentIncidents.length > 0,
    context.auditHighlights.length > 0,
    context.executiveSummary !== null
  ];
  const availableSources = sourceSignals.filter(Boolean).length;

  return Math.round((availableSources / sourceSignals.length) * 20);
}

function buildPredictionId(
  context: AnalyticsContextDto,
  predictionType: PredictionType,
  ruleCode: string,
  predictionWindow: PredictionWindow
) {
  const scope = context.businessUnitId ?? "tenant";
  const sourceSignature =
    context.controlScore?.id ??
    context.incidents[0]?.id ??
    context.recommendations[0]?.id ??
    "no-source";

  return [
    "prediction",
    context.tenantId,
    scope,
    predictionType,
    ruleCode,
    predictionWindow,
    sourceSignature
  ]
    .map(slug)
    .join(":");
}

function riskFromPoints(points: number): PredictionRiskLevel {
  if (points >= 10) {
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

function riskRank(riskLevel: PredictionRiskLevel) {
  const ranks: Record<PredictionRiskLevel, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  return ranks[riskLevel];
}

function projectControlScore(
  currentScore: number | null,
  scoreChange: number | null,
  riskPoints: number
) {
  if (currentScore === null) {
    return null;
  }

  const trendDelta = scoreChange === null ? 0 : Math.max(-12, Math.min(8, scoreChange));
  const riskDrag = riskPoints >= 10 ? -5 : riskPoints >= 6 ? -3 : riskPoints >= 3 ? -1 : 0;

  return clampScore(currentScore + trendDelta + riskDrag);
}

function projectControlScoreFromRisk(currentScore: number | null, riskPoints: number) {
  if (currentScore === null) {
    return null;
  }

  const riskDrag = riskPoints >= 10 ? -8 : riskPoints >= 6 ? -5 : riskPoints >= 3 ? -2 : 0;

  return clampScore(currentScore + riskDrag);
}

function recommendationEvidence(recommendations: AnalyticsContextDto["recommendations"]) {
  if (recommendations.length === 0) {
    return ["No matching recommendations in Analytics Context"];
  }

  return recommendations.slice(0, 5).map((recommendation) => recommendation.id);
}

function distinctRecommendationCategories(recommendations: AnalyticsContextDto["recommendations"]) {
  return [...new Set(recommendations.map((recommendation) => recommendation.category))];
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

function clampScore(value: number) {
  return Number(Math.min(100, Math.max(0, value)).toFixed(2));
}

function clampConfidence(value: number) {
  return Number(Math.min(100, Math.max(0, value)).toFixed(2));
}

function slug(value: string) {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return normalized.length > 0 ? normalized : "UNKNOWN";
}

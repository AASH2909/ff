import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";
import type { TimelineEntryDto } from "@/timeline/application";
import {
  DecisionAction,
  DecisionImpact,
  DecisionScenario,
  type DecisionActionProps,
  type DecisionImpactProps,
  type DecisionScenarioMetadata
} from "@/decision/domain/entities";
import type { DecisionPriority, ScenarioType } from "@/decision/domain/value-objects";

export type DecisionScenarioRuleInput = {
  context: AnalyticsContextDto;
  predictions: PredictionDto[];
  timelineEntries: TimelineEntryDto[];
  createdAt: Date;
};

type ExistingIncident = AnalyticsContextDto["incidents"][number];
type ExistingRecommendation = AnalyticsContextDto["recommendations"][number];
type ExistingDomain = NonNullable<AnalyticsContextDto["dashboardOverview"]>["domainScores"][number];

type DecisionActionDraft = Omit<DecisionActionProps, "id" | "scenarioId">;

type DecisionScenarioDraft = {
  ruleCode: string;
  scenarioType: ScenarioType;
  title: string;
  description: string;
  estimatedImpact: DecisionImpactProps;
  confidence: number;
  assumptions: string[];
  risks: string[];
  actions: DecisionActionDraft[];
  sourceIds: string[];
  metadata?: DecisionScenarioMetadata;
};

type DecisionSignals = {
  unresolvedCriticalIncidents: ExistingIncident[];
  criticalTimelineEntries: TimelineEntryDto[];
  highRiskPredictions: PredictionDto[];
  fraudRiskPredictions: PredictionDto[];
  inventoryRiskPredictions: PredictionDto[];
  operationalRiskPredictions: PredictionDto[];
  decliningPredictions: PredictionDto[];
  highPriorityRecommendations: ExistingRecommendation[];
  lowInventoryDomains: ExistingDomain[];
};

export class DecisionScenarioRuleEngine {
  generate(input: DecisionScenarioRuleInput): DecisionScenario[] {
    const signals = buildSignals(input.context, input.predictions, input.timelineEntries);
    const drafts = [
      this.resolveCriticalIncidents(input, signals),
      this.executeHighPriorityRecommendations(input, signals),
      this.reduceFraudRisk(input, signals),
      this.improveInventoryControl(input, signals),
      this.improveOperations(input, signals),
      this.stabilizeControlScore(input, signals),
      this.maintainStableOperations(input, signals)
    ].filter((draft): draft is DecisionScenarioDraft => draft !== null);

    return sortDecisionScenarios(drafts.map((draft) => this.toScenario(input, draft)));
  }

  private resolveCriticalIncidents(
    input: DecisionScenarioRuleInput,
    signals: DecisionSignals
  ): DecisionScenarioDraft | null {
    if (signals.unresolvedCriticalIncidents.length === 0) {
      return null;
    }

    const incidentCount = signals.unresolvedCriticalIncidents.length;
    const sourceIds = signals.unresolvedCriticalIncidents.map((incident) => incident.id);

    return {
      ruleCode: "UNRESOLVED_CRITICAL_INCIDENTS",
      scenarioType: "RESOLVE_CRITICAL_INCIDENTS",
      title: "Resolve critical incidents first",
      description:
        "Unresolved critical or severe incidents are the highest-confidence next action because they represent current control exposure.",
      estimatedImpact: {
        controlScoreDelta: 6 + Math.min(incidentCount * 2, 8),
        riskLevelChange: incidentCount >= 3 ? "CRITICAL_TO_HIGH" : "HIGH_TO_MEDIUM",
        estimatedTimeToImpact: "24-48 hours",
        affectedDomains: affectedDomainsFromIncidents(signals.unresolvedCriticalIncidents)
      },
      confidence: clampConfidence(70 + Math.min(incidentCount, 4) * 6),
      assumptions: [
        "Incident status in Analytics Context reflects the current unresolved workload.",
        "Operational owners can contain the listed incidents without creating new notifications.",
        "Existing timeline entries are read-only evidence for scenario explanation."
      ],
      risks: [
        "Resolution may be delayed if the incident owner or source system is unavailable.",
        "Treating symptoms without root-cause follow-up may allow recurrence.",
        "Parallel incidents can compete for the same operational capacity."
      ],
      actions: [
        {
          actionType: "TRIAGE_CRITICAL_INCIDENTS",
          title: "Triage all unresolved critical incidents",
          description:
            "Review the critical incident queue, confirm ownership, and separate containment work from root-cause work.",
          expectedEffect: "Creates a single accountable path to reduce immediate control exposure.",
          effort: "MEDIUM",
          priority: "CRITICAL"
        },
        {
          actionType: "CONTAIN_ACTIVE_EXPOSURE",
          title: "Contain active exposure",
          description:
            "Apply operational holds, manual checks, or temporary approval gates for the affected process until the incident is resolved.",
          expectedEffect: "Limits additional impact while the underlying issue is corrected.",
          effort: "MEDIUM",
          priority: "CRITICAL"
        },
        {
          actionType: "VERIFY_INCIDENT_CLOSURE",
          title: "Verify closure evidence",
          description:
            "Confirm each critical incident has a closing note, owner confirmation, and a recorded resolution timestamp.",
          expectedEffect: "Prevents stale unresolved incidents from continuing to distort executive action.",
          effort: "LOW",
          priority: "HIGH"
        }
      ],
      sourceIds,
      metadata: {
        ...baseMetadata(input, sourceIds),
        unresolvedCriticalIncidentCount: incidentCount,
        criticalTimelineEntryCount: signals.criticalTimelineEntries.length
      }
    };
  }

  private executeHighPriorityRecommendations(
    input: DecisionScenarioRuleInput,
    signals: DecisionSignals
  ): DecisionScenarioDraft | null {
    if (signals.highPriorityRecommendations.length === 0) {
      return null;
    }

    const recommendations = signals.highPriorityRecommendations.slice(0, 5);
    const criticalCount = recommendations.filter(
      (recommendation) => recommendation.priority === "CRITICAL"
    ).length;
    const sourceIds = recommendations.map((recommendation) => recommendation.id);

    return {
      ruleCode: "EXISTING_HIGH_PRIORITY_RECOMMENDATIONS",
      scenarioType: "EXECUTE_HIGH_PRIORITY_RECOMMENDATIONS",
      title: "Execute high-priority decisions already on the table",
      description:
        "Analytics Context already contains high or critical priority recommendations, so the next decision is disciplined execution rather than generating more advice.",
      estimatedImpact: {
        controlScoreDelta: 4 + Math.min(recommendations.length + criticalCount, 6),
        riskLevelChange: criticalCount > 0 ? "CRITICAL_TO_HIGH" : "HIGH_TO_MEDIUM",
        estimatedTimeToImpact: "2-5 days",
        affectedDomains: affectedDomainsFromRecommendations(recommendations)
      },
      confidence: clampConfidence(62 + recommendations.length * 5 + criticalCount * 5),
      assumptions: [
        "The recommendation set already exists in Analytics Context and is not generated by Decision.",
        "Recommendation priority remains valid for the requested scope.",
        "Execution owners can work from the existing recommendation descriptions."
      ],
      risks: [
        "High-priority actions may conflict if they require the same operational team.",
        "Execution without acceptance criteria can produce activity without measurable closure.",
        "Older recommendations may need quick validation before work starts."
      ],
      actions: [
        {
          actionType: "SELECT_TOP_EXISTING_RECOMMENDATIONS",
          title: "Select the top existing recommendations",
          description:
            "Choose the highest-priority existing recommendations for immediate execution and explicitly defer the rest.",
          expectedEffect: "Focuses decision capacity on the most material existing work.",
          effort: "LOW",
          priority: criticalCount > 0 ? "CRITICAL" : "HIGH"
        },
        {
          actionType: "ASSIGN_EXECUTION_OWNERS",
          title: "Assign execution owners",
          description:
            "Attach an owner, due date, and acceptance signal to each selected recommendation.",
          expectedEffect: "Turns existing recommendation output into accountable operational work.",
          effort: "LOW",
          priority: "HIGH"
        },
        {
          actionType: "REVIEW_EXECUTION_PROGRESS",
          title: "Review progress against acceptance signals",
          description:
            "Check whether selected actions changed the source risks that made them high priority.",
          expectedEffect: "Keeps Decision focused on outcomes rather than generating additional recommendations.",
          effort: "MEDIUM",
          priority: "HIGH"
        }
      ],
      sourceIds,
      metadata: {
        ...baseMetadata(input, sourceIds),
        highPriorityRecommendationCount: signals.highPriorityRecommendations.length,
        criticalRecommendationCount: criticalCount
      }
    };
  }

  private reduceFraudRisk(
    input: DecisionScenarioRuleInput,
    signals: DecisionSignals
  ): DecisionScenarioDraft | null {
    if (signals.fraudRiskPredictions.length === 0) {
      return null;
    }

    const highestRisk = highestPredictionRisk(signals.fraudRiskPredictions);
    const sourceIds = signals.fraudRiskPredictions.map((prediction) => prediction.id);

    return {
      ruleCode: "FRAUD_RISK_PREDICTION",
      scenarioType: "REDUCE_FRAUD_RISK",
      title: "Reduce fraud risk exposure",
      description:
        "A fraud risk prediction exists, so the next business action is targeted containment and review of fraud-sensitive workflows.",
      estimatedImpact: {
        controlScoreDelta: highestRisk === "CRITICAL" ? 9 : highestRisk === "HIGH" ? 7 : 4,
        riskLevelChange: reducedRiskChange(highestRisk),
        estimatedTimeToImpact: "24 hours to 7 days",
        affectedDomains: uniqueNonEmptyStrings(["Fraud", "Cash", "Operations"])
      },
      confidence: predictionBackedConfidence(signals.fraudRiskPredictions, 60),
      assumptions: [
        "Fraud risk comes from existing Predictive outputs and Analytics Context evidence.",
        "Decision does not create fraud incidents or notifications.",
        "Manual review capacity is available for the highest-risk transactions or workflows."
      ],
      risks: [
        "Overly broad review can slow legitimate operations.",
        "Fraud signals may be stale if source incidents were resolved outside the current context.",
        "Containment may need adjustment after review evidence is collected."
      ],
      actions: [
        {
          actionType: "REVIEW_FRAUD_SIGNALS",
          title: "Review the fraud-risk prediction evidence",
          description:
            "Use the prediction factors and current context to identify the specific workflow or transaction class driving the fraud signal.",
          expectedEffect: "Separates actionable fraud exposure from broad operational noise.",
          effort: "MEDIUM",
          priority: highestRisk === "CRITICAL" ? "CRITICAL" : "HIGH"
        },
        {
          actionType: "TIGHTEN_APPROVAL_GATES",
          title: "Tighten approval gates",
          description:
            "Temporarily require stronger review for refunds, manual discounts, voids, or other fraud-sensitive actions named by source evidence.",
          expectedEffect: "Reduces near-term fraud opportunity while investigation continues.",
          effort: "LOW",
          priority: "HIGH"
        },
        {
          actionType: "COMPARE_POST_REVIEW_SIGNALS",
          title: "Compare post-review signals",
          description:
            "Recheck whether the same fraud-risk prediction or timeline signal persists after containment.",
          expectedEffect: "Confirms whether containment changed the existing risk signal.",
          effort: "LOW",
          priority: "MEDIUM"
        }
      ],
      sourceIds,
      metadata: {
        ...baseMetadata(input, sourceIds),
        fraudPredictionCount: signals.fraudRiskPredictions.length,
        highestFraudRiskLevel: highestRisk
      }
    };
  }

  private improveInventoryControl(
    input: DecisionScenarioRuleInput,
    signals: DecisionSignals
  ): DecisionScenarioDraft | null {
    if (signals.inventoryRiskPredictions.length === 0 && signals.lowInventoryDomains.length === 0) {
      return null;
    }

    const sourceIds = [
      ...signals.inventoryRiskPredictions.map((prediction) => prediction.id),
      ...signals.lowInventoryDomains.map((domain) => domain.domainCode)
    ];
    const highestRisk = highestPredictionRisk(signals.inventoryRiskPredictions);

    return {
      ruleCode: "INVENTORY_CONTROL_RISK",
      scenarioType: "IMPROVE_INVENTORY_CONTROL",
      title: "Improve inventory control",
      description:
        "Inventory risk is present in existing predictions or low inventory-domain signals, so the next action is a targeted control pass over stock movement.",
      estimatedImpact: {
        controlScoreDelta: highestRisk === "CRITICAL" ? 8 : highestRisk === "HIGH" ? 6 : 3,
        riskLevelChange: reducedRiskChange(highestRisk),
        estimatedTimeToImpact: "3-7 days",
        affectedDomains: uniqueNonEmptyStrings(["Inventory", "Operations", "Waste"])
      },
      confidence: clampConfidence(
        predictionBackedConfidence(signals.inventoryRiskPredictions, 54) +
          Math.min(signals.lowInventoryDomains.length, 3) * 4
      ),
      assumptions: [
        "Inventory signals come from Analytics Context and existing Predictive outputs.",
        "Stock counts, waste records, and receiving logs are available for operational review.",
        "No new inventory recommendation is generated by Decision."
      ],
      risks: [
        "Inventory variance may be caused by delayed source-system updates.",
        "Control changes can slow receiving or kitchen operations if applied too broadly.",
        "One-time counts will not fix recurring process leakage without owner follow-through."
      ],
      actions: [
        {
          actionType: "RECONCILE_HIGH_VARIANCE_ITEMS",
          title: "Reconcile high-variance items",
          description:
            "Prioritize count and movement review for inventory areas named by prediction or domain evidence.",
          expectedEffect: "Identifies whether the risk is a data delay, process gap, or stock loss.",
          effort: "MEDIUM",
          priority: highestRisk === "CRITICAL" ? "CRITICAL" : "HIGH"
        },
        {
          actionType: "CHECK_RECEIVING_AND_WASTE_LOGS",
          title: "Check receiving and waste logs",
          description:
            "Compare receiving, transfer, and waste records against current stock movement for mismatches.",
          expectedEffect: "Reduces avoidable inventory-control drift.",
          effort: "MEDIUM",
          priority: "HIGH"
        },
        {
          actionType: "LOCK_IN_CONTROL_CADENCE",
          title: "Lock in a control cadence",
          description:
            "Schedule a short follow-up cycle for the affected inventory domain until the risk signal clears.",
          expectedEffect: "Prevents a one-time correction from fading without verification.",
          effort: "LOW",
          priority: "MEDIUM"
        }
      ],
      sourceIds,
      metadata: {
        ...baseMetadata(input, sourceIds),
        inventoryPredictionCount: signals.inventoryRiskPredictions.length,
        lowInventoryDomainCount: signals.lowInventoryDomains.length
      }
    };
  }

  private improveOperations(
    input: DecisionScenarioRuleInput,
    signals: DecisionSignals
  ): DecisionScenarioDraft | null {
    if (signals.operationalRiskPredictions.length === 0) {
      return null;
    }

    const sourceIds = signals.operationalRiskPredictions.map((prediction) => prediction.id);
    const highestRisk = highestPredictionRisk(signals.operationalRiskPredictions);

    return {
      ruleCode: "HIGH_RISK_PREDICTIONS",
      scenarioType: "IMPROVE_OPERATIONS",
      title: "Mitigate high-risk operational predictions",
      description:
        "High or critical predictions are present, so the next business move is to mitigate the operational source of those predictions.",
      estimatedImpact: {
        controlScoreDelta: highestRisk === "CRITICAL" ? 8 : 5,
        riskLevelChange: reducedRiskChange(highestRisk),
        estimatedTimeToImpact: "2-7 days",
        affectedDomains: affectedDomainsFromPredictions(signals.operationalRiskPredictions)
      },
      confidence: predictionBackedConfidence(signals.operationalRiskPredictions, 58),
      assumptions: [
        "Prediction risk levels were already produced by the Predictive module.",
        "Decision uses prediction factors for explanation and does not calculate new risk scores.",
        "Operational owners can act on the affected domains without new system-generated recommendations."
      ],
      risks: [
        "A broad operational mitigation may miss the specific factor driving the prediction.",
        "Multiple high-risk predictions can require sequencing to avoid execution overload.",
        "Risk may remain elevated until source metrics refresh."
      ],
      actions: [
        {
          actionType: "ISOLATE_TOP_PREDICTION_FACTORS",
          title: "Isolate top prediction factors",
          description:
            "Read the highest-risk prediction factors and identify the shared operational process behind them.",
          expectedEffect: "Focuses mitigation on the actual source signals behind the prediction.",
          effort: "LOW",
          priority: highestRisk === "CRITICAL" ? "CRITICAL" : "HIGH"
        },
        {
          actionType: "APPLY_TARGETED_CONTROL",
          title: "Apply a targeted control",
          description:
            "Temporarily strengthen approval, staffing, review, or checklist controls in the affected domain.",
          expectedEffect: "Reduces the probability that the predicted operational risk materializes.",
          effort: "MEDIUM",
          priority: "HIGH"
        },
        {
          actionType: "RECHECK_PREDICTION_AFTER_CONTROL",
          title: "Recheck prediction after control",
          description:
            "Compare the next persisted prediction with the current high-risk scenario before expanding the response.",
          expectedEffect: "Keeps mitigation tied to deterministic evidence.",
          effort: "LOW",
          priority: "MEDIUM"
        }
      ],
      sourceIds,
      metadata: {
        ...baseMetadata(input, sourceIds),
        highRiskPredictionCount: signals.highRiskPredictions.length,
        operationalRiskPredictionCount: signals.operationalRiskPredictions.length,
        highestOperationalRiskLevel: highestRisk
      }
    };
  }

  private stabilizeControlScore(
    input: DecisionScenarioRuleInput,
    signals: DecisionSignals
  ): DecisionScenarioDraft | null {
    if (signals.decliningPredictions.length === 0) {
      return null;
    }

    const sourceIds = signals.decliningPredictions.map((prediction) => prediction.id);
    const highestRisk = highestPredictionRisk(signals.decliningPredictions);

    return {
      ruleCode: "DECLINING_PREDICTION_TREND",
      scenarioType: "STABILIZE_CONTROL_SCORE",
      title: "Stabilize the Control Score trend",
      description:
        "At least one prediction is declining, so the next decision is to stabilize the underlying controls before expanding new initiatives.",
      estimatedImpact: {
        controlScoreDelta: highestRisk === "CRITICAL" ? 7 : highestRisk === "HIGH" ? 5 : 3,
        riskLevelChange: reducedRiskChange(highestRisk),
        estimatedTimeToImpact: "3-10 days",
        affectedDomains: affectedDomainsFromPredictions(signals.decliningPredictions)
      },
      confidence: predictionBackedConfidence(signals.decliningPredictions, 57),
      assumptions: [
        "Declining trend comes from existing Predictive outputs.",
        "Decision estimates directional impact but does not calculate a Control Score.",
        "Source metrics will refresh after operational controls are applied."
      ],
      risks: [
        "Score stabilization may lag behind actual operational improvement.",
        "Treating all declining predictions equally can underweight urgent domain-specific risks.",
        "A declining trend may be caused by a source data correction rather than a business deterioration."
      ],
      actions: [
        {
          actionType: "IDENTIFY_DECLINING_DOMAINS",
          title: "Identify the declining domains",
          description:
            "Map declining predictions to their affected domains and rank them by risk level and confidence.",
          expectedEffect: "Creates a clear stabilization sequence without recalculating score.",
          effort: "LOW",
          priority: highestRisk === "CRITICAL" ? "CRITICAL" : "HIGH"
        },
        {
          actionType: "STABILIZE_HIGHEST_RISK_DOMAIN",
          title: "Stabilize the highest-risk domain",
          description:
            "Focus operational controls on the highest-risk declining domain before moving to lower-risk areas.",
          expectedEffect: "Improves the chance of halting the downward trend quickly.",
          effort: "MEDIUM",
          priority: "HIGH"
        },
        {
          actionType: "CONFIRM_TREND_DIRECTION",
          title: "Confirm trend direction",
          description:
            "Wait for the next persisted prediction and compare trend direction before broadening the response.",
          expectedEffect: "Prevents overreaction to a single deterministic signal.",
          effort: "LOW",
          priority: "MEDIUM"
        }
      ],
      sourceIds,
      metadata: {
        ...baseMetadata(input, sourceIds),
        decliningPredictionCount: signals.decliningPredictions.length,
        highestDecliningRiskLevel: highestRisk
      }
    };
  }

  private maintainStableOperations(
    input: DecisionScenarioRuleInput,
    signals: DecisionSignals
  ): DecisionScenarioDraft | null {
    if (
      signals.unresolvedCriticalIncidents.length > 0 ||
      signals.highRiskPredictions.length > 0
    ) {
      return null;
    }

    const sourceIds = [
      input.context.controlScore?.id ?? input.context.generatedAt,
      ...input.predictions.slice(0, 3).map((prediction) => prediction.id)
    ];

    return {
      ruleCode: "NO_CRITICAL_OR_HIGH_RISK_SIGNALS",
      scenarioType: "MAINTAIN_STABLE_OPERATIONS",
      title: "Maintain stable operations",
      description:
        "No unresolved critical incidents or high-risk predictions are present, so the next action is to preserve cadence and watch for drift.",
      estimatedImpact: {
        controlScoreDelta: 1,
        riskLevelChange: "UNCHANGED",
        estimatedTimeToImpact: "7-14 days",
        affectedDomains: uniqueNonEmptyStrings(["Operations", "Control Score"])
      },
      confidence: clampConfidence(64 + Math.min(input.predictions.length, 4) * 3),
      assumptions: [
        "No critical incident is unresolved in Analytics Context.",
        "No existing prediction has HIGH or CRITICAL risk level.",
        "Stable operations benefit more from cadence preservation than new intervention."
      ],
      risks: [
        "Low or medium risks can worsen if monitoring cadence slips.",
        "Source systems may not have published every recent operational signal yet.",
        "Over-optimizing stable processes can consume capacity needed for future incidents."
      ],
      actions: [
        {
          actionType: "PRESERVE_CONTROL_CADENCE",
          title: "Preserve control cadence",
          description:
            "Keep the current review rhythm for incidents, predictions, and timeline evidence.",
          expectedEffect: "Maintains operational visibility without adding unnecessary work.",
          effort: "LOW",
          priority: "MEDIUM"
        },
        {
          actionType: "WATCH_MEDIUM_RISKS",
          title: "Watch medium risks",
          description:
            "Keep medium-risk predictions visible and only escalate if risk or trend worsens.",
          expectedEffect: "Prevents avoidable escalation while keeping a clear trigger for action.",
          effort: "LOW",
          priority: "MEDIUM"
        },
        {
          actionType: "PROTECT_TEAM_CAPACITY",
          title: "Protect team capacity",
          description:
            "Avoid launching additional control projects unless existing signals materially change.",
          expectedEffect: "Keeps teams ready for higher-value intervention if conditions deteriorate.",
          effort: "LOW",
          priority: "LOW"
        }
      ],
      sourceIds,
      metadata: {
        ...baseMetadata(input, sourceIds),
        highRiskPredictionCount: 0,
        unresolvedCriticalIncidentCount: 0
      }
    };
  }

  private toScenario(input: DecisionScenarioRuleInput, draft: DecisionScenarioDraft) {
    const scenarioId = buildScenarioId(input.context, draft.scenarioType, draft.sourceIds);
    const actions = draft.actions.map(
      (action, index) =>
        new DecisionAction({
          ...action,
          id: `${scenarioId}:action:${slug(action.actionType)}:${index + 1}`,
          scenarioId
        })
    );

    return new DecisionScenario({
      id: scenarioId,
      tenantId: input.context.tenantId,
      businessUnitId: input.context.businessUnitId,
      scenarioType: draft.scenarioType,
      title: draft.title,
      description: draft.description,
      estimatedImpact: new DecisionImpact(draft.estimatedImpact),
      confidence: draft.confidence,
      assumptions: draft.assumptions,
      risks: draft.risks,
      actions,
      createdAt: input.createdAt,
      metadata: {
        ...draft.metadata,
        ruleCode: draft.ruleCode
      }
    });
  }
}

export function sortDecisionScenarios(scenarios: DecisionScenario[]) {
  return [...scenarios].sort((left, right) => {
    const priorityDifference = scenarioRank(right) - scenarioRank(left);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const confidenceDifference = right.confidence - left.confidence;

    if (confidenceDifference !== 0) {
      return confidenceDifference;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

function buildSignals(
  context: AnalyticsContextDto,
  predictions: PredictionDto[],
  timelineEntries: TimelineEntryDto[]
): DecisionSignals {
  const unresolvedCriticalIncidents = context.incidents.filter(
    (incident) =>
      incident.status !== "RESOLVED" &&
      (incident.severity === "critical" || incident.severity === "severe")
  );
  const highRiskPredictions = predictions.filter(
    (prediction) => prediction.riskLevel === "HIGH" || prediction.riskLevel === "CRITICAL"
  );

  return {
    unresolvedCriticalIncidents,
    criticalTimelineEntries: timelineEntries.filter(
      (entry) =>
        entry.eventType === "INCIDENT_SIGNAL" &&
        (entry.severity === "CRITICAL" || entry.severity === "SEVERE") &&
        readStringMetadata(entry.metadata, "status") !== "RESOLVED"
    ),
    highRiskPredictions,
    fraudRiskPredictions: predictions.filter(
      (prediction) => prediction.predictionType === "FRAUD_RISK"
    ),
    inventoryRiskPredictions: predictions.filter(
      (prediction) => prediction.predictionType === "INVENTORY_RISK"
    ),
    operationalRiskPredictions: highRiskPredictions.filter(
      (prediction) =>
        prediction.predictionType !== "FRAUD_RISK" &&
        prediction.predictionType !== "INVENTORY_RISK" &&
        prediction.predictionType !== "CONTROL_SCORE"
    ),
    decliningPredictions: predictions.filter((prediction) => prediction.trend === "DECLINING"),
    highPriorityRecommendations: context.recommendations.filter(
      (recommendation) =>
        recommendation.priority === "HIGH" || recommendation.priority === "CRITICAL"
    ),
    lowInventoryDomains:
      context.dashboardOverview?.domainScores.filter(
        (domain) =>
          domain.score < 70 &&
          textIncludes([domain.domainCode, domain.domainName], ["inventory", "stock", "waste"])
      ) ?? []
  };
}

function baseMetadata(
  input: DecisionScenarioRuleInput,
  sourceIds: string[]
): DecisionScenarioMetadata {
  return {
    analyticsGeneratedAt: input.context.generatedAt,
    sourceControlScoreId: input.context.controlScore?.id ?? null,
    sourcePredictionIds: input.predictions.slice(0, 10).map((prediction) => prediction.id),
    sourceTimelineEntryIds: input.timelineEntries.slice(0, 10).map((entry) => entry.id),
    matchedSourceIds: uniqueNonEmptyStrings(sourceIds).slice(0, 20),
    sourcePredictionCount: input.predictions.length,
    sourceTimelineEntryCount: input.timelineEntries.length
  };
}

function affectedDomainsFromIncidents(incidents: ExistingIncident[]) {
  const domains = incidents.map((incident) => titleCase(incident.category));

  return uniqueNonEmptyStrings(domains.length > 0 ? domains : ["Operations"]);
}

function affectedDomainsFromRecommendations(recommendations: ExistingRecommendation[]) {
  const domains = recommendations.map((recommendation) => titleCase(recommendation.category));

  return uniqueNonEmptyStrings(domains.length > 0 ? domains : ["Operations"]);
}

function affectedDomainsFromPredictions(predictions: PredictionDto[]) {
  const domains = predictions.flatMap((prediction) => [
    domainFromPredictionType(prediction.predictionType),
    ...prediction.factors
      .map((factor) => titleCase(factor.factorType.replaceAll("_", " ")))
      .slice(0, 2)
  ]);

  return uniqueNonEmptyStrings(domains.length > 0 ? domains : ["Operations"]);
}

function domainFromPredictionType(predictionType: PredictionDto["predictionType"]) {
  const domains: Record<PredictionDto["predictionType"], string> = {
    CONTROL_SCORE: "Control Score",
    FRAUD_RISK: "Fraud",
    OPERATIONAL_RISK: "Operations",
    INVENTORY_RISK: "Inventory",
    FINANCIAL_RISK: "Finance",
    STAFF_RISK: "Staff"
  };

  return domains[predictionType];
}

function highestPredictionRisk(predictions: PredictionDto[]) {
  const sorted = [...predictions].sort((left, right) => riskRank(right.riskLevel) - riskRank(left.riskLevel));

  return sorted[0]?.riskLevel ?? "MEDIUM";
}

function reducedRiskChange(riskLevel: PredictionDto["riskLevel"]) {
  if (riskLevel === "CRITICAL") {
    return "CRITICAL_TO_HIGH";
  }

  if (riskLevel === "HIGH") {
    return "HIGH_TO_MEDIUM";
  }

  if (riskLevel === "MEDIUM") {
    return "MEDIUM_TO_LOW";
  }

  return "LOW_TO_LOW";
}

function predictionBackedConfidence(predictions: PredictionDto[], base: number) {
  if (predictions.length === 0) {
    return clampConfidence(base);
  }

  const average =
    predictions.reduce((total, prediction) => total + prediction.confidence, 0) /
    predictions.length;
  const riskBonus = Math.max(...predictions.map((prediction) => riskRank(prediction.riskLevel))) * 3;

  return clampConfidence(base + average * 0.25 + riskBonus);
}

function scenarioRank(scenario: DecisionScenario) {
  const typeRank: Record<ScenarioType, number> = {
    RESOLVE_CRITICAL_INCIDENTS: 100,
    REDUCE_FRAUD_RISK: 90,
    STABILIZE_CONTROL_SCORE: 82,
    EXECUTE_HIGH_PRIORITY_RECOMMENDATIONS: 78,
    IMPROVE_INVENTORY_CONTROL: 72,
    IMPROVE_OPERATIONS: 68,
    MAINTAIN_STABLE_OPERATIONS: 10
  };
  const actionRank = Math.max(...scenario.actions.map((action) => priorityRank(action.priority)));

  return typeRank[scenario.scenarioType] + actionRank;
}

function riskRank(riskLevel: PredictionDto["riskLevel"]) {
  const ranks: Record<PredictionDto["riskLevel"], number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  return ranks[riskLevel];
}

function priorityRank(priority: DecisionPriority) {
  const ranks: Record<DecisionPriority, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  return ranks[priority];
}

function buildScenarioId(
  context: AnalyticsContextDto,
  scenarioType: ScenarioType,
  sourceIds: string[]
) {
  const scope = context.businessUnitId ?? "tenant";
  const sourceSignature =
    uniqueNonEmptyStrings(sourceIds)[0] ?? context.controlScore?.id ?? context.generatedAt;

  return ["decision", context.tenantId, scope, scenarioType, sourceSignature].map(slug).join(":");
}

function readStringMetadata(metadata: TimelineEntryDto["metadata"], key: string) {
  const value = metadata[key];

  return typeof value === "string" ? value : null;
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

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function uniqueNonEmptyStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
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

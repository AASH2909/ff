import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { IdGenerator } from "@/application/ports/id-generator";
import {
  CopilotAnswerDraft,
  CopilotContextSnapshot,
  type CopilotAnswerSource,
  type CopilotRecommendedAction
} from "@/copilot/domain/entities";
import type { CopilotIntent } from "@/copilot/domain/value-objects";
import { CopilotIntentClassifier } from "@/copilot/domain/services/copilot-intent-classifier";
import type {
  CopilotCollectedContext,
  CopilotContextProvider
} from "@/copilot/domain/services/copilot-context-provider";
import type { PredictionDto, PredictionFactorDto } from "@/predictive/application";
import type { TimelineEntryDto } from "@/timeline/application";
import type { DecisionActionDto, DecisionScenarioDto } from "@/decision/application";

export type CopilotEngineDependencies = {
  contextProvider: CopilotContextProvider;
  idGenerator: IdGenerator;
  classifier?: CopilotIntentClassifier;
  clock?: Clock;
};

export type CopilotEngineInput = {
  sessionId: string;
  tenantId: string;
  businessUnitId?: string;
  question: string;
  limit: number;
};

export type CopilotEngineOutput = {
  intent: CopilotIntent;
  answerDraft: CopilotAnswerDraft;
  contextSnapshot: CopilotContextSnapshot;
};

export class CopilotEngine {
  constructor(private readonly dependencies: CopilotEngineDependencies) {}

  async answer(input: CopilotEngineInput): Promise<CopilotEngineOutput> {
    const intent = this.classifier.classify(input.question);
    const context = await this.dependencies.contextProvider.load({
      tenantId: input.tenantId,
      businessUnitId: input.businessUnitId,
      limit: input.limit
    });
    const createdAt = this.clock.now();
    const contextSnapshot = new CopilotContextSnapshot({
      id: this.dependencies.idGenerator.nextId(),
      sessionId: input.sessionId,
      analyticsContext: context.analyticsContext,
      predictions: context.predictions,
      timeline: context.timeline,
      decisionScenarios: context.decisionScenarios,
      createdAt,
      metadata: {
        source: "copilot_engine_v1",
        intent,
        sourceWarnings: context.sourceWarnings,
        predictionCount: context.predictions.length,
        timelineEntryCount: context.timeline.length,
        decisionScenarioCount: context.decisionScenarios.length
      }
    });
    const recommendedActions = getRecommendedActions(context.decisionScenarios);
    const answerDraft = new CopilotAnswerDraft({
      id: this.dependencies.idGenerator.nextId(),
      sessionId: input.sessionId,
      intent,
      answer: buildAnswer(intent, context),
      confidence: calculateConfidence(intent, context),
      sources: buildSources(context),
      recommendedActions,
      createdAt,
      metadata: {
        engineVersion: "COPILOT_ENGINE_V1",
        deterministic: true,
        sourceWarnings: context.sourceWarnings,
        recommendedActionCount: recommendedActions.length
      }
    });

    return {
      intent,
      answerDraft,
      contextSnapshot
    };
  }

  private get classifier() {
    return this.dependencies.classifier ?? new CopilotIntentClassifier();
  }

  private get clock() {
    return this.dependencies.clock ?? systemClock;
  }
}

function buildAnswer(intent: CopilotIntent, context: CopilotCollectedContext) {
  if (intent === "BUSINESS_STATUS") {
    return [
      analyticsStatusLine(context),
      predictionLine(context.predictions),
      decisionLine(context.decisionScenarios)
    ].filter(Boolean).join(" ");
  }

  if (intent === "WHY_DID_THIS_HAPPEN") {
    return [
      "The strongest deterministic explanation comes from the latest timeline and prediction factors.",
      timelineCauseLine(context.timeline),
      predictionFactorLine(context.predictions)
    ].filter(Boolean).join(" ");
  }

  if (intent === "WHAT_WILL_HAPPEN_NEXT") {
    return [
      "Existing predictive analytics point to the following next-state view.",
      predictionLine(context.predictions),
      topPredictionScenariosLine(context.predictions)
    ].filter(Boolean).join(" ");
  }

  if (intent === "WHAT_SHOULD_WE_DO") {
    return [
      "Decision Intelligence provides the available action path.",
      recommendedActionLine(getRecommendedActions(context.decisionScenarios)),
      decisionLine(context.decisionScenarios)
    ].filter(Boolean).join(" ");
  }

  if (intent === "RISK_EXPLANATION") {
    return [
      "Risk is explained from persisted predictions and decision scenarios.",
      riskPredictionLine(context.predictions),
      decisionRiskLine(context.decisionScenarios)
    ].filter(Boolean).join(" ");
  }

  if (intent === "TIMELINE_EXPLANATION") {
    return [
      "The executive timeline shows the most recent causal sequence available to copilot.",
      timelineLine(context.timeline)
    ].filter(Boolean).join(" ");
  }

  return [
    "I can answer status, cause, forecast, action, risk, and timeline questions from the current Analytics Context, Predictive Analytics, Executive Timeline, and Decision Intelligence data.",
    analyticsStatusLine(context),
    predictionLine(context.predictions)
  ].filter(Boolean).join(" ");
}

function analyticsStatusLine(context: CopilotCollectedContext) {
  const controlScore = context.analyticsContext?.controlScore;

  if (!controlScore) {
    return "Analytics Context is available, but no current Control Score is present in the snapshot.";
  }

  const change =
    controlScore.scoreChange === null
      ? "with no previous comparison"
      : `with a ${formatSignedNumber(controlScore.scoreChange)} point change`;

  return `Current business status is ${controlScore.status} at Control Score ${controlScore.score} ${change}.`;
}

function predictionLine(predictions: PredictionDto[]) {
  const topPrediction = predictions[0];

  if (!topPrediction) {
    return "No persisted predictive analytics are available for this scope.";
  }

  return `${humanize(topPrediction.predictionType)} is ${topPrediction.riskLevel.toLowerCase()} risk with ${topPrediction.confidence}% confidence: ${topPrediction.summary}`;
}

function decisionLine(scenarios: DecisionScenarioDto[]) {
  const topScenario = scenarios[0];

  if (!topScenario) {
    return "No persisted decision scenarios are available for this scope.";
  }

  return `Top decision scenario: ${topScenario.title} (${topScenario.confidence}% confidence).`;
}

function timelineLine(entries: TimelineEntryDto[]) {
  if (entries.length === 0) {
    return "No persisted timeline entries are available for this scope.";
  }

  return entries.slice(0, 3).map((entry) => `${entry.title}: ${entry.summary}`).join(" ");
}

function timelineCauseLine(entries: TimelineEntryDto[]) {
  const causalEntries = entries.filter((entry) =>
    ["CAUSE", "EFFECT", "PREDICTION"].includes(entry.timelineType)
  );

  if (causalEntries.length === 0) {
    return timelineLine(entries);
  }

  return causalEntries.slice(0, 3).map((entry) => `${entry.title}: ${entry.summary}`).join(" ");
}

function predictionFactorLine(predictions: PredictionDto[]) {
  const factors = predictions.flatMap((prediction) =>
    prediction.factors.map((factor) => ({
      prediction,
      factor
    }))
  );
  const topFactors = factors
    .sort((left, right) => right.factor.weight - left.factor.weight)
    .slice(0, 3);

  if (topFactors.length === 0) {
    return "";
  }

  return topFactors
    .map(({ prediction, factor }) => formatPredictionFactor(prediction, factor))
    .join(" ");
}

function topPredictionScenariosLine(predictions: PredictionDto[]) {
  const scenarios = predictions.flatMap((prediction) => prediction.scenarios).slice(0, 3);

  if (scenarios.length === 0) {
    return "";
  }

  return scenarios
    .map((scenario) => `${scenario.title}: ${scenario.expectedImpact}`)
    .join(" ");
}

function riskPredictionLine(predictions: PredictionDto[]) {
  const riskyPredictions = predictions
    .filter((prediction) => ["HIGH", "CRITICAL"].includes(prediction.riskLevel))
    .slice(0, 3);

  if (riskyPredictions.length === 0) {
    return predictionLine(predictions);
  }

  return riskyPredictions
    .map(
      (prediction) =>
        `${humanize(prediction.predictionType)} is ${prediction.riskLevel.toLowerCase()} risk: ${prediction.summary}`
    )
    .join(" ");
}

function decisionRiskLine(scenarios: DecisionScenarioDto[]) {
  const risks = scenarios.flatMap((scenario) =>
    scenario.risks.slice(0, 2).map((risk) => ({
      scenario,
      risk
    }))
  );

  if (risks.length === 0) {
    return "";
  }

  return risks
    .slice(0, 3)
    .map(({ scenario, risk }) => `${scenario.title} risk: ${risk}`)
    .join(" ");
}

function recommendedActionLine(actions: CopilotRecommendedAction[]) {
  if (actions.length === 0) {
    return "No decision actions are available yet.";
  }

  return actions.map((action) => `${action.title}: ${action.description}`).join(" ");
}

function formatPredictionFactor(prediction: PredictionDto, factor: PredictionFactorDto) {
  return `${factor.title} is a ${factor.impact.toLowerCase()} ${factor.direction.toLowerCase()} factor for ${humanize(prediction.predictionType)}.`;
}

function buildSources(context: CopilotCollectedContext): CopilotAnswerSource[] {
  return [
    ...analyticsSources(context),
    ...context.predictions.slice(0, 3).map((prediction) => ({
      sourceType: "PREDICTIVE_ANALYTICS" as const,
      referenceId: prediction.id,
      title: `${humanize(prediction.predictionType)} prediction`,
      confidence: prediction.confidence
    })),
    ...context.timeline.slice(0, 3).map((entry) => ({
      sourceType: "EXECUTIVE_TIMELINE" as const,
      referenceId: entry.id,
      title: entry.title,
      confidence: null
    })),
    ...context.decisionScenarios.slice(0, 3).map((scenario) => ({
      sourceType: "DECISION_INTELLIGENCE" as const,
      referenceId: scenario.id,
      title: scenario.title,
      confidence: scenario.confidence
    }))
  ];
}

function analyticsSources(context: CopilotCollectedContext): CopilotAnswerSource[] {
  if (!context.analyticsContext) {
    return [];
  }

  return [
    {
      sourceType: "ANALYTICS_CONTEXT",
      referenceId: context.analyticsContext.controlScore?.id ?? null,
      title: "Analytics Context",
      confidence: null
    }
  ];
}

function getRecommendedActions(scenarios: DecisionScenarioDto[]): CopilotRecommendedAction[] {
  return scenarios
    .flatMap((scenario) =>
      scenario.actions.map((action) => toRecommendedAction(scenario, action))
    )
    .sort((left, right) => priorityRank(right.priority) - priorityRank(left.priority))
    .slice(0, 5);
}

function toRecommendedAction(
  scenario: DecisionScenarioDto,
  action: DecisionActionDto
): CopilotRecommendedAction {
  return {
    id: action.id,
    title: action.title,
    description: action.description,
    priority: action.priority,
    sourceScenarioId: scenario.id
  };
}

function calculateConfidence(intent: CopilotIntent, context: CopilotCollectedContext) {
  const contextScore =
    (context.analyticsContext ? 20 : 0) +
    (context.predictions.length > 0 ? 20 : 0) +
    (context.timeline.length > 0 ? 20 : 0) +
    (context.decisionScenarios.length > 0 ? 20 : 0);
  const intentAdjustment = intent === "UNKNOWN" ? -10 : 0;
  const warningPenalty = Math.min(context.sourceWarnings.length * 5, 15);

  return clamp(35 + contextScore + intentAdjustment - warningPenalty, 10, 95);
}

function priorityRank(priority: CopilotRecommendedAction["priority"]) {
  if (priority === "CRITICAL") {
    return 4;
  }

  if (priority === "HIGH") {
    return 3;
  }

  if (priority === "MEDIUM") {
    return 2;
  }

  return 1;
}

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSignedNumber(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

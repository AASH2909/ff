import {
  DecisionAction,
  DecisionImpact,
  DecisionScenario,
  normalizeActionEffort,
  normalizeDecisionPriority,
  normalizeScenarioType,
  type DecisionImpactProps,
  type DecisionScenarioMetadata
} from "@/decision/domain";
import type { Database, Json } from "@/types/database";

export type DecisionScenarioRow = Database["public"]["Tables"]["decision_scenarios"]["Row"];
export type DecisionScenarioInsert =
  Database["public"]["Tables"]["decision_scenarios"]["Insert"];
export type DecisionActionRow = Database["public"]["Tables"]["decision_actions"]["Row"];
export type DecisionActionInsert =
  Database["public"]["Tables"]["decision_actions"]["Insert"];

export function mapDecisionScenarioRow(
  row: DecisionScenarioRow,
  actionRows: DecisionActionRow[]
) {
  return new DecisionScenario({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    scenarioType: normalizeScenarioType(row.scenario_type),
    title: row.title,
    description: row.description,
    estimatedImpact: new DecisionImpact(jsonToDecisionImpact(row.estimated_impact)),
    confidence: row.confidence,
    assumptions: jsonToStringArray(row.assumptions),
    risks: jsonToStringArray(row.risks),
    actions: actionRows.map(mapDecisionActionRow),
    createdAt: new Date(row.created_at),
    metadata: jsonToDecisionScenarioMetadata(row.metadata)
  });
}

export function mapDecisionScenarioInsert(
  scenario: DecisionScenario
): DecisionScenarioInsert {
  const now = scenario.createdAt.toISOString();

  return {
    id: scenario.id,
    tenant_id: scenario.tenantId,
    business_unit_id: scenario.businessUnitId,
    scenario_type: scenario.scenarioType,
    title: scenario.title,
    description: scenario.description,
    estimated_impact: scenario.estimatedImpact.toSnapshot(),
    confidence: scenario.confidence,
    assumptions: scenario.assumptions,
    risks: scenario.risks,
    created_at: now,
    updated_at: now,
    metadata: scenario.metadata
  };
}

export function mapDecisionActionRow(row: DecisionActionRow) {
  return new DecisionAction({
    id: row.id,
    scenarioId: row.scenario_id,
    actionType: row.action_type,
    title: row.title,
    description: row.description,
    expectedEffect: row.expected_effect,
    effort: normalizeActionEffort(row.effort),
    priority: normalizeDecisionPriority(row.priority)
  });
}

export function mapDecisionActionInsert(
  scenario: DecisionScenario,
  action: DecisionAction,
  index: number
): DecisionActionInsert {
  return {
    id: action.id,
    tenant_id: scenario.tenantId,
    business_unit_id: scenario.businessUnitId,
    scenario_id: action.scenarioId,
    action_type: action.actionType,
    title: action.title,
    description: action.description,
    expected_effect: action.expectedEffect,
    effort: action.effort,
    priority: action.priority,
    action_order: index + 1,
    created_at: scenario.createdAt.toISOString()
  };
}

function jsonToDecisionImpact(value: Json): DecisionImpactProps {
  if (!isJsonObject(value)) {
    return fallbackDecisionImpact();
  }

  const affectedDomains = jsonToStringArray(value.affectedDomains);

  return {
    controlScoreDelta: readNumber(value.controlScoreDelta, 0),
    riskLevelChange: readString(value.riskLevelChange, "UNKNOWN"),
    estimatedTimeToImpact: readString(value.estimatedTimeToImpact, "Unknown"),
    affectedDomains: affectedDomains.length > 0 ? affectedDomains : ["Operations"]
  };
}

function fallbackDecisionImpact(): DecisionImpactProps {
  return {
    controlScoreDelta: 0,
    riskLevelChange: "UNKNOWN",
    estimatedTimeToImpact: "Unknown",
    affectedDomains: ["Operations"]
  };
}

function jsonToDecisionScenarioMetadata(value: Json): DecisionScenarioMetadata {
  if (!isJsonObject(value)) {
    return {};
  }

  return Object.entries(value).reduce<DecisionScenarioMetadata>((metadata, [key, item]) => {
    if (item !== undefined && isDecisionScenarioMetadataValue(item)) {
      metadata[key] = item;
    }

    return metadata;
  }, {});
}

function isDecisionScenarioMetadataValue(
  value: Json
): value is DecisionScenarioMetadata[string] {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" || typeof item === "number")
  );
}

function jsonToStringArray(value: Json | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function readString(value: Json | undefined, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function readNumber(value: Json | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isJsonObject(value: Json | undefined): value is { [key: string]: Json | undefined } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

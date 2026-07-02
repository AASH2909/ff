import {
  Prediction,
  PredictionFactor,
  PredictionScenario,
  normalizeFactorDirection,
  normalizeFactorImpact,
  normalizePredictionRiskLevel,
  normalizePredictionTrend,
  normalizePredictionType,
  normalizePredictionWindow,
  type PredictionMetadata
} from "@/predictive/domain";
import type { Database, Json } from "@/types/database";

export type PredictionRow = Database["public"]["Tables"]["predictive_predictions"]["Row"];
export type PredictionInsert = Database["public"]["Tables"]["predictive_predictions"]["Insert"];
export type PredictionFactorRow =
  Database["public"]["Tables"]["predictive_prediction_factors"]["Row"];
export type PredictionFactorInsert =
  Database["public"]["Tables"]["predictive_prediction_factors"]["Insert"];
export type PredictionScenarioRow =
  Database["public"]["Tables"]["predictive_prediction_scenarios"]["Row"];
export type PredictionScenarioInsert =
  Database["public"]["Tables"]["predictive_prediction_scenarios"]["Insert"];

export function mapPredictionRow(
  row: PredictionRow,
  factorRows: PredictionFactorRow[],
  scenarioRows: PredictionScenarioRow[]
) {
  return new Prediction({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    predictionType: normalizePredictionType(row.prediction_type),
    predictionWindow: normalizePredictionWindow(row.prediction_window),
    riskLevel: normalizePredictionRiskLevel(row.risk_level),
    trend: normalizePredictionTrend(row.trend),
    confidence: row.confidence,
    summary: row.summary,
    predictedControlScore: row.predicted_control_score,
    factors: factorRows.map(mapPredictionFactorRow),
    scenarios: scenarioRows.map(mapPredictionScenarioRow),
    createdAt: new Date(row.created_at),
    metadata: jsonToPredictionMetadata(row.metadata)
  });
}

export function mapPredictionInsert(prediction: Prediction): PredictionInsert {
  return {
    id: prediction.id,
    tenant_id: prediction.tenantId,
    business_unit_id: prediction.businessUnitId,
    prediction_type: prediction.predictionType,
    prediction_window: prediction.predictionWindow,
    risk_level: prediction.riskLevel,
    trend: prediction.trend,
    confidence: prediction.confidence,
    summary: prediction.summary,
    predicted_control_score: prediction.predictedControlScore,
    created_at: prediction.createdAt.toISOString(),
    metadata: prediction.metadata
  };
}

export function mapPredictionFactorRow(row: PredictionFactorRow) {
  return new PredictionFactor({
    id: row.id,
    predictionId: row.prediction_id,
    factorType: row.factor_type,
    source: row.source,
    title: row.title,
    description: row.description,
    impact: normalizeFactorImpact(row.impact),
    weight: row.weight,
    direction: normalizeFactorDirection(row.direction),
    evidence: jsonToStringArray(row.evidence)
  });
}

export function mapPredictionFactorInsert(
  prediction: Prediction,
  factor: PredictionFactor
): PredictionFactorInsert {
  return {
    id: factor.id,
    tenant_id: prediction.tenantId,
    business_unit_id: prediction.businessUnitId,
    prediction_id: factor.predictionId,
    factor_type: factor.factorType,
    source: factor.source,
    title: factor.title,
    description: factor.description,
    impact: factor.impact,
    weight: factor.weight,
    direction: factor.direction,
    evidence: factor.evidence,
    created_at: prediction.createdAt.toISOString()
  };
}

export function mapPredictionScenarioRow(row: PredictionScenarioRow) {
  return new PredictionScenario({
    id: row.id,
    predictionId: row.prediction_id,
    scenarioType: row.scenario_type,
    title: row.title,
    description: row.description,
    expectedImpact: row.expected_impact,
    confidence: row.confidence,
    assumptions: jsonToStringArray(row.assumptions)
  });
}

export function mapPredictionScenarioInsert(
  prediction: Prediction,
  scenario: PredictionScenario
): PredictionScenarioInsert {
  return {
    id: scenario.id,
    tenant_id: prediction.tenantId,
    business_unit_id: prediction.businessUnitId,
    prediction_id: scenario.predictionId,
    scenario_type: scenario.scenarioType,
    title: scenario.title,
    description: scenario.description,
    expected_impact: scenario.expectedImpact,
    confidence: scenario.confidence,
    assumptions: scenario.assumptions,
    created_at: prediction.createdAt.toISOString()
  };
}

function jsonToPredictionMetadata(value: Json): PredictionMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<PredictionMetadata>((metadata, [key, item]) => {
    if (item !== undefined && isPredictionMetadataValue(item)) {
      metadata[key] = item;
    }

    return metadata;
  }, {});
}

function isPredictionMetadataValue(value: Json): value is PredictionMetadata[string] {
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

function jsonToStringArray(value: Json) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

import type {
  FactorDirection,
  FactorImpact,
  Prediction,
  PredictionMetadata,
  PredictionRiskLevel,
  PredictionTrend,
  PredictionType,
  PredictionWindow
} from "@/predictive/domain";

export type PredictionScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type PredictionQueryDto = PredictionScopeDto & {
  predictionType?: string;
  predictionWindow?: string;
  limit?: number;
};

export type GeneratePredictionsCommandDto = PredictionScopeDto & {
  predictionWindow?: string;
  limit?: number;
};

export type PredictionByIdQueryDto = PredictionScopeDto & {
  id: string;
};

export type PredictionFactorDto = {
  id: string;
  predictionId: string;
  factorType: string;
  source: string;
  title: string;
  description: string;
  impact: FactorImpact;
  weight: number;
  direction: FactorDirection;
  evidence: string[];
};

export type PredictionScenarioDto = {
  id: string;
  predictionId: string;
  scenarioType: string;
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number;
  assumptions: string[];
};

export type PredictionDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  predictionType: PredictionType;
  predictionWindow: PredictionWindow;
  riskLevel: PredictionRiskLevel;
  trend: PredictionTrend;
  confidence: number;
  summary: string;
  predictedControlScore: number | null;
  factors: PredictionFactorDto[];
  scenarios: PredictionScenarioDto[];
  createdAt: string;
  metadata: PredictionMetadata;
};

export type PredictionsOutputDto = {
  predictions: PredictionDto[];
};

export type PredictionOutputDto = {
  prediction: PredictionDto;
};

export function toPredictionDto(prediction: Prediction): PredictionDto {
  return {
    id: prediction.id,
    tenantId: prediction.tenantId,
    businessUnitId: prediction.businessUnitId,
    predictionType: prediction.predictionType,
    predictionWindow: prediction.predictionWindow,
    riskLevel: prediction.riskLevel,
    trend: prediction.trend,
    confidence: prediction.confidence,
    summary: prediction.summary,
    predictedControlScore: prediction.predictedControlScore,
    factors: prediction.factors.map((factor) => ({
      id: factor.id,
      predictionId: factor.predictionId,
      factorType: factor.factorType,
      source: factor.source,
      title: factor.title,
      description: factor.description,
      impact: factor.impact,
      weight: factor.weight,
      direction: factor.direction,
      evidence: factor.evidence
    })),
    scenarios: prediction.scenarios.map((scenario) => ({
      id: scenario.id,
      predictionId: scenario.predictionId,
      scenarioType: scenario.scenarioType,
      title: scenario.title,
      description: scenario.description,
      expectedImpact: scenario.expectedImpact,
      confidence: scenario.confidence,
      assumptions: scenario.assumptions
    })),
    createdAt: prediction.createdAt.toISOString(),
    metadata: prediction.metadata
  };
}

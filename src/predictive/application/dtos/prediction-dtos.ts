import type {
  Prediction,
  PredictionExplanation,
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

export type PredictionByIdQueryDto = PredictionScopeDto & {
  id: string;
  predictionWindow?: string;
};

export type PredictionDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  generatedAt: string;
  predictionType: PredictionType;
  predictionWindow: PredictionWindow;
  riskLevel: PredictionRiskLevel;
  confidence: number;
  predictedControlScore: number | null;
  trend: PredictionTrend;
  summary: string;
  explanations: PredictionExplanation[];
  recommendedActions: string[];
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
    generatedAt: prediction.generatedAt.toISOString(),
    predictionType: prediction.predictionType,
    predictionWindow: prediction.predictionWindow,
    riskLevel: prediction.riskLevel,
    confidence: prediction.confidence,
    predictedControlScore: prediction.predictedControlScore,
    trend: prediction.trend,
    summary: prediction.summary,
    explanations: prediction.explanations,
    recommendedActions: prediction.recommendedActions,
    metadata: prediction.metadata
  };
}

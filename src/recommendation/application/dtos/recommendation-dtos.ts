import type {
  ExecutiveRecommendation,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationSeverity,
  RecommendationSource
} from "@/recommendation/domain";

export type RecommendationScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type RecommendationQueryDto = RecommendationScopeDto & {
  limit?: number;
};

export type RecommendationByIdQueryDto = RecommendationScopeDto & {
  id: string;
};

export type RecommendationDto = {
  id: string;
  priority: RecommendationPriority;
  severity: RecommendationSeverity;
  category: RecommendationCategory;
  title: string;
  description: string;
  businessImpact: string;
  recommendedAction: string;
  confidence: number;
  source: RecommendationSource;
  createdAt: string;
};

export type RecommendationsOutputDto = {
  recommendations: RecommendationDto[];
};

export type RecommendationDetailOutputDto = {
  recommendation: RecommendationDto;
};

export function toRecommendationDto(recommendation: ExecutiveRecommendation): RecommendationDto {
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
    createdAt: recommendation.createdAt.toISOString()
  };
}

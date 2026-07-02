import type {
  RecommendationCategory,
  RecommendationSeverity,
  RecommendationSource
} from "@/recommendation/domain/entities/executive-recommendation";

export type RecommendationScoreFact = {
  id: string;
  tenantId: string;
  businessUnitId: string;
  businessUnitName: string | null;
  score: number;
  status: string;
  scoreChange: number | null;
  calculatedAt: Date;
};

export type RecommendationDomainFact = {
  id: string;
  domainCode: string;
  domainName: string;
  score: number;
  previousScore: number | null;
  scoreChange: number | null;
  contribution: number;
  calculatedAt: Date;
};

export type RecommendationExplanationFact = {
  id: string;
  domainCode: string | null;
  metricCode: string | null;
  metricName: string | null;
  driverType: "positive" | "negative" | "risk" | "neutral";
  contribution: number;
  severity: RecommendationSeverity;
  explanation: string;
  createdAt: Date;
};

export type RecommendationAlertFact = {
  id: string;
  severity: RecommendationSeverity;
  title: string;
  message: string;
  source: RecommendationSource;
  domainCode: string | null;
  metricCode: string | null;
  resourceType: string | null;
  resourceId: string | null;
  occurredAt: Date;
};

export type RecommendationRuleContext = {
  score: RecommendationScoreFact;
  domains: RecommendationDomainFact[];
  explanations: RecommendationExplanationFact[];
  alerts: RecommendationAlertFact[];
  generatedAt: Date;
};

export type RecommendationRuleMatch = {
  category: RecommendationCategory;
  source: RecommendationSource;
  sourceId: string;
  createdAt: Date;
};

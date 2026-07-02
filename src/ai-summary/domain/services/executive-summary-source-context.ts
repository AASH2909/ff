import type { ExecutiveSummaryType } from "@/ai-summary/domain/value-objects";

export type ExecutiveSummaryScoreFact = {
  id: string;
  tenantId: string;
  businessUnitId: string;
  businessUnitName: string | null;
  score: number;
  status: string;
  scoreChange: number | null;
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
};

export type ExecutiveSummaryDomainFact = {
  id: string;
  domainCode: string;
  domainName: string;
  score: number;
  scoreChange: number | null;
  contribution: number;
  calculatedAt: Date;
};

export type ExecutiveSummaryExplanationFact = {
  id: string;
  domainCode: string | null;
  metricCode: string | null;
  metricName: string | null;
  driverType: "positive" | "negative" | "risk" | "neutral";
  contribution: number;
  severity: "information" | "warning" | "critical" | "severe";
  explanation: string;
  createdAt: Date;
};

export type ExecutiveSummaryAlertFact = {
  id: string;
  severity: "information" | "warning" | "critical" | "severe";
  title: string;
  message: string;
  source: string;
  domainCode: string | null;
  metricCode: string | null;
  occurredAt: Date;
};

export type ExecutiveSummaryRecommendationFact = {
  id: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  severity: "information" | "warning" | "critical" | "severe";
  category: string;
  title: string;
  description: string;
  businessImpact: string;
  recommendedAction: string;
  confidence: number;
  source: string;
  createdAt: Date;
};

export type ExecutiveSummarySourceContext = {
  score: ExecutiveSummaryScoreFact;
  domains: ExecutiveSummaryDomainFact[];
  explanations: ExecutiveSummaryExplanationFact[];
  alerts: ExecutiveSummaryAlertFact[];
  recommendations: ExecutiveSummaryRecommendationFact[];
  generatedAt: Date;
};

export type ExecutiveSummaryBuildInput = {
  id: string;
  summaryType: ExecutiveSummaryType;
  periodStart: Date;
  periodEnd: Date;
  context: ExecutiveSummarySourceContext;
  generatedAt: Date;
};

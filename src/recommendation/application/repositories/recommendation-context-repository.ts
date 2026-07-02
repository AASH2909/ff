import type { RecommendationRuleContext } from "@/recommendation/domain";

export type RecommendationReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export interface RecommendationContextRepository {
  loadContext(scope: RecommendationReadScope): Promise<RecommendationRuleContext | null>;
}

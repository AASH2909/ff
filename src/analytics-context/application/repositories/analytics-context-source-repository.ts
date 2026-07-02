import type { AnalyticsContextSourceSnapshot } from "@/analytics-context/domain";

export type AnalyticsContextReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type AnalyticsContextReadQuery = AnalyticsContextReadScope & {
  limit: number;
};

export interface AnalyticsContextSourceRepository {
  load(query: AnalyticsContextReadQuery): Promise<AnalyticsContextSourceSnapshot>;
}

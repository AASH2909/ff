import type { ExecutiveSummary, ExecutiveSummaryType } from "@/ai-summary/domain";

export type ExecutiveSummaryReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ExecutiveSummaryHistoryQuery = ExecutiveSummaryReadScope & {
  summaryType?: ExecutiveSummaryType;
  from?: Date;
  to?: Date;
  limit: number;
};

export interface ExecutiveSummaryRepository {
  save(summary: ExecutiveSummary): Promise<void>;
  findLatest(
    scope: ExecutiveSummaryReadScope,
    summaryType?: ExecutiveSummaryType
  ): Promise<ExecutiveSummary | null>;
  findById(scope: ExecutiveSummaryReadScope, id: string): Promise<ExecutiveSummary | null>;
  findHistory(query: ExecutiveSummaryHistoryQuery): Promise<ExecutiveSummary[]>;
}

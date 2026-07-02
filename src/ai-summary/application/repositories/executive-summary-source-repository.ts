import type { ExecutiveSummarySourceContext } from "@/ai-summary/domain";

export type ExecutiveSummarySourceScope = {
  tenantId: string;
  businessUnitId?: string;
};

export interface ExecutiveSummarySourceRepository {
  loadContext(scope: ExecutiveSummarySourceScope): Promise<ExecutiveSummarySourceContext | null>;
}

import type { TimelineEntry, TimelineGraph } from "@/timeline/domain";

export type TimelineReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type TimelineReadQuery = TimelineReadScope & {
  limit: number;
};

export interface TimelineRepository {
  saveGraph(graph: TimelineGraph): Promise<void>;
  findEntries(query: TimelineReadQuery): Promise<TimelineEntry[]>;
  findEntryById(scope: TimelineReadScope, id: string): Promise<TimelineEntry | null>;
  findGraphByEntryId(scope: TimelineReadScope, id: string): Promise<TimelineGraph | null>;
}

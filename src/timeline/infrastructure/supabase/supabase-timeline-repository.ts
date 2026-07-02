import type { PostgrestError } from "@supabase/supabase-js";
import type {
  TimelineReadQuery,
  TimelineReadScope,
  TimelineRepository
} from "@/timeline/application";
import type { TimelineEntry, TimelineGraph } from "@/timeline/domain";
import { TimelineGraph as TimelineGraphEntity } from "@/timeline/domain";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import {
  mapTimelineEntryInsert,
  mapTimelineEntryRow,
  mapTimelineLinkInsert,
  mapTimelineLinkRow,
  type TimelineEntryRow,
  type TimelineLinkRow
} from "@/timeline/infrastructure/supabase/supabase-timeline-mappers";

export class SupabaseTimelineRepository implements TimelineRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async saveGraph(graph: TimelineGraph): Promise<void> {
    if (graph.entries.length === 0) {
      return;
    }

    const { error: entryError } = await this.supabase
      .from("timeline_entries")
      .upsert(graph.entries.map((entry) => mapTimelineEntryInsert(graph, entry)), {
        onConflict: "id"
      });

    this.throwIfSupabaseError(entryError);

    if (graph.links.length === 0) {
      return;
    }

    const { error: linkError } = await this.supabase
      .from("timeline_links")
      .upsert(graph.links.map((link) => mapTimelineLinkInsert(graph, link)), {
        onConflict: "source_entry_id,target_entry_id,relation_type"
      });

    this.throwIfSupabaseError(linkError);
  }

  async findEntries(queryInput: TimelineReadQuery): Promise<TimelineEntry[]> {
    let query = this.supabase
      .from("timeline_entries")
      .select("*")
      .eq("tenant_id", queryInput.tenantId)
      .order("occurred_at", { ascending: false })
      .limit(queryInput.limit);

    if (queryInput.businessUnitId) {
      query = query.eq("business_unit_id", queryInput.businessUnitId);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapTimelineEntryRow);
  }

  async findEntryById(scope: TimelineReadScope, id: string): Promise<TimelineEntry | null> {
    const row = await this.loadEntryRow(scope, id);

    return row ? mapTimelineEntryRow(row) : null;
  }

  async findGraphByEntryId(
    scope: TimelineReadScope,
    id: string
  ): Promise<TimelineGraph | null> {
    const root = await this.loadEntryRow(scope, id);

    if (!root) {
      return null;
    }

    const relatedLinks = await this.loadRelatedLinkRows(scope, id);
    const relatedEntryIds = [
      root.id,
      ...relatedLinks.map((link) => link.source_entry_id),
      ...relatedLinks.map((link) => link.target_entry_id)
    ];
    const entries = await this.loadEntryRows(scope, [...new Set(relatedEntryIds)]);

    return new TimelineGraphEntity({
      tenantId: root.tenant_id,
      businessUnitId: root.business_unit_id,
      generatedAt: new Date(),
      entries: entries.map(mapTimelineEntryRow),
      links: relatedLinks.map(mapTimelineLinkRow)
    });
  }

  private async loadEntryRow(
    scope: TimelineReadScope,
    id: string
  ): Promise<TimelineEntryRow | null> {
    let query = this.supabase
      .from("timeline_entries")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("id", id)
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    return data ?? null;
  }

  private async loadEntryRows(
    scope: TimelineReadScope,
    ids: string[]
  ): Promise<TimelineEntryRow[]> {
    if (ids.length === 0) {
      return [];
    }

    let query = this.supabase
      .from("timeline_entries")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .in("id", ids);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return data ?? [];
  }

  private async loadRelatedLinkRows(
    scope: TimelineReadScope,
    id: string
  ): Promise<TimelineLinkRow[]> {
    const [outgoing, incoming] = await Promise.all([
      this.loadLinkRows(scope, "source_entry_id", id),
      this.loadLinkRows(scope, "target_entry_id", id)
    ]);
    const byKey = new Map<string, TimelineLinkRow>();

    [...outgoing, ...incoming].forEach((link) => {
      byKey.set(`${link.source_entry_id}:${link.target_entry_id}:${link.relation_type}`, link);
    });

    return [...byKey.values()];
  }

  private async loadLinkRows(
    scope: TimelineReadScope,
    column: "source_entry_id" | "target_entry_id",
    id: string
  ): Promise<TimelineLinkRow[]> {
    let query = this.supabase
      .from("timeline_links")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq(column, id)
      .order("confidence", { ascending: false });

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return data ?? [];
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}

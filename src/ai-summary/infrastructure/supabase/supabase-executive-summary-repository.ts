import type { PostgrestError } from "@supabase/supabase-js";
import type {
  ExecutiveSummaryHistoryQuery,
  ExecutiveSummaryReadScope,
  ExecutiveSummaryRepository
} from "@/ai-summary/application/repositories";
import type { ExecutiveSummary, ExecutiveSummaryType } from "@/ai-summary/domain";
import {
  mapExecutiveSummaryInsert,
  mapExecutiveSummaryRow
} from "@/ai-summary/infrastructure/supabase/supabase-executive-summary-mappers";
import type { AppSupabaseClient } from "@/lib/supabase/types";

export class SupabaseExecutiveSummaryRepository implements ExecutiveSummaryRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async save(summary: ExecutiveSummary): Promise<void> {
    const { error } = await this.supabase
      .from("ai_executive_summaries")
      .upsert(mapExecutiveSummaryInsert(summary), { onConflict: "id" });

    this.throwIfSupabaseError(error);
  }

  async findLatest(
    scope: ExecutiveSummaryReadScope,
    summaryType?: ExecutiveSummaryType
  ): Promise<ExecutiveSummary | null> {
    let query = this.supabase
      .from("ai_executive_summaries")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .order("generated_at", { ascending: false })
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    if (summaryType) {
      query = query.eq("summary_type", summaryType);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    return data ? mapExecutiveSummaryRow(data) : null;
  }

  async findById(scope: ExecutiveSummaryReadScope, id: string): Promise<ExecutiveSummary | null> {
    let query = this.supabase
      .from("ai_executive_summaries")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("id", id)
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    return data ? mapExecutiveSummaryRow(data) : null;
  }

  async findHistory(queryInput: ExecutiveSummaryHistoryQuery): Promise<ExecutiveSummary[]> {
    let query = this.supabase
      .from("ai_executive_summaries")
      .select("*")
      .eq("tenant_id", queryInput.tenantId)
      .order("generated_at", { ascending: false })
      .limit(queryInput.limit);

    if (queryInput.businessUnitId) {
      query = query.eq("business_unit_id", queryInput.businessUnitId);
    }

    if (queryInput.summaryType) {
      query = query.eq("summary_type", queryInput.summaryType);
    }

    if (queryInput.from) {
      query = query.gte("period_end", queryInput.from.toISOString());
    }

    if (queryInput.to) {
      query = query.lte("period_start", queryInput.to.toISOString());
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapExecutiveSummaryRow);
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}

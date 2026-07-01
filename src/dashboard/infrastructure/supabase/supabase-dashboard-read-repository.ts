import type { PostgrestError } from "@supabase/supabase-js";
import type {
  ControlScoreSnapshot,
  DashboardAlert,
  DomainScoreSnapshot,
  ScoreExplanation
} from "@/dashboard/domain";
import type {
  DashboardReadDateRange,
  DashboardReadRepository,
  DashboardReadScope
} from "@/dashboard/application/repositories";
import {
  mapControlScoreRow,
  mapDashboardAlertRow,
  mapDomainScoreRow,
  mapFraudAlertRow,
  mapScoreExplanationRow
} from "@/dashboard/infrastructure/supabase/supabase-dashboard-mappers";
import type { AppSupabaseClient } from "@/lib/supabase/types";

export class SupabaseDashboardReadRepository implements DashboardReadRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async findLatestControlScore(scope: DashboardReadScope): Promise<ControlScoreSnapshot | null> {
    let query = this.supabase
      .from("control_scores")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .order("calculated_at", { ascending: false })
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    return data ? mapControlScoreRow(data) : null;
  }

  async findPreviousControlScore(
    scope: DashboardReadScope,
    beforeCalculatedAt: Date
  ): Promise<ControlScoreSnapshot | null> {
    let query = this.supabase
      .from("control_scores")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .lt("calculated_at", beforeCalculatedAt.toISOString())
      .order("calculated_at", { ascending: false })
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    return data ? mapControlScoreRow(data) : null;
  }

  async findControlScoreHistory(
    scope: DashboardReadScope,
    range: DashboardReadDateRange
  ): Promise<ControlScoreSnapshot[]> {
    let query = this.supabase
      .from("control_scores")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .order("calculated_at", { ascending: false })
      .limit(range.limit);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    if (range.from) {
      query = query.gte("period_end", range.from.toISOString());
    }

    if (range.to) {
      query = query.lte("period_start", range.to.toISOString());
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapControlScoreRow);
  }

  async findDomainScores(
    scope: DashboardReadScope,
    controlScoreId: string
  ): Promise<DomainScoreSnapshot[]> {
    const { data, error } = await this.supabase
      .from("control_score_domain_scores")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("control_score_id", controlScoreId)
      .order("contribution", { ascending: false });

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapDomainScoreRow);
  }

  async findScoreExplanations(
    scope: DashboardReadScope,
    controlScoreId: string
  ): Promise<ScoreExplanation[]> {
    const { data, error } = await this.supabase
      .from("control_score_explanations")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("control_score_id", controlScoreId)
      .order("created_at", { ascending: false });

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapScoreExplanationRow);
  }

  async findActiveDashboardAlerts(
    scope: DashboardReadScope,
    limit: number
  ): Promise<DashboardAlert[]> {
    let query = this.supabase
      .from("dashboard_alerts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("status", "active")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapDashboardAlertRow);
  }

  async findActiveRiskAlerts(scope: DashboardReadScope, limit: number): Promise<DashboardAlert[]> {
    const { data, error } = await this.supabase
      .from("fraud_alerts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .in("status", ["pending", "acknowledged"])
      .order("generated_at", { ascending: false })
      .limit(limit);

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapFraudAlertRow);
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}

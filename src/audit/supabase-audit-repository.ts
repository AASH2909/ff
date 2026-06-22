import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditQueryFilters, AuditQueryResult, AuditRecord } from "./types";
import type { AuditRepository } from "./audit-repository";
import type { Database } from "@/types/database";

export class SupabaseAuditRepository implements AuditRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async save(record: AuditRecord): Promise<void> {
    const { error } = await this.supabase.from("audit_logs").insert([record]);

    if (error) {
      throw error;
    }
  }

  async findById(tenantId: string, auditId: string): Promise<AuditRecord | null> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", auditId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as AuditRecord;
  }

  async query(filters: AuditQueryFilters): Promise<AuditQueryResult> {
    const query = this.supabase.from("audit_logs").select("*", { count: "exact" });

    query.eq("tenant_id", filters.tenantId);

    if (filters.userId) {
      query.eq("user_id", filters.userId);
    }

    if (filters.action) {
      query.eq("action", filters.action);
    }

    if (filters.resourceType) {
      query.eq("resource_type", filters.resourceType);
    }

    if (filters.resourceId) {
      query.eq("resource_id", filters.resourceId);
    }

    if (filters.correlationId) {
      query.eq("correlation_id", filters.correlationId);
    }

    if (filters.fromDate) {
      query.gte("occurred_at", filters.fromDate);
    }

    if (filters.toDate) {
      query.lte("occurred_at", filters.toDate);
    }

    if (filters.search) {
      query.or(`action.ilike.%${filters.search}%,resource_type.ilike.%${filters.search}%`);
    }

    query.order("occurred_at", { ascending: false });

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    return {
      items: (data ?? []) as AuditRecord[],
      totalCount: count ?? 0
    };
  }
}

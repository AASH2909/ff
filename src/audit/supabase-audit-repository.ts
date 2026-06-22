import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditQueryFilters, AuditQueryResult, AuditRecord } from "./types";
import type { AuditRepository } from "./audit-repository";
import type { Database, Json } from "@/types/database";

type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export class SupabaseAuditRepository implements AuditRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async save(record: AuditRecord): Promise<void> {
    await this.saveMany([record]);
  }

  async saveMany(records: AuditRecord[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    const { error } = await this.supabase
      .from("audit_logs")
      .insert(records.map(toAuditLogInsert));

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
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? toAuditRecord(data) : null;
  }

  async query(filters: AuditQueryFilters): Promise<AuditQueryResult> {
    const limit = clamp(filters.limit ?? 50, 1, 200);
    const offset = Math.max(filters.offset ?? 0, 0);
    let query = this.supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .eq("tenant_id", filters.tenantId);

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters.actorType) {
      query = query.eq("actor_type", filters.actorType);
    }

    if (filters.action) {
      query = query.eq("action", filters.action);
    }

    if (filters.actions?.length) {
      query = query.in("action", filters.actions);
    }

    if (filters.resourceType) {
      query = query.eq("resource_type", filters.resourceType);
    }

    if (filters.resourceTypes?.length) {
      query = query.in("resource_type", filters.resourceTypes);
    }

    if (filters.resourceId) {
      query = query.eq("resource_id", filters.resourceId);
    }

    if (filters.outcome) {
      query = query.eq("outcome", filters.outcome);
    }

    if (filters.correlationId) {
      query = query.eq("correlation_id", filters.correlationId);
    }

    if (filters.requestId) {
      query = query.eq("request_id", filters.requestId);
    }

    if (filters.sessionId) {
      query = query.eq("session_id", filters.sessionId);
    }

    if (filters.fromDate) {
      query = query.gte("occurred_at", filters.fromDate);
    }

    if (filters.toDate) {
      query = query.lte("occurred_at", filters.toDate);
    }

    if (filters.search) {
      const searchTerm = sanitizeSearchTerm(filters.search);

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`);
      }
    }

    query = query
      .order("occurred_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    return {
      items: (data ?? []).map(toAuditRecord),
      totalCount: count ?? 0
    };
  }
}

function toAuditLogInsert(record: AuditRecord): AuditLogInsert {
  return {
    id: record.id,
    tenant_id: record.tenantId,
    user_id: record.userId,
    actor_type: record.actorType,
    actor_display_name: record.actorDisplayName ?? null,
    action: record.action,
    resource_type: record.resourceType,
    resource_id: record.resourceId ?? null,
    outcome: record.outcome,
    occurred_at: record.occurredAt,
    previous_value: toJson(record.previousValue),
    new_value: toJson(record.newValue),
    reason: record.reason ?? null,
    metadata: toJson(record.metadata),
    ip_address: record.ipAddress ?? null,
    forwarded_for: record.forwardedFor ?? null,
    user_agent: record.userAgent ?? null,
    device_info: record.deviceInfo ?? null,
    correlation_id: record.correlationId ?? null,
    causation_id: record.causationId ?? null,
    request_id: record.requestId ?? null,
    session_id: record.sessionId ?? null,
    source: record.source ?? null,
    sensitivity: record.sensitivity,
    hash: record.hash ?? null,
    hash_algorithm: record.hashAlgorithm ?? null,
    created_at: record.createdAt
  };
}

function toAuditRecord(row: AuditLogRow): AuditRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    actorType: row.actor_type as AuditRecord["actorType"],
    actorDisplayName: row.actor_display_name,
    action: row.action as AuditRecord["action"],
    resourceType: row.resource_type as AuditRecord["resourceType"],
    resourceId: row.resource_id,
    outcome: row.outcome as AuditRecord["outcome"],
    occurredAt: row.occurred_at,
    previousValue: row.previous_value,
    newValue: row.new_value,
    reason: row.reason,
    metadata: row.metadata as AuditRecord["metadata"],
    ipAddress: row.ip_address,
    forwardedFor: row.forwarded_for,
    userAgent: row.user_agent,
    deviceInfo: row.device_info,
    correlationId: row.correlation_id,
    causationId: row.causation_id,
    requestId: row.request_id,
    sessionId: row.session_id,
    source: row.source,
    sensitivity: row.sensitivity as AuditRecord["sensitivity"],
    hash: row.hash,
    hashAlgorithm: row.hash_algorithm,
    createdAt: row.created_at
  };
}

function toJson(value: unknown): Json | null {
  if (value === undefined) {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as Json;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function sanitizeSearchTerm(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9.\-\s]/g, "")
    .slice(0, 80);
}

import type { PostgrestError } from "@supabase/supabase-js";
import type {
  IncidentQuery,
  IncidentRepository,
  IncidentSourceReference,
  NotificationQuery,
  NotificationReadScope,
  NotificationRepository
} from "@/notification/application/repositories";
import type { Incident, Notification } from "@/notification/domain";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import {
  mapIncidentInsert,
  mapIncidentRow,
  mapIncidentUpdate,
  mapNotificationInsert,
  mapNotificationRow
} from "@/notification/infrastructure/supabase/supabase-notification-mappers";

export class SupabaseNotificationRepository
  implements NotificationRepository
{
  constructor(private readonly supabase: AppSupabaseClient) {}

  async saveMany(notifications: Notification[]): Promise<void> {
    if (notifications.length === 0) {
      return;
    }

    const { error } = await this.supabase
      .from("notifications")
      .upsert(notifications.map(mapNotificationInsert), {
        onConflict: "incident_id,recipient_type,channel"
      });

    this.throwIfSupabaseError(error);
  }

  async findMany(queryInput: NotificationQuery): Promise<Notification[]> {
    let query = this.supabase
      .from("notifications")
      .select("*")
      .eq("tenant_id", queryInput.tenantId)
      .order("created_at", { ascending: false })
      .limit(queryInput.limit);

    if (queryInput.businessUnitId) {
      query = query.eq("business_unit_id", queryInput.businessUnitId);
    }

    if (queryInput.status) {
      query = query.eq("status", queryInput.status);
    }

    if (queryInput.channel) {
      query = query.eq("channel", queryInput.channel);
    }

    if (queryInput.incidentId) {
      query = query.eq("incident_id", queryInput.incidentId);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapNotificationRow);
  }

  async findByIncident(
    scope: NotificationReadScope,
    incidentId: string
  ): Promise<Notification[]> {
    let query = this.supabase
      .from("notifications")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("incident_id", incidentId)
      .order("created_at", { ascending: false });

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapNotificationRow);
  }

  async updateMany(notifications: Notification[]): Promise<void> {
    if (notifications.length === 0) {
      return;
    }

    const { error } = await this.supabase
      .from("notifications")
      .upsert(notifications.map(mapNotificationInsert), { onConflict: "id" });

    this.throwIfSupabaseError(error);
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}

export class SupabaseIncidentRepository implements IncidentRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async save(incident: Incident): Promise<void> {
    const { error } = await this.supabase
      .from("incidents")
      .upsert(mapIncidentInsert(incident), {
        onConflict: "tenant_id,source_event,source_event_id"
      });

    this.throwIfSupabaseError(error);
  }

  async findById(scope: NotificationReadScope, id: string): Promise<Incident | null> {
    let query = this.supabase
      .from("incidents")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("id", id)
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    return data ? mapIncidentRow(data) : null;
  }

  async findBySource(reference: IncidentSourceReference): Promise<Incident | null> {
    const { data, error } = await this.supabase
      .from("incidents")
      .select("*")
      .eq("tenant_id", reference.tenantId)
      .eq("source_event", reference.sourceEvent)
      .eq("source_event_id", reference.sourceEventId)
      .limit(1)
      .maybeSingle();

    this.throwIfSupabaseError(error);

    return data ? mapIncidentRow(data) : null;
  }

  async findMany(queryInput: IncidentQuery): Promise<Incident[]> {
    let query = this.supabase
      .from("incidents")
      .select("*")
      .eq("tenant_id", queryInput.tenantId)
      .order("created_at", { ascending: false })
      .limit(queryInput.limit);

    if (queryInput.businessUnitId) {
      query = query.eq("business_unit_id", queryInput.businessUnitId);
    }

    if (queryInput.status) {
      query = query.eq("status", queryInput.status);
    }

    if (queryInput.severity) {
      query = query.eq("severity", queryInput.severity);
    }

    if (queryInput.category) {
      query = query.eq("category", queryInput.category);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapIncidentRow);
  }

  async update(incident: Incident): Promise<void> {
    const { error } = await this.supabase
      .from("incidents")
      .update(mapIncidentUpdate(incident))
      .eq("tenant_id", incident.tenantId)
      .eq("id", incident.id);

    this.throwIfSupabaseError(error);
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}

import type { PostgrestError } from "@supabase/supabase-js";
import type {
  CopilotRepository,
  CopilotSessionReadQuery,
  CopilotSessionReadScope
} from "@/copilot/application";
import type {
  CopilotContextSnapshot,
  CopilotMessage,
  CopilotSession
} from "@/copilot/domain";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import {
  mapCopilotContextSnapshotInsert,
  mapCopilotMessageInsert,
  mapCopilotMessageRow,
  mapCopilotSessionInsert,
  mapCopilotSessionRow
} from "@/copilot/infrastructure/supabase/supabase-copilot-mappers";

export class SupabaseCopilotRepository implements CopilotRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async saveSession(session: CopilotSession): Promise<void> {
    const { error } = await this.supabase
      .from("copilot_sessions")
      .upsert(mapCopilotSessionInsert(session), { onConflict: "id" });

    this.throwIfSupabaseError(error);
  }

  async saveMessage(message: CopilotMessage): Promise<void> {
    const { error } = await this.supabase
      .from("copilot_messages")
      .upsert(mapCopilotMessageInsert(message), { onConflict: "id" });

    this.throwIfSupabaseError(error);
  }

  async saveContextSnapshot(contextSnapshot: CopilotContextSnapshot): Promise<void> {
    const { error } = await this.supabase
      .from("copilot_context_snapshots")
      .upsert(mapCopilotContextSnapshotInsert(contextSnapshot), { onConflict: "id" });

    this.throwIfSupabaseError(error);
  }

  async findSessions(queryInput: CopilotSessionReadQuery): Promise<CopilotSession[]> {
    let query = this.supabase
      .from("copilot_sessions")
      .select("*")
      .eq("tenant_id", queryInput.tenantId)
      .order("updated_at", { ascending: false })
      .limit(queryInput.limit);

    if (queryInput.businessUnitId) {
      query = query.eq("business_unit_id", queryInput.businessUnitId);
    }

    if (queryInput.status) {
      query = query.eq("status", queryInput.status);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapCopilotSessionRow);
  }

  async findSessionById(
    scope: CopilotSessionReadScope,
    id: string
  ): Promise<CopilotSession | null> {
    let query = this.supabase
      .from("copilot_sessions")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("id", id)
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    return data ? mapCopilotSessionRow(data) : null;
  }

  async findMessages(sessionId: string): Promise<CopilotMessage[]> {
    const { data, error } = await this.supabase
      .from("copilot_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    this.throwIfSupabaseError(error);

    return (data ?? []).map(mapCopilotMessageRow);
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}

import type { AuditContext, AuditPayload } from "./audit-context";
import { AuditLogger } from "./audit-logger";
import { SupabaseAuditRepository } from "./supabase-audit-repository";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export class SimpleUuidGenerator implements IdGenerator {
  nextId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function createAuditLogger(supabase: SupabaseClient<Database>): AuditLogger {
  const repository = new SupabaseAuditRepository(supabase);
  const idGenerator = new SimpleUuidGenerator();

  return new AuditLogger({ auditRepository: repository, idGenerator });
}

export async function logOrderPaidAudit(
  auditLogger: AuditLogger,
  context: AuditContext,
  orderId: string,
  previousStatus: string,
  newStatus: string,
  paymentId: string
) {
  const payload: AuditPayload = {
    action: "order.paid",
    resourceType: "order",
    resourceId: orderId,
    previousValue: { status: previousStatus },
    newValue: { status: newStatus, paymentId },
    metadata: {
      correlationId: context.correlationId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    }
  };

  await auditLogger.log(context, payload);
}

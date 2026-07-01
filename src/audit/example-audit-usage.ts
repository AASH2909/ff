import type { IdGenerator } from "@/application/ports/id-generator";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import type { AuditContext, AuditPayload } from "./audit-context";
import { Sha256AuditHashProvider } from "./audit-hash";
import { AuditLogger } from "./audit-logger";
import { SupabaseAuditRepository } from "./supabase-audit-repository";

export class SimpleUuidGenerator implements IdGenerator {
  nextId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function createAuditLogger(supabase: AppSupabaseClient): AuditLogger {
  return new AuditLogger({
    auditRepository: new SupabaseAuditRepository(supabase),
    idGenerator: new SimpleUuidGenerator(),
    hashProvider: new Sha256AuditHashProvider()
  });
}

export function createRequestAuditContext(input: {
  tenantId: string;
  userId: string;
  actorDisplayName?: string;
  correlationId?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  forwardedFor?: string;
  userAgent?: string;
  deviceInfo?: string;
}): AuditContext {
  return {
    tenantId: input.tenantId,
    userId: input.userId,
    actorType: "user",
    actorDisplayName: input.actorDisplayName,
    correlationId: input.correlationId,
    requestId: input.requestId,
    sessionId: input.sessionId,
    ipAddress: input.ipAddress,
    forwardedFor: input.forwardedFor,
    userAgent: input.userAgent,
    deviceInfo: input.deviceInfo,
    source: "controlos.web"
  };
}

export async function logOrderPaidAudit(
  auditLogger: AuditLogger,
  context: AuditContext,
  input: {
    orderId: string;
    previousStatus: string;
    newStatus: string;
    paymentId: string;
    totalAmount: number;
    currency: string;
  }
) {
  await auditLogger.log(context, {
    action: "order.paid",
    resourceType: "order",
    resourceId: input.orderId,
    previousValue: {
      status: input.previousStatus
    },
    newValue: {
      status: input.newStatus,
      paymentId: input.paymentId,
      total: {
        amount: input.totalAmount,
        currency: input.currency
      }
    },
    metadata: {
      complianceTags: ["payment", "pos"]
    }
  });
}

export async function logInventoryWriteOffAudit(
  auditLogger: AuditLogger,
  context: AuditContext,
  input: {
    inventoryId: string;
    productId: string;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
  }
) {
  await auditLogger.log(context, {
    action: "inventory.written_off",
    resourceType: "inventory",
    resourceId: input.inventoryId,
    reason: input.reason,
    previousValue: {
      productId: input.productId,
      availableQuantity: input.previousQuantity
    },
    newValue: {
      productId: input.productId,
      availableQuantity: input.newQuantity
    },
    metadata: {
      complianceTags: ["inventory", "loss-control"]
    }
  });
}

export async function logPermissionChangeAudit(
  auditLogger: AuditLogger,
  context: AuditContext,
  input: {
    employeeId: string;
    permission: string;
    granted: boolean;
  }
) {
  const payload: AuditPayload = {
    action: input.granted ? "permission.granted" : "permission.revoked",
    resourceType: "permission",
    resourceId: input.employeeId,
    previousValue: {
      permission: input.permission,
      enabled: !input.granted
    },
    newValue: {
      permission: input.permission,
      enabled: input.granted
    },
    sensitivity: "restricted",
    metadata: {
      complianceTags: ["access-control"]
    }
  };

  await auditLogger.log(context, payload);
}

export async function logPricingAndDiscountAudit(
  auditLogger: AuditLogger,
  context: AuditContext,
  input: {
    productId: string;
    previousPrice: number;
    newPrice: number;
    discountId: string;
    discountAmount: number;
  }
) {
  await auditLogger.logMany(context, [
    {
      action: "pricing.updated",
      resourceType: "pricing",
      resourceId: input.productId,
      previousValue: { price: input.previousPrice },
      newValue: { price: input.newPrice }
    },
    {
      action: "discount.applied",
      resourceType: "discount",
      resourceId: input.discountId,
      previousValue: null,
      newValue: {
        productId: input.productId,
        amount: input.discountAmount
      }
    }
  ]);
}

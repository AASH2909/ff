import type { IdGenerator } from "@/application/ports/id-generator";
import type { AuditContext, AuditPayload } from "./audit-context";
import type { AuditRecord, AuditRepository } from "./types";

export type AuditLoggerDependencies = {
  auditRepository: AuditRepository;
  idGenerator: IdGenerator;
  now?: () => string;
};

export class AuditLogger {
  private readonly now: () => string;

  constructor(private readonly dependencies: AuditLoggerDependencies) {
    this.now = dependencies.now ?? (() => new Date().toISOString());
  }

  async log(context: AuditContext, payload: AuditPayload): Promise<void> {
    const record: AuditRecord = {
      id: this.dependencies.idGenerator.nextId(),
      tenantId: context.tenantId,
      userId: context.userId,
      action: payload.action as any,
      resourceType: payload.resourceType as any,
      resourceId: payload.resourceId ?? null,
      occurredAt: this.now(),
      previousValue: payload.previousValue,
      newValue: payload.newValue,
      metadata: {
        ...context.metadata,
        correlationId: payload.metadata?.correlationId ?? context.correlationId,
        sessionId: payload.metadata?.sessionId ?? context.sessionId,
        ipAddress: payload.metadata?.ipAddress ?? context.ipAddress,
        userAgent: payload.metadata?.userAgent ?? context.userAgent,
        deviceInfo: payload.metadata?.deviceInfo ?? context.deviceInfo,
        ...payload.metadata
      },
      ipAddress: payload.metadata?.ipAddress ?? context.ipAddress,
      userAgent: payload.metadata?.userAgent ?? context.userAgent,
      deviceInfo: payload.metadata?.deviceInfo ?? context.deviceInfo,
      correlationId: payload.metadata?.correlationId ?? context.correlationId ?? null,
      createdAt: this.now()
    };

    await this.dependencies.auditRepository.save(record);
  }
}

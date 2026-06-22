import type { IdGenerator } from "@/application/ports/id-generator";
import type { AuditContext, AuditPayload } from "./audit-context";
import type { AuditRepository } from "./audit-repository";
import { createAuditSanitizer, type AuditSanitizer } from "./audit-sanitizer";
import {
  isAuditAction,
  isAuditActorType,
  isAuditOutcome,
  isAuditResourceType,
  isAuditSensitivity,
  type AuditActorType,
  type AuditRecord
} from "./types";

export type AuditHashResult = {
  hash: string;
  algorithm: string;
};

export interface AuditHashProvider {
  hash(record: Omit<AuditRecord, "hash" | "hashAlgorithm">): Promise<AuditHashResult>;
}

export type AuditLoggerDependencies = {
  auditRepository: AuditRepository;
  idGenerator: IdGenerator;
  now?: () => string;
  sanitizer?: AuditSanitizer;
  hashProvider?: AuditHashProvider;
};

export class AuditValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditValidationError";
  }
}

export class AuditLogger {
  private readonly now: () => string;
  private readonly sanitizer: AuditSanitizer;

  constructor(private readonly dependencies: AuditLoggerDependencies) {
    this.now = dependencies.now ?? (() => new Date().toISOString());
    this.sanitizer = dependencies.sanitizer ?? createAuditSanitizer();
  }

  async log(context: AuditContext, payload: AuditPayload): Promise<AuditRecord> {
    const record = await this.buildRecord(context, payload);

    await this.dependencies.auditRepository.save(record);

    return record;
  }

  async logMany(context: AuditContext, payloads: AuditPayload[]): Promise<AuditRecord[]> {
    const records: AuditRecord[] = [];

    for (const payload of payloads) {
      records.push(await this.buildRecord(context, payload));
    }

    await this.dependencies.auditRepository.saveMany(records);

    return records;
  }

  private async buildRecord(context: AuditContext, payload: AuditPayload): Promise<AuditRecord> {
    this.assertValid(context, payload);

    const occurredAt = payload.occurredAt ?? this.now();
    const createdAt = this.now();
    const metadata = this.mergeMetadata(context, payload);
    const recordWithoutHash: Omit<AuditRecord, "hash" | "hashAlgorithm"> = {
      id: this.dependencies.idGenerator.nextId(),
      tenantId: context.tenantId.trim(),
      userId: context.userId.trim(),
      actorType: context.actorType ?? inferActorType(context.userId),
      actorDisplayName: context.actorDisplayName ?? null,
      action: payload.action,
      resourceType: payload.resourceType,
      resourceId: payload.resourceId?.trim() || null,
      outcome: payload.outcome ?? "success",
      occurredAt,
      previousValue: this.sanitizer(payload.previousValue),
      newValue: this.sanitizer(payload.newValue),
      reason: payload.reason ?? null,
      metadata,
      ipAddress: context.network?.ipAddress ?? context.ipAddress ?? null,
      forwardedFor: context.network?.forwardedFor ?? context.forwardedFor ?? null,
      userAgent: context.device?.userAgent ?? context.userAgent ?? null,
      deviceInfo: context.device?.deviceInfo ?? context.deviceInfo ?? null,
      correlationId:
        payload.metadata?.correlationId ??
        context.metadata?.correlationId ??
        context.correlationId ??
        null,
      causationId:
        payload.metadata?.causationId ?? context.metadata?.causationId ?? context.causationId ?? null,
      requestId: payload.metadata?.requestId ?? context.metadata?.requestId ?? context.requestId ?? null,
      sessionId: payload.metadata?.sessionId ?? context.metadata?.sessionId ?? context.sessionId ?? null,
      source: payload.metadata?.source ?? context.metadata?.source ?? context.source ?? null,
      sensitivity: payload.sensitivity ?? "confidential",
      createdAt
    };

    const hashResult = await this.dependencies.hashProvider?.hash(recordWithoutHash);

    return {
      ...recordWithoutHash,
      hash: hashResult?.hash ?? null,
      hashAlgorithm: hashResult?.algorithm ?? null
    };
  }

  private assertValid(context: AuditContext, payload: AuditPayload): void {
    if (!context.tenantId?.trim()) {
      throw new AuditValidationError("Audit tenant id is required.");
    }

    if (!context.userId?.trim()) {
      throw new AuditValidationError("Audit user id is required.");
    }

    if (!isAuditAction(payload.action)) {
      throw new AuditValidationError("Audit action is not supported.");
    }

    if (!isAuditResourceType(payload.resourceType)) {
      throw new AuditValidationError("Audit resource type is not supported.");
    }

    if (context.actorType && !isAuditActorType(context.actorType)) {
      throw new AuditValidationError("Audit actor type is not supported.");
    }

    if (payload.outcome && !isAuditOutcome(payload.outcome)) {
      throw new AuditValidationError("Audit outcome is not supported.");
    }

    if (payload.sensitivity && !isAuditSensitivity(payload.sensitivity)) {
      throw new AuditValidationError("Audit sensitivity is not supported.");
    }

    if (payload.occurredAt && Number.isNaN(Date.parse(payload.occurredAt))) {
      throw new AuditValidationError("Audit occurredAt must be a valid ISO date-time string.");
    }
  }

  private mergeMetadata(context: AuditContext, payload: AuditPayload) {
    return {
      ...context.metadata,
      correlationId: payload.metadata?.correlationId ?? context.metadata?.correlationId ?? context.correlationId,
      causationId: payload.metadata?.causationId ?? context.metadata?.causationId ?? context.causationId,
      requestId: payload.metadata?.requestId ?? context.metadata?.requestId ?? context.requestId,
      sessionId: payload.metadata?.sessionId ?? context.metadata?.sessionId ?? context.sessionId,
      source: payload.metadata?.source ?? context.metadata?.source ?? context.source,
      ipAddress: context.network?.ipAddress ?? context.ipAddress,
      forwardedFor: context.network?.forwardedFor ?? context.forwardedFor,
      userAgent: context.device?.userAgent ?? context.userAgent,
      deviceInfo: context.device?.deviceInfo ?? context.deviceInfo,
      browser: context.device?.browser,
      operatingSystem: context.device?.operatingSystem,
      deviceType: context.device?.deviceType,
      deviceId: context.device?.deviceId,
      country: context.network?.country,
      region: context.network?.region,
      city: context.network?.city,
      ...payload.metadata
    };
  }
}

function inferActorType(userId: string): AuditActorType {
  if (userId === "system") {
    return "system";
  }

  return "user";
}

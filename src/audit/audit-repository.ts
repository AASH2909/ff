import type { AuditQueryFilters, AuditQueryResult, AuditRecord } from "./types";

export interface AuditRepository {
  save(record: AuditRecord): Promise<void>;
  findById(tenantId: string, auditId: string): Promise<AuditRecord | null>;
  query(filters: AuditQueryFilters): Promise<AuditQueryResult>;
}

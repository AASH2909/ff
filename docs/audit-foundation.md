# CONTROL OS Audit Foundation

## Objective
Provide enterprise-grade traceability and accountability for tenant operations with a consistent audit foundation covering orders, payments, inventory, employees, permissions, pricing, discounts, refunds, and more.

## Audit Architecture
The audit foundation is built on:
- an audit record per tracked action
- tenant-aware storage
- immutable write-once append model
- rich metadata for correlation and device/IP context
- a queryable repository with efficient indexes
- retention and compliance controls

### Core audit fields
- `tenantId`
- `userId`
- `action`
- `resourceType`
- `resourceId`
- `occurredAt`
- `previousValue`
- `newValue`
- `metadata`
- `ipAddress`
- `userAgent`
- `deviceInfo`
- `correlationId`
- `createdAt`

## Database schema
Create an append-only `audit_logs` table.

### SQL migration
```sql
create table if not exists audit_logs (
  id uuid primary key,
  tenant_id text not null,
  user_id text not null,
  action text not null,
  resource_type text not null,
  resource_id text,
  occurred_at timestamptz not null,
  previous_value jsonb,
  new_value jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  device_info text,
  correlation_id text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_tenant_id_idx on audit_logs (tenant_id);
create index if not exists audit_logs_tenant_action_idx on audit_logs (tenant_id, action);
create index if not exists audit_logs_tenant_resource_idx on audit_logs (tenant_id, resource_type, resource_id);
create index if not exists audit_logs_tenant_correlation_idx on audit_logs (tenant_id, correlation_id);
create index if not exists audit_logs_occurred_at_idx on audit_logs (occurred_at desc);
create index if not exists audit_logs_metadata_gin_idx on audit_logs using gin (metadata jsonb_path_ops);
```

### Index strategy
- `tenant_id` to isolate tenant data and support query partitioning.
- composite index `(tenant_id, action)` for action-focused audits.
- composite index `(tenant_id, resource_type, resource_id)` for resource queries.
- `correlation_id` index for tracing across distributed flows.
- `occurred_at` descending index for recent-event queries.
- GIN index on `metadata` for flexible JSON field search.

## Query strategy
- always constrain by `tenantId`
- prefer key filters (`userId`, `action`, `resourceType`, `resourceId`, `correlationId`)
- use time range filters for efficient scans
- paginate using `limit` and `offset` or keyset pagination for large datasets
- avoid full-text scans on JSON fields unless necessary

## Retention policy
- retain high-fidelity audit logs for a minimum of 1 year by default
- move older events to cold storage after 2-3 years
- support legal hold for tenant-specific retention extensions
- use write-once append model; do not delete unless part of legal retention workflows

### Suggested retention tiers
- 0-1 year: online hot storage
- 1-3 years: warm storage or compressed archive
- 3+ years: cold object storage or compliance archive

## Compliance recommendations
- enforce role-based access to audit logs
- encrypt audit data at rest and in transit
- sign or hash records for tamper evidence where required
- log deletions, exports, and access to audit data itself
- maintain an audit trail for audit system changes
- provide tenant-aware access controls and masking for PII

## Sample audit records
```json
{
  "id": "7e58f7d3-9a7e-4c2d-8fa6-1f4b0dee37c2",
  "tenantId": "tenant_abc",
  "userId": "user_123",
  "action": "order.paid",
  "resourceType": "order",
  "resourceId": "order_789",
  "occurredAt": "2026-06-22T12:18:23.456Z",
  "previousValue": { "status": "open", "total": 1500 },
  "newValue": { "status": "paid", "paymentId": "payment_456" },
  "metadata": {
    "ipAddress": "203.0.113.10",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "deviceInfo": "Chrome on Windows",
    "correlationId": "corr_321",
    "sessionId": "sess_987"
  },
  "createdAt": "2026-06-22T12:18:23.456Z"
}
```

## Implementation examples
- `src/audit/audit-logger.ts`
- `src/audit/supabase-audit-repository.ts`
- `src/audit/types.ts`
- `src/audit/audit-context.ts`

### Example usage
```ts
import { AuditLogger } from "@/audit/audit-logger";
import { SupabaseAuditRepository } from "@/audit/supabase-audit-repository";
import { UuidGenerator } from "@/application/ports/uuid-generator";

const auditLogger = new AuditLogger({
  auditRepository: new SupabaseAuditRepository(supabase),
  idGenerator: new UuidGenerator()
});

await auditLogger.log(
  {
    tenantId: "tenant_abc",
    userId: "user_123",
    correlationId: "corr_321",
    ipAddress: "203.0.113.10",
    userAgent: "Mozilla/5.0"
  },
  {
    action: "order.paid",
    resourceType: "order",
    resourceId: "order_789",
    previousValue: { status: "open", total: 1500 },
    newValue: { status: "paid", paymentId: "payment_456" }
  }
);
```

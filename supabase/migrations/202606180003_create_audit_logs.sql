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

-- Dashboard Intelligence consumes these read-model tables.
-- Control Score calculation remains owned by the Control Score Engine.

create table if not exists control_scores (
  id uuid primary key,
  tenant_id text not null,
  business_unit_id text not null,
  business_unit_name text,
  score numeric(5, 2) not null check (score >= 0 and score <= 100),
  status text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  calculated_at timestamptz not null default now(),
  source_version text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  check (period_start <= period_end)
);

create index if not exists control_scores_tenant_latest_idx
  on control_scores (tenant_id, business_unit_id, calculated_at desc);

create index if not exists control_scores_tenant_period_idx
  on control_scores (tenant_id, business_unit_id, period_start, period_end);

create table if not exists control_score_domain_scores (
  id uuid primary key,
  tenant_id text not null,
  control_score_id uuid not null references control_scores (id) on delete cascade,
  domain_code text not null,
  domain_name text not null,
  score numeric(5, 2) not null check (score >= 0 and score <= 100),
  weight numeric(5, 2) not null check (weight >= 0 and weight <= 100),
  contribution numeric(8, 4) not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  calculated_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (control_score_id, domain_code),
  check (period_start <= period_end)
);

create index if not exists control_score_domain_scores_score_idx
  on control_score_domain_scores (tenant_id, control_score_id, contribution desc);

create index if not exists control_score_domain_scores_domain_idx
  on control_score_domain_scores (tenant_id, domain_code, calculated_at desc);

create table if not exists control_score_explanations (
  id uuid primary key,
  tenant_id text not null,
  control_score_id uuid not null references control_scores (id) on delete cascade,
  domain_code text,
  metric_code text,
  metric_name text,
  driver_type text,
  contribution numeric(8, 4) not null default 0,
  severity text not null default 'information',
  explanation text not null,
  created_at timestamptz not null default now(),
  check (driver_type is null or driver_type in ('positive', 'negative', 'risk', 'neutral')),
  check (severity in ('information', 'info', 'warning', 'critical', 'severe', 'low', 'medium', 'high'))
);

create index if not exists control_score_explanations_score_idx
  on control_score_explanations (tenant_id, control_score_id, created_at desc);

create index if not exists control_score_explanations_driver_idx
  on control_score_explanations (tenant_id, driver_type, severity);

create table if not exists dashboard_alerts (
  id uuid primary key,
  tenant_id text not null,
  business_unit_id text,
  severity text not null check (severity in ('information', 'info', 'warning', 'critical', 'severe', 'low', 'medium', 'high')),
  status text not null default 'active' check (status in ('active', 'acknowledged', 'resolved')),
  title text not null,
  message text not null,
  source text not null default 'dashboard',
  domain_code text,
  metric_code text,
  resource_type text,
  resource_id text,
  occurred_at timestamptz not null,
  resolved_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dashboard_alerts_active_idx
  on dashboard_alerts (tenant_id, business_unit_id, status, occurred_at desc);

create index if not exists dashboard_alerts_severity_idx
  on dashboard_alerts (tenant_id, severity, status);

create index if not exists dashboard_alerts_resource_idx
  on dashboard_alerts (tenant_id, resource_type, resource_id);

create or replace function update_dashboard_alert_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists dashboard_alerts_update_timestamp on dashboard_alerts;

create trigger dashboard_alerts_update_timestamp
before update on dashboard_alerts
for each row
execute function update_dashboard_alert_timestamp();

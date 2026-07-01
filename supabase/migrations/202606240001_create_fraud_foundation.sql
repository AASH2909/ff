-- Fraud Incidents Table
create table if not exists fraud_incidents (
  id uuid primary key,
  tenant_id text not null,
  incident_id text not null unique,
  status text not null default 'detected', -- detected, investigating, confirmed, resolved, dismissed
  severity text not null, -- low, medium, high, critical
  risk_score integer not null default 0, -- 0-1000
  patterns jsonb not null default '[]', -- Array of suspicious patterns
  order_id text,
  employee_id text,
  location_id text,
  shift_id text,
  investigation_notes text,
  dismissal_reason text,
  detected_at timestamptz not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fraud_incidents_tenant_id_idx on fraud_incidents (tenant_id);
create index if not exists fraud_incidents_status_idx on fraud_incidents (tenant_id, status);
create index if not exists fraud_incidents_severity_idx on fraud_incidents (tenant_id, severity);
create index if not exists fraud_incidents_employee_id_idx on fraud_incidents (tenant_id, employee_id);
create index if not exists fraud_incidents_order_id_idx on fraud_incidents (tenant_id, order_id);
create index if not exists fraud_incidents_location_id_idx on fraud_incidents (tenant_id, location_id);
create index if not exists fraud_incidents_shift_id_idx on fraud_incidents (tenant_id, shift_id);
create index if not exists fraud_incidents_detected_at_idx on fraud_incidents (detected_at desc);
create index if not exists fraud_incidents_risk_score_idx on fraud_incidents (tenant_id, risk_score desc);

-- Fraud Rules Configuration Table
create table if not exists fraud_rules (
  id uuid primary key,
  tenant_id text not null,
  rule_type text not null, -- refund, cancellation, discount, inventory, employee, velocity
  rule_name text not null,
  enabled boolean not null default true,
  thresholds jsonb not null, -- Rule-specific thresholds
  severity_base text not null, -- low, medium, high
  weight integer not null default 50, -- 0-100
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, rule_type)
);

create index if not exists fraud_rules_tenant_id_idx on fraud_rules (tenant_id);
create index if not exists fraud_rules_enabled_idx on fraud_rules (tenant_id, enabled);

-- Fraud Monitoring Events Table (for analytics)
create table if not exists fraud_monitoring_events (
  id uuid primary key,
  tenant_id text not null,
  event_type text not null, -- refund_anomaly, cancellation_anomaly, etc.
  incident_id text,
  employee_id text,
  order_id text,
  location_id text,
  shift_id text,
  details jsonb not null,
  risk_score integer,
  severity text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists fraud_monitoring_events_tenant_id_idx on fraud_monitoring_events (tenant_id);
create index if not exists fraud_monitoring_events_event_type_idx on fraud_monitoring_events (tenant_id, event_type);
create index if not exists fraud_monitoring_events_employee_id_idx on fraud_monitoring_events (tenant_id, employee_id);
create index if not exists fraud_monitoring_events_incident_id_idx on fraud_monitoring_events (tenant_id, incident_id);
create index if not exists fraud_monitoring_events_occurred_at_idx on fraud_monitoring_events (occurred_at desc);

-- Fraud Alerts Table
create table if not exists fraud_alerts (
  id uuid primary key,
  tenant_id text not null,
  alert_id text not null unique,
  incident_id text not null,
  severity text not null, -- low, medium, high, critical
  alert_type text not null, -- automated, manual, escalation
  recipient_type text not null, -- system_admin, location_manager, compliance_officer, all
  status text not null default 'pending', -- pending, acknowledged, resolved
  action_required text,
  generated_at timestamptz not null,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists fraud_alerts_tenant_id_idx on fraud_alerts (tenant_id);
create index if not exists fraud_alerts_incident_id_idx on fraud_alerts (tenant_id, incident_id);
create index if not exists fraud_alerts_status_idx on fraud_alerts (tenant_id, status);
create index if not exists fraud_alerts_severity_idx on fraud_alerts (tenant_id, severity);
create index if not exists fraud_alerts_generated_at_idx on fraud_alerts (generated_at desc);

-- Fraud Statistics Summary Table (for dashboards)
create table if not exists fraud_statistics (
  id uuid primary key,
  tenant_id text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  total_incidents integer not null default 0,
  critical_incidents integer not null default 0,
  high_incidents integer not null default 0,
  medium_incidents integer not null default 0,
  low_incidents integer not null default 0,
  confirmed_incidents integer not null default 0,
  dismissed_incidents integer not null default 0,
  average_risk_score numeric not null default 0,
  total_prevented_loss numeric default 0,
  created_at timestamptz not null default now(),
  unique(tenant_id, period_start, period_end)
);

create index if not exists fraud_statistics_tenant_id_idx on fraud_statistics (tenant_id);
create index if not exists fraud_statistics_period_idx on fraud_statistics (tenant_id, period_start, period_end);

-- Update trigger for fraud_incidents
create or replace function update_fraud_incident_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger fraud_incidents_update_timestamp
before update on fraud_incidents
for each row
execute function update_fraud_incident_timestamp();

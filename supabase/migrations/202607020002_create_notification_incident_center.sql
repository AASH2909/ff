-- Operations Intelligence: Notification & Incident Center.
-- This module stores internal incidents and notifications created from domain events only.

create table if not exists incidents (
  id uuid primary key,
  tenant_id text not null,
  business_unit_id text,
  severity text not null check (severity in ('information', 'warning', 'critical', 'severe')),
  status text not null default 'NEW' check (status in ('NEW', 'PENDING', 'SENT', 'ACKNOWLEDGED', 'RESOLVED', 'FAILED')),
  title text not null,
  description text not null,
  source_event text not null,
  source_event_id text not null,
  category text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  resolved_at timestamptz,
  metadata jsonb not null default '{}',
  unique (tenant_id, source_event, source_event_id)
);

create index if not exists incidents_tenant_status_idx
  on incidents (tenant_id, business_unit_id, status, created_at desc);

create index if not exists incidents_tenant_severity_idx
  on incidents (tenant_id, severity, status, created_at desc);

create index if not exists incidents_source_event_idx
  on incidents (tenant_id, source_event, source_event_id);

create table if not exists notifications (
  id uuid primary key,
  tenant_id text not null,
  business_unit_id text,
  incident_id uuid not null references incidents (id) on delete cascade,
  recipient_type text not null check (recipient_type in ('EXECUTIVE', 'OPERATIONS', 'CONTROL_CENTER')),
  channel text not null check (channel in ('IN_APP', 'DASHBOARD', 'API')),
  status text not null default 'SENT' check (status in ('NEW', 'PENDING', 'SENT', 'ACKNOWLEDGED', 'RESOLVED', 'FAILED')),
  priority text not null check (priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  created_at timestamptz not null,
  sent_at timestamptz,
  acknowledged_at timestamptz,
  metadata jsonb not null default '{}',
  unique (incident_id, recipient_type, channel)
);

create index if not exists notifications_tenant_status_idx
  on notifications (tenant_id, business_unit_id, status, created_at desc);

create index if not exists notifications_incident_idx
  on notifications (tenant_id, incident_id, created_at desc);

create index if not exists notifications_channel_idx
  on notifications (tenant_id, channel, status, created_at desc);

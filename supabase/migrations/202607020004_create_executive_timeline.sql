-- Executive Timeline.
-- Stores causal explanation entries and links derived from Analytics Context and Predictive outputs.

create table if not exists timeline_entries (
  id text primary key,
  tenant_id text not null,
  business_unit_id text,
  occurred_at timestamptz not null,
  event_type text not null,
  timeline_type text not null check (
    timeline_type in ('FACT', 'CAUSE', 'EFFECT', 'PREDICTION', 'RECOMMENDATION')
  ),
  title text not null,
  summary text not null,
  severity text not null check (severity in ('INFO', 'WARNING', 'CRITICAL', 'SEVERE')),
  source text not null check (source in ('ANALYTICS_CONTEXT', 'PREDICTIVE', 'EVENT_BUS')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists timeline_entries_tenant_latest_idx
  on timeline_entries (tenant_id, business_unit_id, occurred_at desc);

create index if not exists timeline_entries_tenant_type_idx
  on timeline_entries (tenant_id, business_unit_id, timeline_type, severity, occurred_at desc);

create table if not exists timeline_links (
  tenant_id text not null,
  business_unit_id text,
  source_entry_id text not null references timeline_entries (id) on delete cascade,
  target_entry_id text not null references timeline_entries (id) on delete cascade,
  relation_type text not null check (
    relation_type in ('CAUSES', 'RESULTS_IN', 'RELATES_TO', 'SUPPORTS', 'PREDICTS')
  ),
  confidence numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
  created_at timestamptz not null,
  primary key (source_entry_id, target_entry_id, relation_type)
);

create index if not exists timeline_links_tenant_source_idx
  on timeline_links (tenant_id, business_unit_id, source_entry_id);

create index if not exists timeline_links_tenant_target_idx
  on timeline_links (tenant_id, business_unit_id, target_entry_id);

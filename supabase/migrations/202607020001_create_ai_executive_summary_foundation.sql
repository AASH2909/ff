-- AI Executive Summary Foundation stores deterministic structured summary drafts.
-- No external AI provider is called by this read-model foundation.

create table if not exists ai_executive_summaries (
  id uuid primary key,
  tenant_id text not null,
  business_unit_id text,
  period_start timestamptz not null,
  period_end timestamptz not null,
  summary_type text not null check (summary_type in ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'READY', 'FAILED')),
  headline text not null,
  overall_assessment text not null,
  key_positive_signals jsonb not null default '[]',
  key_negative_signals jsonb not null default '[]',
  critical_risks jsonb not null default '[]',
  recommended_actions jsonb not null default '[]',
  confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
  source_modules jsonb not null default '[]',
  generated_at timestamptz not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_start <= period_end)
);

create index if not exists ai_executive_summaries_latest_idx
  on ai_executive_summaries (tenant_id, business_unit_id, summary_type, generated_at desc);

create index if not exists ai_executive_summaries_period_idx
  on ai_executive_summaries (tenant_id, business_unit_id, period_start, period_end);

create or replace function update_ai_executive_summary_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ai_executive_summaries_update_timestamp on ai_executive_summaries;

create trigger ai_executive_summaries_update_timestamp
before update on ai_executive_summaries
for each row
execute function update_ai_executive_summary_timestamp();

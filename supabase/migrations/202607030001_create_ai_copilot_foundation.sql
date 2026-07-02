-- AI Copilot Foundation.
-- Stores deterministic CONTROL OS copilot conversations and context snapshots.
-- No external AI provider, model API key, or LLM call is used by this foundation.

create table if not exists copilot_sessions (
  id text primary key,
  tenant_id text not null,
  business_unit_id text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'CLOSED')),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  metadata jsonb not null default '{}',
  check (updated_at >= created_at),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists copilot_sessions_tenant_latest_idx
  on copilot_sessions (tenant_id, business_unit_id, updated_at desc);

create index if not exists copilot_sessions_tenant_status_idx
  on copilot_sessions (tenant_id, business_unit_id, status, updated_at desc);

create table if not exists copilot_messages (
  id text primary key,
  session_id text not null references copilot_sessions (id) on delete cascade,
  role text not null check (role in ('USER', 'ASSISTANT', 'SYSTEM')),
  content text not null,
  intent text not null default 'UNKNOWN' check (
    intent in (
      'BUSINESS_STATUS',
      'WHY_DID_THIS_HAPPEN',
      'WHAT_WILL_HAPPEN_NEXT',
      'WHAT_SHOULD_WE_DO',
      'RISK_EXPLANATION',
      'TIMELINE_EXPLANATION',
      'UNKNOWN'
    )
  ),
  created_at timestamptz not null,
  metadata jsonb not null default '{}',
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists copilot_messages_session_created_idx
  on copilot_messages (session_id, created_at asc);

create table if not exists copilot_context_snapshots (
  id text primary key,
  session_id text not null references copilot_sessions (id) on delete cascade,
  analytics_context jsonb,
  predictions jsonb not null default '[]',
  timeline jsonb not null default '[]',
  decision_scenarios jsonb not null default '[]',
  created_at timestamptz not null,
  metadata jsonb not null default '{}',
  check (analytics_context is null or jsonb_typeof(analytics_context) = 'object'),
  check (jsonb_typeof(predictions) = 'array'),
  check (jsonb_typeof(timeline) = 'array'),
  check (jsonb_typeof(decision_scenarios) = 'array'),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists copilot_context_snapshots_session_created_idx
  on copilot_context_snapshots (session_id, created_at desc);

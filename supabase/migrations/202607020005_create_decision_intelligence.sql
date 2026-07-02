-- Decision Intelligence Engine.
-- Stores deterministic, explainable decision scenarios generated from Analytics Context,
-- Predictive outputs, and Executive Timeline entries only.

create table if not exists decision_scenarios (
  id text primary key,
  tenant_id text not null,
  business_unit_id text,
  scenario_type text not null check (
    scenario_type in (
      'RESOLVE_CRITICAL_INCIDENTS',
      'EXECUTE_HIGH_PRIORITY_RECOMMENDATIONS',
      'REDUCE_FRAUD_RISK',
      'IMPROVE_INVENTORY_CONTROL',
      'IMPROVE_OPERATIONS',
      'STABILIZE_CONTROL_SCORE',
      'MAINTAIN_STABLE_OPERATIONS'
    )
  ),
  title text not null,
  description text not null,
  estimated_impact jsonb not null default '{}',
  confidence numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
  assumptions jsonb not null default '[]',
  risks jsonb not null default '[]',
  metadata jsonb not null default '{}',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  check (jsonb_typeof(estimated_impact) = 'object'),
  check (jsonb_typeof(assumptions) = 'array'),
  check (jsonb_typeof(risks) = 'array'),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists decision_scenarios_tenant_latest_idx
  on decision_scenarios (tenant_id, business_unit_id, created_at desc);

create index if not exists decision_scenarios_tenant_type_idx
  on decision_scenarios (tenant_id, business_unit_id, scenario_type, created_at desc);

create table if not exists decision_actions (
  id text primary key,
  tenant_id text not null,
  business_unit_id text,
  scenario_id text not null references decision_scenarios (id) on delete cascade,
  action_type text not null,
  title text not null,
  description text not null,
  expected_effect text not null,
  effort text not null check (effort in ('LOW', 'MEDIUM', 'HIGH')),
  priority text not null check (priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  action_order integer not null check (action_order > 0),
  created_at timestamptz not null
);

create index if not exists decision_actions_scenario_order_idx
  on decision_actions (scenario_id, action_order asc);

create index if not exists decision_actions_tenant_priority_idx
  on decision_actions (tenant_id, business_unit_id, priority, created_at desc);

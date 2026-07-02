-- Predictive Analytics Engine.
-- Stores deterministic, explainable predictions generated only from Analytics Context.

create table if not exists predictive_predictions (
  id text primary key,
  tenant_id text not null,
  business_unit_id text,
  prediction_type text not null check (
    prediction_type in (
      'CONTROL_SCORE',
      'FRAUD_RISK',
      'OPERATIONAL_RISK',
      'INVENTORY_RISK',
      'FINANCIAL_RISK',
      'STAFF_RISK'
    )
  ),
  prediction_window text not null check (
    prediction_window in ('NEXT_24_HOURS', 'NEXT_7_DAYS', 'NEXT_30_DAYS')
  ),
  risk_level text not null check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  trend text not null check (trend in ('IMPROVING', 'STABLE', 'DECLINING', 'UNKNOWN')),
  confidence numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
  summary text not null,
  predicted_control_score numeric(5, 2) check (
    predicted_control_score is null or
    (predicted_control_score >= 0 and predicted_control_score <= 100)
  ),
  created_at timestamptz not null,
  metadata jsonb not null default '{}'
);

create index if not exists predictive_predictions_tenant_latest_idx
  on predictive_predictions (tenant_id, business_unit_id, created_at desc);

create index if not exists predictive_predictions_tenant_type_idx
  on predictive_predictions (tenant_id, business_unit_id, prediction_type, prediction_window, created_at desc);

create table if not exists predictive_prediction_factors (
  id text primary key,
  tenant_id text not null,
  business_unit_id text,
  prediction_id text not null references predictive_predictions (id) on delete cascade,
  factor_type text not null,
  source text not null,
  title text not null,
  description text not null,
  impact text not null check (impact in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  weight numeric(8, 4) not null check (weight >= 0 and weight <= 100),
  direction text not null check (direction in ('POSITIVE', 'NEGATIVE', 'NEUTRAL')),
  evidence jsonb not null default '[]',
  created_at timestamptz not null
);

create index if not exists predictive_prediction_factors_prediction_idx
  on predictive_prediction_factors (prediction_id, created_at asc);

create index if not exists predictive_prediction_factors_tenant_idx
  on predictive_prediction_factors (tenant_id, business_unit_id, factor_type);

create table if not exists predictive_prediction_scenarios (
  id text primary key,
  tenant_id text not null,
  business_unit_id text,
  prediction_id text not null references predictive_predictions (id) on delete cascade,
  scenario_type text not null,
  title text not null,
  description text not null,
  expected_impact text not null,
  confidence numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
  assumptions jsonb not null default '[]',
  created_at timestamptz not null
);

create index if not exists predictive_prediction_scenarios_prediction_idx
  on predictive_prediction_scenarios (prediction_id, created_at asc);

create index if not exists predictive_prediction_scenarios_tenant_idx
  on predictive_prediction_scenarios (tenant_id, business_unit_id, scenario_type);

alter table audit_logs
  add column if not exists actor_type text not null default 'user',
  add column if not exists actor_display_name text,
  add column if not exists outcome text not null default 'success',
  add column if not exists reason text,
  add column if not exists forwarded_for text,
  add column if not exists causation_id text,
  add column if not exists request_id text,
  add column if not exists session_id text,
  add column if not exists source text,
  add column if not exists sensitivity text not null default 'confidential',
  add column if not exists hash text,
  add column if not exists hash_algorithm text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_actor_type_check'
  ) then
    alter table audit_logs
      add constraint audit_logs_actor_type_check
      check (actor_type in ('user', 'system', 'service', 'api_key'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_outcome_check'
  ) then
    alter table audit_logs
      add constraint audit_logs_outcome_check
      check (outcome in ('success', 'failure', 'denied'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_sensitivity_check'
  ) then
    alter table audit_logs
      add constraint audit_logs_sensitivity_check
      check (sensitivity in ('internal', 'confidential', 'restricted'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_action_check'
  ) then
    alter table audit_logs
      add constraint audit_logs_action_check
      check (
        action in (
          'order.created',
          'order.updated',
          'order.item_added',
          'order.item_removed',
          'order.cancelled',
          'order.paid',
          'order.refunded',
          'payment.created',
          'payment.captured',
          'payment.failed',
          'payment.refunded',
          'inventory.received',
          'inventory.adjusted',
          'inventory.written_off',
          'inventory.counted',
          'employee.created',
          'employee.updated',
          'employee.deactivated',
          'employee.role_assigned',
          'employee.role_removed',
          'permission.granted',
          'permission.revoked',
          'permission.role_created',
          'permission.role_updated',
          'pricing.created',
          'pricing.updated',
          'pricing.deleted',
          'discount.created',
          'discount.updated',
          'discount.applied',
          'discount.removed',
          'discount.disabled',
          'refund.created',
          'refund.approved',
          'refund.rejected',
          'refund.completed',
          'shift.opened',
          'shift.closed',
          'control_score.updated',
          'ai_summary.generated',
          'audit.viewed',
          'audit.exported'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_resource_type_check'
  ) then
    alter table audit_logs
      add constraint audit_logs_resource_type_check
      check (
        resource_type in (
          'order',
          'payment',
          'inventory',
          'employee',
          'permission',
          'pricing',
          'discount',
          'refund',
          'shift',
          'control_score',
          'ai_summary',
          'audit_log'
        )
      );
  end if;
end $$;

create index if not exists audit_logs_tenant_occurred_id_idx
  on audit_logs (tenant_id, occurred_at desc, id desc);

create index if not exists audit_logs_tenant_user_idx
  on audit_logs (tenant_id, user_id);

create index if not exists audit_logs_tenant_actor_type_idx
  on audit_logs (tenant_id, actor_type);

create index if not exists audit_logs_tenant_outcome_idx
  on audit_logs (tenant_id, outcome);

create index if not exists audit_logs_tenant_request_idx
  on audit_logs (tenant_id, request_id);

create index if not exists audit_logs_tenant_session_idx
  on audit_logs (tenant_id, session_id);

create index if not exists audit_logs_previous_value_gin_idx
  on audit_logs using gin (previous_value jsonb_path_ops);

create index if not exists audit_logs_new_value_gin_idx
  on audit_logs using gin (new_value jsonb_path_ops);

create index if not exists audit_logs_occurred_at_brin_idx
  on audit_logs using brin (occurred_at);

create or replace function prevent_audit_logs_update_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

drop trigger if exists audit_logs_no_update_delete on audit_logs;

create trigger audit_logs_no_update_delete
before update or delete on audit_logs
for each row
execute function prevent_audit_logs_update_delete();

alter table audit_logs enable row level security;

drop policy if exists audit_logs_tenant_select on audit_logs;
create policy audit_logs_tenant_select
  on audit_logs
  for select
  using (tenant_id = current_setting('app.current_tenant_id', true));

drop policy if exists audit_logs_tenant_insert on audit_logs;
create policy audit_logs_tenant_insert
  on audit_logs
  for insert
  with check (tenant_id = current_setting('app.current_tenant_id', true));

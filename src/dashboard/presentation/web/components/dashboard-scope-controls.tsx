"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Badge, Button, Input, Label } from "@/components/ui";
import type { DashboardHistoryQuery } from "@/dashboard/presentation/web/api/dashboard-api-client";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

type DashboardScopeControlsProps = {
  scope: DashboardHistoryQuery;
  loading: boolean;
  onChange: (scope: DashboardHistoryQuery) => void;
  onRefresh: () => void;
};

const HISTORY_LIMIT = 12;

export function DashboardScopeControls({
  scope,
  loading,
  onChange,
  onRefresh
}: DashboardScopeControlsProps) {
  const [tenantId, setTenantId] = React.useState(scope.tenantId);
  const [businessUnitId, setBusinessUnitId] = React.useState(scope.businessUnitId ?? "");
  const isDemoMode = !scope.tenantId;

  React.useEffect(() => {
    setTenantId(scope.tenantId);
    setBusinessUnitId(scope.businessUnitId ?? "");
  }, [scope.businessUnitId, scope.tenantId]);

  if (isDemoMode) {
    return <DemoRestaurantScope />;
  }

  return (
    <form
      className="grid w-full gap-2 sm:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_auto_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onChange({
          ...scope,
          tenantId,
          businessUnitId: businessUnitId || undefined,
          limit: scope.limit ?? HISTORY_LIMIT
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="dashboard-tenant-id" className="text-xs">
          Tenant
        </Label>
        <Input
          id="dashboard-tenant-id"
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          placeholder="tenant-id"
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dashboard-business-unit-id" className="text-xs">
          Business unit
        </Label>
        <Input
          id="dashboard-business-unit-id"
          value={businessUnitId}
          onChange={(event) => setBusinessUnitId(event.target.value)}
          placeholder="optional"
          className="h-10"
        />
      </div>
      <Button type="submit" variant="secondary" className="self-end">
        Apply
      </Button>
      <Button
        type="button"
        variant="outline"
        className="self-end"
        onClick={onRefresh}
        disabled={loading || !scope.tenantId}
        aria-label="Refresh dashboard"
      >
        <RefreshCw className={loading ? "animate-spin" : undefined} />
        Refresh
      </Button>
    </form>
  );
}

function DemoRestaurantScope() {
  const { demoScope } = demoDashboardData;

  return (
    <section
      className="flex min-w-0 flex-col gap-3 rounded-lg border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Demo restaurant scope"
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <ReadOnlyScopeValue label={demoScope.restaurantLabel} value={demoScope.restaurant} />
        <ReadOnlyScopeValue label={demoScope.locationLabel} value={demoScope.location} />
      </div>
      <Badge variant="outline" className="w-fit shrink-0">
        Demo data
      </Badge>
    </section>
  );
}

function ReadOnlyScopeValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

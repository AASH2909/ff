"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import type { DashboardHistoryQuery } from "@/dashboard/presentation/web/api/dashboard-api-client";

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

  React.useEffect(() => {
    setTenantId(scope.tenantId);
    setBusinessUnitId(scope.businessUnitId ?? "");
  }, [scope.businessUnitId, scope.tenantId]);

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

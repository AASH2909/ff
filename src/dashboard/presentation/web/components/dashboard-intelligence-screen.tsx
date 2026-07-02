"use client";

import * as React from "react";
import { PageHeading } from "@/components/app/page-heading";
import { PageSection } from "@/components/design-system";
import { AlertsWidget } from "@/dashboard/presentation/web/components/alerts-widget";
import { DashboardScopeControls } from "@/dashboard/presentation/web/components/dashboard-scope-controls";
import {
  DashboardDataEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardScopeEmptyState
} from "@/dashboard/presentation/web/components/dashboard-states";
import { DomainBreakdownWidget } from "@/dashboard/presentation/web/components/domain-breakdown-widget";
import { DriversWidget } from "@/dashboard/presentation/web/components/drivers-widget";
import { InsightsWidget } from "@/dashboard/presentation/web/components/insights-widget";
import { OverviewCard } from "@/dashboard/presentation/web/components/overview-card";
import { ScoreTrendWidget } from "@/dashboard/presentation/web/components/score-trend-widget";
import type { DashboardHistoryQuery } from "@/dashboard/presentation/web/api/dashboard-api-client";
import { useDashboardIntelligence } from "@/dashboard/presentation/web/hooks/use-dashboard-intelligence";
import { ExecutiveRecommendationsWidget } from "@/recommendation/presentation/web/components/executive-recommendations-widget";

const DASHBOARD_SCOPE_STORAGE_KEY = "controlos.dashboard.scope";
const DEFAULT_HISTORY_LIMIT = 12;

const DEFAULT_SCOPE: DashboardHistoryQuery = {
  tenantId: "",
  limit: DEFAULT_HISTORY_LIMIT
};

export function DashboardIntelligenceScreen() {
  const [scope, setScope] = React.useState<DashboardHistoryQuery>(DEFAULT_SCOPE);
  const { state, data, error, refresh } = useDashboardIntelligence(scope);

  React.useEffect(() => {
    setScope(readScopeFromBrowser());
  }, []);

  const updateScope = React.useCallback((nextScope: DashboardHistoryQuery) => {
    const normalizedScope = normalizeScope(nextScope);
    setScope(normalizedScope);
    writeScopeToBrowser(normalizedScope);
  }, []);

  const loading = state === "loading";

  return (
    <>
      <PageHeading
        eyebrow="Executive Control"
        title="Dashboard Intelligence"
        description="Business health, operational risk, score drivers, and Control Score trends."
      />
      <PageSection className="pb-2 sm:px-6 lg:px-8">
        <DashboardScopeControls
          scope={scope}
          loading={loading}
          onChange={updateScope}
          onRefresh={refresh}
        />
      </PageSection>
      {state === "idle" ? <DashboardScopeEmptyState /> : null}
      {state === "loading" ? <DashboardLoadingState /> : null}
      {state === "error" && error ? <DashboardErrorState error={error} onRetry={refresh} /> : null}
      {state === "success" && data ? <DashboardDataView data={data} scope={scope} /> : null}
    </>
  );
}

function DashboardDataView({
  data,
  scope
}: {
  data: NonNullable<ReturnType<typeof useDashboardIntelligence>["data"]>;
  scope: DashboardHistoryQuery;
}) {
  const domains = data.domainBreakdown.domains.length
    ? data.domainBreakdown.domains
    : data.overview.domainScores;
  const history = data.history.history.length ? data.history.history : data.overview.trend;
  const alerts = data.alerts.alerts.length ? data.alerts.alerts : data.overview.activeAlerts;

  if (!data.overview.currentControlScore) {
    return (
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <DashboardDataEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
        <OverviewCard overview={data.overview} latest={data.latest.controlScore} />
        <ScoreTrendWidget points={history} />
      </div>
      <DomainBreakdownWidget domains={domains} />
      <ExecutiveRecommendationsWidget
        scope={{
          tenantId: scope.tenantId,
          businessUnitId: scope.businessUnitId,
          limit: 8
        }}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <DriversWidget
          title="Top Positive Drivers"
          type="positive"
          drivers={data.overview.topPositiveDrivers}
        />
        <DriversWidget
          title="Top Negative Drivers"
          type="negative"
          drivers={data.overview.topNegativeDrivers}
        />
      </div>
      <div className="grid gap-4 2xl:grid-cols-[0.9fr_1.2fr]">
        <AlertsWidget alerts={alerts} />
        <InsightsWidget insights={data.insights} />
      </div>
    </div>
  );
}

function readScopeFromBrowser(): DashboardHistoryQuery {
  if (typeof window === "undefined") {
    return DEFAULT_SCOPE;
  }

  const url = new URL(window.location.href);
  const storedScope = readStoredScope();

  return normalizeScope({
    tenantId: url.searchParams.get("tenantId") ?? storedScope?.tenantId ?? "",
    businessUnitId:
      url.searchParams.get("businessUnitId") ?? storedScope?.businessUnitId ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    limit: readLimit(url.searchParams.get("limit")) ?? storedScope?.limit ?? DEFAULT_HISTORY_LIMIT
  });
}

function readStoredScope(): DashboardHistoryQuery | null {
  try {
    const value = window.localStorage.getItem(DASHBOARD_SCOPE_STORAGE_KEY);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as Partial<DashboardHistoryQuery>;

    return normalizeScope({
      tenantId: typeof parsed.tenantId === "string" ? parsed.tenantId : "",
      businessUnitId:
        typeof parsed.businessUnitId === "string" ? parsed.businessUnitId : undefined,
      from: typeof parsed.from === "string" ? parsed.from : undefined,
      to: typeof parsed.to === "string" ? parsed.to : undefined,
      limit: typeof parsed.limit === "number" ? parsed.limit : DEFAULT_HISTORY_LIMIT
    });
  } catch {
    return null;
  }
}

function writeScopeToBrowser(scope: DashboardHistoryQuery) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DASHBOARD_SCOPE_STORAGE_KEY, JSON.stringify(scope));

  const url = new URL(window.location.href);

  setOptionalParam(url, "tenantId", scope.tenantId);
  setOptionalParam(url, "businessUnitId", scope.businessUnitId);
  setOptionalParam(url, "from", scope.from);
  setOptionalParam(url, "to", scope.to);
  setOptionalParam(url, "limit", scope.limit ? String(scope.limit) : undefined);

  window.history.replaceState({}, "", url);
}

function setOptionalParam(url: URL, key: string, value: string | undefined) {
  if (value) {
    url.searchParams.set(key, value);
    return;
  }

  url.searchParams.delete(key);
}

function normalizeScope(scope: DashboardHistoryQuery): DashboardHistoryQuery {
  return {
    tenantId: scope.tenantId.trim(),
    businessUnitId: scope.businessUnitId?.trim() || undefined,
    from: scope.from,
    to: scope.to,
    limit: scope.limit ?? DEFAULT_HISTORY_LIMIT
  };
}

function readLimit(value: string | null) {
  if (value === null) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

"use client";

import * as React from "react";
import type {
  ControlScoreHistoryOutputDto,
  DashboardAlertsOutputDto,
  DashboardInsightsOutputDto,
  DashboardOverviewDto,
  DomainBreakdownOutputDto,
  LatestControlScoreOutputDto
} from "@/dashboard/application/dtos";
import {
  DashboardApiError,
  getControlScoreHistory,
  getDashboardAlerts,
  getDashboardInsights,
  getDashboardOverview,
  getDomainBreakdown,
  getLatestControlScore,
  type DashboardHistoryQuery
} from "@/dashboard/presentation/web/api/dashboard-api-client";

export type DashboardIntelligenceData = {
  overview: DashboardOverviewDto;
  latest: LatestControlScoreOutputDto;
  history: ControlScoreHistoryOutputDto;
  domainBreakdown: DomainBreakdownOutputDto;
  alerts: DashboardAlertsOutputDto;
  insights: DashboardInsightsOutputDto;
};

export type DashboardLoadState = "idle" | "loading" | "success" | "error";

export type DashboardLoadError = {
  status: number;
  code: string;
  message: string;
};

export function useDashboardIntelligence(query: DashboardHistoryQuery) {
  const [state, setState] = React.useState<DashboardLoadState>("idle");
  const [data, setData] = React.useState<DashboardIntelligenceData | null>(null);
  const [error, setError] = React.useState<DashboardLoadError | null>(null);

  const normalizedQuery = React.useMemo(
    () => ({
      tenantId: query.tenantId.trim(),
      businessUnitId: query.businessUnitId?.trim() || undefined,
      from: query.from,
      to: query.to,
      limit: query.limit
    }),
    [query.businessUnitId, query.from, query.limit, query.tenantId, query.to]
  );

  const load = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!normalizedQuery.tenantId) {
        setData(null);
        setError(null);
        setState("idle");
        return;
      }

      setState("loading");
      setError(null);

      try {
        const [overview, latest, history, domainBreakdown, alerts, insights] = await Promise.all([
          getDashboardOverview(normalizedQuery, { signal }),
          getLatestControlScore(normalizedQuery, { signal }),
          getControlScoreHistory(normalizedQuery, { signal }),
          getDomainBreakdown(normalizedQuery, { signal }),
          getDashboardAlerts(normalizedQuery, { signal }),
          getDashboardInsights(normalizedQuery, { signal })
        ]);

        setData({
          overview,
          latest,
          history,
          domainBreakdown,
          alerts,
          insights
        });
        setState("success");
      } catch (caught) {
        if (signal?.aborted) {
          return;
        }

        setData(null);
        setError(toLoadError(caught));
        setState("error");
      }
    },
    [normalizedQuery]
  );

  React.useEffect(() => {
    const controller = new AbortController();

    void load(controller.signal);

    return () => {
      controller.abort();
    };
  }, [load]);

  return {
    state,
    data,
    error,
    refresh: React.useCallback(() => load(), [load])
  };
}

function toLoadError(error: unknown): DashboardLoadError {
  if (error instanceof DashboardApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      code: "REQUEST_FAILED",
      message: error.message
    };
  }

  return {
    status: 500,
    code: "REQUEST_FAILED",
    message: "Dashboard data could not be loaded."
  };
}

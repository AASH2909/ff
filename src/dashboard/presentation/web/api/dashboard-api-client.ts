import type {
  ControlScoreHistoryOutputDto,
  DashboardAlertsOutputDto,
  DashboardInsightsOutputDto,
  DashboardOverviewDto,
  DomainBreakdownOutputDto,
  LatestControlScoreOutputDto
} from "@/dashboard/application/dtos";
import type {
  ApiErrorResponse,
  ApiSuccessResponse
} from "@/dashboard/presentation/http/api-response";

export type DashboardClientScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type DashboardHistoryQuery = DashboardClientScope & {
  from?: string;
  to?: string;
  limit?: number;
};

export type DashboardRequestOptions = {
  signal?: AbortSignal;
};

export class DashboardApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "DashboardApiError";
  }
}

const DASHBOARD_BASE_PATH = "/api/v1/dashboard";

export async function getDashboardOverview(
  query: DashboardHistoryQuery,
  options?: DashboardRequestOptions
) {
  return fetchDashboard<DashboardOverviewDto>("/overview", query, options);
}

export async function getLatestControlScore(
  scope: DashboardClientScope,
  options?: DashboardRequestOptions
) {
  return fetchDashboard<LatestControlScoreOutputDto>("/control-score/latest", scope, options);
}

export async function getControlScoreHistory(
  query: DashboardHistoryQuery,
  options?: DashboardRequestOptions
) {
  return fetchDashboard<ControlScoreHistoryOutputDto>("/control-score/history", query, options);
}

export async function getDomainBreakdown(
  scope: DashboardClientScope,
  options?: DashboardRequestOptions
) {
  return fetchDashboard<DomainBreakdownOutputDto>("/domain-breakdown", scope, options);
}

export async function getDashboardAlerts(
  scope: DashboardClientScope,
  options?: DashboardRequestOptions
) {
  return fetchDashboard<DashboardAlertsOutputDto>("/alerts", scope, options);
}

export async function getDashboardInsights(
  scope: DashboardClientScope,
  options?: DashboardRequestOptions
) {
  return fetchDashboard<DashboardInsightsOutputDto>("/insights", scope, options);
}

async function fetchDashboard<T>(
  path: string,
  query: DashboardHistoryQuery,
  options?: DashboardRequestOptions
): Promise<T> {
  const response = await fetch(`${DASHBOARD_BASE_PATH}${path}?${toSearchParams(query)}`, {
    credentials: "same-origin",
    headers: {
      "x-tenant-id": query.tenantId,
      ...(query.businessUnitId ? { "x-business-unit-id": query.businessUnitId } : {})
    },
    signal: options?.signal
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const error = readApiError(payload);

    throw new DashboardApiError(response.status, error.code, error.message);
  }

  return readApiData<T>(payload);
}

function toSearchParams(query: DashboardHistoryQuery) {
  const params = new URLSearchParams({
    tenantId: query.tenantId
  });

  if (query.businessUnitId) {
    params.set("businessUnitId", query.businessUnitId);
  }

  if (query.from) {
    params.set("from", query.from);
  }

  if (query.to) {
    params.set("to", query.to);
  }

  if (typeof query.limit === "number") {
    params.set("limit", String(query.limit));
  }

  return params.toString();
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function readApiData<T>(payload: unknown): T {
  if (isRecord(payload) && "data" in payload) {
    return (payload as ApiSuccessResponse<T>).data;
  }

  throw new DashboardApiError(500, "INVALID_RESPONSE", "Dashboard response was not readable.");
}

function readApiError(payload: unknown) {
  if (isRecord(payload) && "error" in payload) {
    const response = payload as ApiErrorResponse;
    return response.error;
  }

  return {
    code: "REQUEST_FAILED",
    message: "Dashboard data could not be loaded."
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

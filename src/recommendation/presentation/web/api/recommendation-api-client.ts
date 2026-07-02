import type {
  RecommendationDto,
  RecommendationQueryDto,
  RecommendationsOutputDto
} from "@/recommendation/application/dtos";
import type {
  RecommendationApiErrorResponse,
  RecommendationApiSuccessResponse
} from "@/recommendation/presentation/http";

export type RecommendationClientScope = {
  tenantId: string;
  businessUnitId?: string;
  limit?: number;
};

export type RecommendationRequestOptions = {
  signal?: AbortSignal;
};

export class RecommendationApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "RecommendationApiError";
  }
}

const RECOMMENDATION_BASE_PATH = "/api/v1/recommendations";

export async function getExecutiveRecommendations(
  query: RecommendationClientScope,
  options?: RecommendationRequestOptions
) {
  return fetchRecommendations<RecommendationsOutputDto>("", query, options);
}

export async function getHighPriorityRecommendations(
  query: RecommendationClientScope,
  options?: RecommendationRequestOptions
) {
  return fetchRecommendations<RecommendationsOutputDto>("/high-priority", query, options);
}

export async function getExecutiveRecommendationById(
  id: string,
  query: RecommendationClientScope,
  options?: RecommendationRequestOptions
) {
  return fetchRecommendations<{ recommendation: RecommendationDto }>(`/${encodeURIComponent(id)}`, query, options);
}

async function fetchRecommendations<T>(
  path: string,
  query: RecommendationQueryDto,
  options?: RecommendationRequestOptions
): Promise<T> {
  const response = await fetch(`${RECOMMENDATION_BASE_PATH}${path}?${toSearchParams(query)}`, {
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

    throw new RecommendationApiError(response.status, error.code, error.message);
  }

  return readApiData<T>(payload);
}

function toSearchParams(query: RecommendationQueryDto) {
  const params = new URLSearchParams({
    tenantId: query.tenantId
  });

  if (query.businessUnitId) {
    params.set("businessUnitId", query.businessUnitId);
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
    return (payload as RecommendationApiSuccessResponse<T>).data;
  }

  throw new RecommendationApiError(500, "INVALID_RESPONSE", "Recommendation response was not readable.");
}

function readApiError(payload: unknown) {
  if (isRecord(payload) && "error" in payload) {
    const response = payload as RecommendationApiErrorResponse;
    return response.error;
  }

  return {
    code: "REQUEST_FAILED",
    message: "Executive recommendations could not be loaded."
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

import type { ApplicationError } from "@/application/result";
import type { AnalyticsContextQueryDto } from "@/analytics-context/application/dtos";

export const DEFAULT_ANALYTICS_CONTEXT_LIMIT = 10;
export const MAX_ANALYTICS_CONTEXT_LIMIT = 50;

export type ValidatedAnalyticsContextQuery = {
  tenantId: string;
  businessUnitId?: string;
  limit: number;
};

export function validateAnalyticsContextQuery(input: AnalyticsContextQueryDto): {
  value?: ValidatedAnalyticsContextQuery;
  error?: ApplicationError;
} {
  if (!input || typeof input.tenantId !== "string" || input.tenantId.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Tenant id is required."
      }
    };
  }

  const limit = input.limit ?? DEFAULT_ANALYTICS_CONTEXT_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ANALYTICS_CONTEXT_LIMIT) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_ANALYTICS_CONTEXT_LIMIT}.`
      }
    };
  }

  const businessUnitId = input.businessUnitId?.trim();

  return {
    value: {
      tenantId: input.tenantId.trim(),
      ...(businessUnitId ? { businessUnitId } : {}),
      limit
    }
  };
}

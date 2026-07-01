import type { ApplicationError } from "@/application/result";
import type { DashboardQueryDto, DashboardScopeDto } from "@/dashboard/application/dtos";

export const DEFAULT_DASHBOARD_HISTORY_LIMIT = 30;
export const MAX_DASHBOARD_HISTORY_LIMIT = 365;
export const DEFAULT_DASHBOARD_ALERT_LIMIT = 10;
export const DEFAULT_DASHBOARD_DRIVER_LIMIT = 5;

export type ValidatedDashboardScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedDashboardDateRange = {
  from?: Date;
  to?: Date;
  limit: number;
};

export type ValidatedDashboardQuery = ValidatedDashboardScope & ValidatedDashboardDateRange;

export function validateDashboardScope(input: DashboardScopeDto): {
  value?: ValidatedDashboardScope;
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

  const businessUnitId = input.businessUnitId?.trim();

  return {
    value: {
      tenantId: input.tenantId.trim(),
      ...(businessUnitId ? { businessUnitId } : {})
    }
  };
}

export function validateDashboardQuery(input: DashboardQueryDto): {
  value?: ValidatedDashboardQuery;
  error?: ApplicationError;
} {
  const scopeResult = validateDashboardScope(input);

  if (scopeResult.error || !scopeResult.value) {
    return {
      error: scopeResult.error
    };
  }

  const rangeResult = validateDashboardDateRange(input);

  if (rangeResult.error || !rangeResult.value) {
    return {
      error: rangeResult.error
    };
  }

  return {
    value: {
      ...scopeResult.value,
      ...rangeResult.value
    }
  };
}

export function validateDashboardDateRange(input: DashboardQueryDto): {
  value?: ValidatedDashboardDateRange;
  error?: ApplicationError;
} {
  const from = parseOptionalDate(input.from, "from");

  if (from.error) {
    return {
      error: from.error
    };
  }

  const to = parseOptionalDate(input.to, "to");

  if (to.error) {
    return {
      error: to.error
    };
  }

  if (from.value && to.value && from.value > to.value) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Date range start cannot be after date range end."
      }
    };
  }

  const limit = input.limit ?? DEFAULT_DASHBOARD_HISTORY_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_DASHBOARD_HISTORY_LIMIT) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_DASHBOARD_HISTORY_LIMIT}.`
      }
    };
  }

  return {
    value: {
      from: from.value,
      to: to.value,
      limit
    }
  };
}

function parseOptionalDate(
  value: string | undefined,
  label: "from" | "to"
): { value?: Date; error?: ApplicationError } {
  if (!value) {
    return {};
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Query parameter "${label}" must be a valid ISO date.`
      }
    };
  }

  return {
    value: parsed
  };
}

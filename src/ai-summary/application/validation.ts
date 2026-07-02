import type { ApplicationError } from "@/application/result";
import type {
  ExecutiveSummaryByIdQueryDto,
  ExecutiveSummaryHistoryQueryDto,
  ExecutiveSummaryLatestQueryDto,
  ExecutiveSummaryScopeDto,
  GenerateExecutiveSummaryDto
} from "@/ai-summary/application/dtos";
import {
  isExecutiveSummaryType,
  type ExecutiveSummaryType
} from "@/ai-summary/domain";

export const DEFAULT_EXECUTIVE_SUMMARY_TYPE: ExecutiveSummaryType = "DAILY";
export const DEFAULT_EXECUTIVE_SUMMARY_HISTORY_LIMIT = 10;
export const MAX_EXECUTIVE_SUMMARY_HISTORY_LIMIT = 100;

export type ValidatedExecutiveSummaryScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedGenerateExecutiveSummaryInput = ValidatedExecutiveSummaryScope & {
  summaryType: ExecutiveSummaryType;
  periodStart?: Date;
  periodEnd?: Date;
};

export type ValidatedExecutiveSummaryByIdQuery = ValidatedExecutiveSummaryScope & {
  id: string;
};

export type ValidatedExecutiveSummaryLatestQuery = ValidatedExecutiveSummaryScope & {
  summaryType?: ExecutiveSummaryType;
};

export type ValidatedExecutiveSummaryHistoryQuery = ValidatedExecutiveSummaryScope & {
  summaryType?: ExecutiveSummaryType;
  from?: Date;
  to?: Date;
  limit: number;
};

export function validateExecutiveSummaryScope(input: ExecutiveSummaryScopeDto): {
  value?: ValidatedExecutiveSummaryScope;
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

export function validateGenerateExecutiveSummaryInput(
  input: GenerateExecutiveSummaryDto
): {
  value?: ValidatedGenerateExecutiveSummaryInput;
  error?: ApplicationError;
} {
  const scope = validateExecutiveSummaryScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const summaryType = parseSummaryType(input.summaryType, DEFAULT_EXECUTIVE_SUMMARY_TYPE);

  if (summaryType.error || !summaryType.value) {
    return { error: summaryType.error };
  }

  const period = validateOptionalPeriod(input.periodStart, input.periodEnd);

  if (period.error) {
    return { error: period.error };
  }

  if (summaryType.value === "CUSTOM" && (!period.periodStart || !period.periodEnd)) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Custom executive summaries require periodStart and periodEnd."
      }
    };
  }

  return {
    value: {
      ...scope.value,
      summaryType: summaryType.value,
      ...(period.periodStart ? { periodStart: period.periodStart } : {}),
      ...(period.periodEnd ? { periodEnd: period.periodEnd } : {})
    }
  };
}

export function validateExecutiveSummaryByIdQuery(
  input: ExecutiveSummaryByIdQueryDto
): {
  value?: ValidatedExecutiveSummaryByIdQuery;
  error?: ApplicationError;
} {
  const scope = validateExecutiveSummaryScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.id || input.id.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Executive summary id is required."
      }
    };
  }

  return {
    value: {
      ...scope.value,
      id: input.id.trim()
    }
  };
}

export function validateExecutiveSummaryLatestQuery(
  input: ExecutiveSummaryLatestQueryDto
): {
  value?: ValidatedExecutiveSummaryLatestQuery;
  error?: ApplicationError;
} {
  const scope = validateExecutiveSummaryScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const summaryType = parseSummaryType(input.summaryType);

  if (summaryType.error) {
    return { error: summaryType.error };
  }

  return {
    value: {
      ...scope.value,
      ...(summaryType.value ? { summaryType: summaryType.value } : {})
    }
  };
}

export function validateExecutiveSummaryHistoryQuery(
  input: ExecutiveSummaryHistoryQueryDto
): {
  value?: ValidatedExecutiveSummaryHistoryQuery;
  error?: ApplicationError;
} {
  const scope = validateExecutiveSummaryScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const summaryType = parseSummaryType(input.summaryType);

  if (summaryType.error) {
    return { error: summaryType.error };
  }

  const period = validateOptionalPeriod(input.from, input.to);

  if (period.error) {
    return { error: period.error };
  }

  const limit = input.limit ?? DEFAULT_EXECUTIVE_SUMMARY_HISTORY_LIMIT;

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_EXECUTIVE_SUMMARY_HISTORY_LIMIT
  ) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_EXECUTIVE_SUMMARY_HISTORY_LIMIT}.`
      }
    };
  }

  return {
    value: {
      ...scope.value,
      ...(summaryType.value ? { summaryType: summaryType.value } : {}),
      ...(period.periodStart ? { from: period.periodStart } : {}),
      ...(period.periodEnd ? { to: period.periodEnd } : {}),
      limit
    }
  };
}

function parseSummaryType(
  value: string | undefined,
  fallback?: ExecutiveSummaryType
): { value?: ExecutiveSummaryType; error?: ApplicationError } {
  if (!value || value.trim().length === 0) {
    return fallback ? { value: fallback } : {};
  }

  const normalized = value.trim().toUpperCase();

  if (isExecutiveSummaryType(normalized)) {
    return { value: normalized };
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Summary type must be DAILY, WEEKLY, MONTHLY, or CUSTOM."
    }
  };
}

function validateOptionalPeriod(
  startValue: string | undefined,
  endValue: string | undefined
): { periodStart?: Date; periodEnd?: Date; error?: ApplicationError } {
  if (!startValue && !endValue) {
    return {};
  }

  if (!startValue || !endValue) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Both periodStart and periodEnd are required when overriding summary period."
      }
    };
  }

  const periodStart = parseDate(startValue, "periodStart");

  if (periodStart.error || !periodStart.value) {
    return { error: periodStart.error };
  }

  const periodEnd = parseDate(endValue, "periodEnd");

  if (periodEnd.error || !periodEnd.value) {
    return { error: periodEnd.error };
  }

  if (periodStart.value > periodEnd.value) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Summary period start cannot be after period end."
      }
    };
  }

  return {
    periodStart: periodStart.value,
    periodEnd: periodEnd.value
  };
}

function parseDate(
  value: string,
  label: string
): { value?: Date; error?: ApplicationError } {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `${label} must be a valid ISO date.`
      }
    };
  }

  return { value: parsed };
}

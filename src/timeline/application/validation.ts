import type { ApplicationError } from "@/application/result";
import type { TimelineByIdQueryDto, TimelineQueryDto, TimelineScopeDto } from "@/timeline/application/dtos";

export const DEFAULT_TIMELINE_LIMIT = 50;
export const MAX_TIMELINE_LIMIT = 100;

export type ValidatedTimelineScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedTimelineQuery = ValidatedTimelineScope & {
  limit: number;
};

export type ValidatedTimelineByIdQuery = ValidatedTimelineScope & {
  id: string;
};

export function validateTimelineScope(input: TimelineScopeDto): {
  value?: ValidatedTimelineScope;
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

export function validateTimelineQuery(input: TimelineQueryDto): {
  value?: ValidatedTimelineQuery;
  error?: ApplicationError;
} {
  const scope = validateTimelineScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const limit = input.limit ?? DEFAULT_TIMELINE_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_TIMELINE_LIMIT) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_TIMELINE_LIMIT}.`
      }
    };
  }

  return {
    value: {
      ...scope.value,
      limit
    }
  };
}

export function validateTimelineByIdQuery(input: TimelineByIdQueryDto): {
  value?: ValidatedTimelineByIdQuery;
  error?: ApplicationError;
} {
  const scope = validateTimelineScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.id || input.id.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Timeline entry id is required."
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

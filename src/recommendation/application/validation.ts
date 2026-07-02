import type { ApplicationError } from "@/application/result";
import type {
  RecommendationByIdQueryDto,
  RecommendationQueryDto,
  RecommendationScopeDto
} from "@/recommendation/application/dtos";

export const DEFAULT_RECOMMENDATION_LIMIT = 10;
export const MAX_RECOMMENDATION_LIMIT = 50;

export type ValidatedRecommendationScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedRecommendationQuery = ValidatedRecommendationScope & {
  limit: number;
};

export type ValidatedRecommendationByIdQuery = ValidatedRecommendationScope & {
  id: string;
};

export function validateRecommendationScope(input: RecommendationScopeDto): {
  value?: ValidatedRecommendationScope;
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

export function validateRecommendationQuery(input: RecommendationQueryDto): {
  value?: ValidatedRecommendationQuery;
  error?: ApplicationError;
} {
  const scope = validateRecommendationScope(input);

  if (scope.error || !scope.value) {
    return {
      error: scope.error
    };
  }

  const limit = input.limit ?? DEFAULT_RECOMMENDATION_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RECOMMENDATION_LIMIT) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_RECOMMENDATION_LIMIT}.`
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

export function validateRecommendationByIdQuery(input: RecommendationByIdQueryDto): {
  value?: ValidatedRecommendationByIdQuery;
  error?: ApplicationError;
} {
  const scope = validateRecommendationScope(input);

  if (scope.error || !scope.value) {
    return {
      error: scope.error
    };
  }

  if (!input.id || input.id.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Recommendation id is required."
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

import type { ApplicationError } from "@/application/result";
import type {
  PredictionByIdQueryDto,
  PredictionQueryDto,
  PredictionScopeDto
} from "@/predictive/application/dtos";
import {
  DEFAULT_PREDICTION_WINDOW,
  isPredictionType,
  isPredictionWindow,
  type PredictionType,
  type PredictionWindow
} from "@/predictive/domain";

export const DEFAULT_PREDICTION_LIMIT = 10;
export const MAX_PREDICTION_LIMIT = 50;

export type ValidatedPredictionScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedPredictionQuery = ValidatedPredictionScope & {
  predictionType?: PredictionType;
  predictionWindow: PredictionWindow;
  limit: number;
};

export type ValidatedPredictionByIdQuery = ValidatedPredictionScope & {
  id: string;
  predictionWindow: PredictionWindow;
};

export function validatePredictionScope(input: PredictionScopeDto): {
  value?: ValidatedPredictionScope;
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

export function validatePredictionQuery(input: PredictionQueryDto): {
  value?: ValidatedPredictionQuery;
  error?: ApplicationError;
} {
  const scope = validatePredictionScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const predictionType = parsePredictionType(input.predictionType);

  if (predictionType.error) {
    return { error: predictionType.error };
  }

  const predictionWindow = parsePredictionWindow(input.predictionWindow);

  if (predictionWindow.error || !predictionWindow.value) {
    return { error: predictionWindow.error };
  }

  const limit = input.limit ?? DEFAULT_PREDICTION_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PREDICTION_LIMIT) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_PREDICTION_LIMIT}.`
      }
    };
  }

  return {
    value: {
      ...scope.value,
      ...(predictionType.value ? { predictionType: predictionType.value } : {}),
      predictionWindow: predictionWindow.value,
      limit
    }
  };
}

export function validatePredictionByIdQuery(input: PredictionByIdQueryDto): {
  value?: ValidatedPredictionByIdQuery;
  error?: ApplicationError;
} {
  const scope = validatePredictionScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.id || input.id.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Prediction id is required."
      }
    };
  }

  const predictionWindow = parsePredictionWindow(input.predictionWindow);

  if (predictionWindow.error || !predictionWindow.value) {
    return { error: predictionWindow.error };
  }

  return {
    value: {
      ...scope.value,
      id: input.id.trim(),
      predictionWindow: predictionWindow.value
    }
  };
}

function parsePredictionType(
  value: string | undefined
): { value?: PredictionType; error?: ApplicationError } {
  if (!value || value.trim().length === 0) {
    return {};
  }

  const normalized = value.trim().toUpperCase();

  if (isPredictionType(normalized)) {
    return { value: normalized };
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Prediction type must be CONTROL_SCORE, FRAUD, OPERATIONS, INVENTORY, or FINANCIAL."
    }
  };
}

function parsePredictionWindow(
  value: string | undefined
): { value?: PredictionWindow; error?: ApplicationError } {
  if (!value || value.trim().length === 0) {
    return { value: DEFAULT_PREDICTION_WINDOW };
  }

  const normalized = value.trim().toUpperCase();

  if (isPredictionWindow(normalized)) {
    return { value: normalized };
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Prediction window must be NEXT_7_DAYS, NEXT_30_DAYS, or NEXT_90_DAYS."
    }
  };
}

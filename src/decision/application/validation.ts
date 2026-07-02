import type { ApplicationError } from "@/application/result";
import type {
  DecisionScenarioByIdQueryDto,
  DecisionScenarioQueryDto,
  DecisionScenarioScopeDto,
  GenerateDecisionScenariosCommandDto
} from "@/decision/application/dtos";
import { normalizeScenarioType } from "@/decision/domain";

export const DEFAULT_DECISION_SCENARIO_LIMIT = 20;
export const MAX_DECISION_SCENARIO_LIMIT = 100;

export type ValidatedDecisionScenarioScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedDecisionScenarioQuery = ValidatedDecisionScenarioScope & {
  scenarioType?: ReturnType<typeof normalizeScenarioType>;
  limit: number;
};

export type ValidatedDecisionScenarioByIdQuery = ValidatedDecisionScenarioScope & {
  id: string;
};

export function validateDecisionScenarioScope(input: DecisionScenarioScopeDto): {
  value?: ValidatedDecisionScenarioScope;
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

export function validateDecisionScenarioQuery(input: DecisionScenarioQueryDto): {
  value?: ValidatedDecisionScenarioQuery;
  error?: ApplicationError;
} {
  const scope = validateDecisionScenarioScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const limit = input.limit ?? DEFAULT_DECISION_SCENARIO_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_DECISION_SCENARIO_LIMIT) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_DECISION_SCENARIO_LIMIT}.`
      }
    };
  }

  try {
    return {
      value: {
        ...scope.value,
        ...(input.scenarioType
          ? { scenarioType: normalizeScenarioType(input.scenarioType) }
          : {}),
        limit
      }
    };
  } catch (error) {
    void error;

    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Decision scenario type is invalid."
      }
    };
  }
}

export function validateGenerateDecisionScenariosCommand(
  input: GenerateDecisionScenariosCommandDto
): {
  value?: ValidatedDecisionScenarioQuery;
  error?: ApplicationError;
} {
  return validateDecisionScenarioQuery(input);
}

export function validateDecisionScenarioByIdQuery(input: DecisionScenarioByIdQueryDto): {
  value?: ValidatedDecisionScenarioByIdQuery;
  error?: ApplicationError;
} {
  const scope = validateDecisionScenarioScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.id || input.id.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Decision scenario id is required."
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

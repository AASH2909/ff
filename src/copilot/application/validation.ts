import type { ApplicationError } from "@/application/result";
import type {
  AskCopilotCommandDto,
  CopilotMessagesQueryDto,
  CopilotScopeDto,
  CopilotSessionByIdQueryDto,
  CopilotSessionQueryDto
} from "@/copilot/application/dtos";
import {
  isCopilotSessionStatus,
  type CopilotSessionStatus
} from "@/copilot/domain/value-objects";

export const DEFAULT_COPILOT_CONTEXT_LIMIT = 10;
export const MAX_COPILOT_CONTEXT_LIMIT = 50;

export type ValidatedCopilotScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedAskCopilotCommand = ValidatedCopilotScope & {
  sessionId?: string;
  question: string;
  limit: number;
  metadata: NonNullable<AskCopilotCommandDto["metadata"]>;
};

export type ValidatedCopilotSessionQuery = ValidatedCopilotScope & {
  status?: CopilotSessionStatus;
  limit: number;
};

export type ValidatedCopilotSessionByIdQuery = ValidatedCopilotScope & {
  id: string;
};

export type ValidatedCopilotMessagesQuery = ValidatedCopilotScope & {
  sessionId: string;
};

export function validateCopilotScope(input: CopilotScopeDto): {
  value?: ValidatedCopilotScope;
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

export function validateAskCopilotCommand(input: AskCopilotCommandDto): {
  value?: ValidatedAskCopilotCommand;
  error?: ApplicationError;
} {
  const scope = validateCopilotScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.question || input.question.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Copilot question is required."
      }
    };
  }

  const limitValidation = validateLimit(input.limit);

  if (limitValidation.error || !limitValidation.value) {
    return { error: limitValidation.error };
  }

  const sessionId = input.sessionId?.trim();

  return {
    value: {
      ...scope.value,
      ...(sessionId ? { sessionId } : {}),
      question: input.question.trim(),
      limit: limitValidation.value,
      metadata: input.metadata ?? {}
    }
  };
}

export function validateCopilotSessionQuery(input: CopilotSessionQueryDto): {
  value?: ValidatedCopilotSessionQuery;
  error?: ApplicationError;
} {
  const scope = validateCopilotScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const limitValidation = validateLimit(input.limit);

  if (limitValidation.error || !limitValidation.value) {
    return { error: limitValidation.error };
  }

  const statusValidation = validateStatus(input.status);

  if (statusValidation.error) {
    return { error: statusValidation.error };
  }

  return {
    value: {
      ...scope.value,
      ...(statusValidation.value ? { status: statusValidation.value } : {}),
      limit: limitValidation.value
    }
  };
}

export function validateCopilotSessionByIdQuery(input: CopilotSessionByIdQueryDto): {
  value?: ValidatedCopilotSessionByIdQuery;
  error?: ApplicationError;
} {
  const scope = validateCopilotScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.id || input.id.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Copilot session id is required."
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

export function validateCopilotMessagesQuery(input: CopilotMessagesQueryDto): {
  value?: ValidatedCopilotMessagesQuery;
  error?: ApplicationError;
} {
  const scope = validateCopilotScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.sessionId || input.sessionId.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Copilot session id is required."
      }
    };
  }

  return {
    value: {
      ...scope.value,
      sessionId: input.sessionId.trim()
    }
  };
}

function validateLimit(value: number | undefined): {
  value?: number;
  error?: ApplicationError;
} {
  const limit = value ?? DEFAULT_COPILOT_CONTEXT_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_COPILOT_CONTEXT_LIMIT) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${MAX_COPILOT_CONTEXT_LIMIT}.`
      }
    };
  }

  return { value: limit };
}

function validateStatus(value: string | undefined): {
  value?: CopilotSessionStatus;
  error?: ApplicationError;
} {
  if (!value || value.trim().length === 0) {
    return {};
  }

  const normalized = value.trim().toUpperCase();

  if (isCopilotSessionStatus(normalized)) {
    return { value: normalized };
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Copilot session status must be ACTIVE or CLOSED."
    }
  };
}

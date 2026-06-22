export type Result<TValue, TError = ApplicationError> =
  | {
      ok: true;
      value: TValue;
    }
  | {
      ok: false;
      error: TError;
    };

export type ApplicationErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE_VIOLATION"
  | "PERSISTENCE_ERROR";

export type ApplicationError = {
  code: ApplicationErrorCode;
  message: string;
};

export function ok<TValue>(value: TValue): Result<TValue> {
  return {
    ok: true,
    value
  };
}

export function fail(code: ApplicationErrorCode, message: string): Result<never> {
  return {
    ok: false,
    error: {
      code,
      message
    }
  };
}

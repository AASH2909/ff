import type { ApplicationError } from "@/application/result";

const SUPPORTED_CURRENCIES = ["USD", "UZS"] as const;
const SUPPORTED_PAYMENT_METHODS = ["cash", "card", "online"] as const;

export type RequiredStringField = {
  value: unknown;
  label: string;
};

export function validateRequiredStrings(fields: RequiredStringField[]): ApplicationError | null {
  const missingField = fields.find((field) => {
    return typeof field.value !== "string" || field.value.trim().length === 0;
  });

  if (!missingField) {
    return null;
  }

  return {
    code: "VALIDATION_ERROR",
    message: `${missingField.label} is required.`
  };
}

export function validateMoneyDto(value: unknown, label: string): ApplicationError | null {
  if (!value || typeof value !== "object") {
    return {
      code: "VALIDATION_ERROR",
      message: `${label} is required.`
    };
  }

  const money = value as { amount?: unknown; currency?: unknown };

  if (!Number.isInteger(money.amount)) {
    return {
      code: "VALIDATION_ERROR",
      message: `${label} amount must be an integer minor-unit value.`
    };
  }

  if (typeof money.amount === "number" && money.amount < 0) {
    return {
      code: "VALIDATION_ERROR",
      message: `${label} amount cannot be negative.`
    };
  }

  if (typeof money.currency !== "string" || money.currency.trim().length === 0) {
    return {
      code: "VALIDATION_ERROR",
      message: `${label} currency is required.`
    };
  }

  const currencyError = validateCurrencyCode(money.currency, `${label} currency`);

  if (currencyError) {
    return currencyError;
  }

  return null;
}

export function validateCurrencyCode(value: unknown, label = "Currency"): ApplicationError | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!SUPPORTED_CURRENCIES.includes(value as (typeof SUPPORTED_CURRENCIES)[number])) {
    return {
      code: "VALIDATION_ERROR",
      message: `${label} is not supported.`
    };
  }

  return null;
}

export function validatePaymentMethod(value: unknown): ApplicationError | null {
  if (!SUPPORTED_PAYMENT_METHODS.includes(value as (typeof SUPPORTED_PAYMENT_METHODS)[number])) {
    return {
      code: "VALIDATION_ERROR",
      message: "Payment method is not supported."
    };
  }

  return null;
}

export function validatePositiveInteger(
  value: unknown,
  label: string,
  options: { required?: boolean } = {}
): ApplicationError | null {
  if (value === undefined || value === null) {
    if (options.required) {
      return {
        code: "VALIDATION_ERROR",
        message: `${label} is required.`
      };
    }

    return null;
  }

  if (!Number.isInteger(value) || (value as number) <= 0) {
    return {
      code: "VALIDATION_ERROR",
      message: `${label} must be a positive integer.`
    };
  }

  return null;
}

export function validateTenantMatch(
  aggregateTenantId: string,
  requestTenantId: string,
  aggregateName: string
): ApplicationError | null {
  if (aggregateTenantId === requestTenantId) {
    return null;
  }

  return {
    code: "PERSISTENCE_ERROR",
    message: `${aggregateName} tenant boundary was violated.`
  };
}

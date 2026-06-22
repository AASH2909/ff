const DEFAULT_REDACTED_KEYS = [
  "password",
  "passcode",
  "token",
  "secret",
  "authorization",
  "apiKey",
  "api_key",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "cardNumber",
  "pan",
  "cvv",
  "cvc",
  "pin"
];

export type AuditSanitizerOptions = {
  redactedKeys?: string[];
  maxDepth?: number;
  replacement?: string;
};

export type AuditSanitizer = (value: unknown) => unknown;

export function createAuditSanitizer(options: AuditSanitizerOptions = {}): AuditSanitizer {
  const redactedKeys = (options.redactedKeys ?? DEFAULT_REDACTED_KEYS).map((key) =>
    key.toLowerCase()
  );
  const maxDepth = options.maxDepth ?? 8;
  const replacement = options.replacement ?? "[REDACTED]";

  return (value: unknown) => sanitizeValue(value, redactedKeys, maxDepth, replacement, 0);
}

function sanitizeValue(
  value: unknown,
  redactedKeys: string[],
  maxDepth: number,
  replacement: string,
  depth: number
): unknown {
  if (depth > maxDepth) {
    return "[MAX_DEPTH]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, redactedKeys, maxDepth, replacement, depth + 1));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const record = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(record)) {
    if (shouldRedact(key, redactedKeys)) {
      sanitized[key] = replacement;
      continue;
    }

    sanitized[key] = sanitizeValue(nestedValue, redactedKeys, maxDepth, replacement, depth + 1);
  }

  return sanitized;
}

function shouldRedact(key: string, redactedKeys: string[]): boolean {
  const normalizedKey = key.toLowerCase();

  return redactedKeys.some((redactedKey) => normalizedKey.includes(redactedKey));
}

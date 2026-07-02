import { DomainError } from "@/domain/errors";

export const COPILOT_SESSION_STATUSES = ["ACTIVE", "CLOSED"] as const;

export type CopilotSessionStatus = (typeof COPILOT_SESSION_STATUSES)[number];

export function isCopilotSessionStatus(value: unknown): value is CopilotSessionStatus {
  return (
    typeof value === "string" &&
    COPILOT_SESSION_STATUSES.includes(value as CopilotSessionStatus)
  );
}

export function normalizeCopilotSessionStatus(
  value: string | null | undefined
): CopilotSessionStatus {
  const normalized = value?.trim().toUpperCase();

  if (isCopilotSessionStatus(normalized)) {
    return normalized;
  }

  throw new DomainError("Copilot session status is invalid.");
}

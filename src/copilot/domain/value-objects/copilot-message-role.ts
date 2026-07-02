import { DomainError } from "@/domain/errors";

export const COPILOT_MESSAGE_ROLES = ["USER", "ASSISTANT", "SYSTEM"] as const;

export type CopilotMessageRole = (typeof COPILOT_MESSAGE_ROLES)[number];

export function isCopilotMessageRole(value: unknown): value is CopilotMessageRole {
  return typeof value === "string" && COPILOT_MESSAGE_ROLES.includes(value as CopilotMessageRole);
}

export function normalizeCopilotMessageRole(
  value: string | null | undefined
): CopilotMessageRole {
  const normalized = value?.trim().toUpperCase();

  if (isCopilotMessageRole(normalized)) {
    return normalized;
  }

  throw new DomainError("Copilot message role is invalid.");
}

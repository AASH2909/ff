import { DomainError } from "@/domain/errors";

export const COPILOT_INTENTS = [
  "BUSINESS_STATUS",
  "WHY_DID_THIS_HAPPEN",
  "WHAT_WILL_HAPPEN_NEXT",
  "WHAT_SHOULD_WE_DO",
  "RISK_EXPLANATION",
  "TIMELINE_EXPLANATION",
  "UNKNOWN"
] as const;

export type CopilotIntent = (typeof COPILOT_INTENTS)[number];

export function isCopilotIntent(value: unknown): value is CopilotIntent {
  return typeof value === "string" && COPILOT_INTENTS.includes(value as CopilotIntent);
}

export function normalizeCopilotIntent(value: string | null | undefined): CopilotIntent {
  const normalized = value?.trim().toUpperCase();

  if (isCopilotIntent(normalized)) {
    return normalized;
  }

  throw new DomainError("Copilot intent is invalid.");
}

import { DomainError } from "@/domain/errors";

export const ACTION_EFFORTS = ["LOW", "MEDIUM", "HIGH"] as const;

export type ActionEffort = (typeof ACTION_EFFORTS)[number];

export function isActionEffort(value: unknown): value is ActionEffort {
  return typeof value === "string" && ACTION_EFFORTS.includes(value as ActionEffort);
}

export function normalizeActionEffort(value: string | null | undefined): ActionEffort {
  const normalized = value?.trim().toUpperCase();

  if (isActionEffort(normalized)) {
    return normalized;
  }

  throw new DomainError("Decision action effort is invalid.");
}

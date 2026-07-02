import { DomainError } from "@/domain/errors";

export const INCIDENT_SEVERITIES = ["information", "warning", "critical", "severe"] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export function normalizeIncidentSeverity(value: string | null | undefined): IncidentSeverity {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "info" || normalized === "low") {
    return "information";
  }

  if (normalized === "medium") {
    return "warning";
  }

  if (normalized === "high") {
    return "critical";
  }

  if (isIncidentSeverity(normalized)) {
    return normalized;
  }

  throw new DomainError("Incident severity is invalid.");
}

export function isIncidentSeverity(value: unknown): value is IncidentSeverity {
  return typeof value === "string" && INCIDENT_SEVERITIES.includes(value as IncidentSeverity);
}

import type {
  DashboardAlertDto,
  DashboardInsightDto,
  ScoreTrendPointDto
} from "@/dashboard/application/dtos";
import type { BadgeProps } from "@/components/ui";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric"
});

export function formatScore(value: number) {
  return Math.round(value).toString();
}

export function formatScoreChange(value: number | null) {
  if (value === null) {
    return "No prior score";
  }

  const rounded = Math.round(value * 10) / 10;

  if (rounded > 0) {
    return `+${rounded}`;
  }

  return String(rounded);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100) / 100}%`;
}

export function formatContribution(value: number) {
  const rounded = Math.round(value * 10) / 10;

  if (rounded > 0) {
    return `+${rounded}`;
  }

  return String(rounded);
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return dateTimeFormatter.format(date);
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return dateFormatter.format(date);
}

export function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

export function severityVariant(severity: DashboardAlertDto["severity"]): BadgeProps["variant"] {
  if (severity === "warning") {
    return "warning";
  }

  if (severity === "critical" || severity === "severe") {
    return "destructive";
  }

  return "secondary";
}

export function insightVariant(type: DashboardInsightDto["type"]): BadgeProps["variant"] {
  if (type === "positive") {
    return "success";
  }

  if (type === "negative") {
    return "warning";
  }

  if (type === "risk") {
    return "destructive";
  }

  return "secondary";
}

export function trendLabel(point: ScoreTrendPointDto | undefined) {
  if (!point) {
    return "Trend unavailable";
  }

  return titleCase(point.direction);
}

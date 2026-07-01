import {
  ControlScoreSnapshot,
  DashboardAlert,
  DomainScoreSnapshot,
  ScoreExplanation
} from "@/dashboard/domain";
import type { Database, Json } from "@/types/database";

export type ControlScoreRow = Database["public"]["Tables"]["control_scores"]["Row"];
export type DomainScoreRow = Database["public"]["Tables"]["control_score_domain_scores"]["Row"];
export type ScoreExplanationRow = Database["public"]["Tables"]["control_score_explanations"]["Row"];
export type DashboardAlertRow = Database["public"]["Tables"]["dashboard_alerts"]["Row"];
export type FraudAlertRow = Database["public"]["Tables"]["fraud_alerts"]["Row"];

export function mapControlScoreRow(row: ControlScoreRow) {
  return new ControlScoreSnapshot({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    businessUnitName: row.business_unit_name,
    score: Number(row.score),
    status: row.status,
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    calculatedAt: new Date(row.calculated_at)
  });
}

export function mapDomainScoreRow(row: DomainScoreRow) {
  return new DomainScoreSnapshot({
    id: row.id,
    tenantId: row.tenant_id,
    controlScoreId: row.control_score_id,
    domainCode: row.domain_code,
    domainName: row.domain_name,
    score: Number(row.score),
    weight: Number(row.weight),
    contribution: Number(row.contribution),
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    calculatedAt: new Date(row.calculated_at),
    metadata: jsonObjectToRecord(row.metadata)
  });
}

export function mapScoreExplanationRow(row: ScoreExplanationRow) {
  const contribution = Number(row.contribution);

  return new ScoreExplanation({
    id: row.id,
    tenantId: row.tenant_id,
    controlScoreId: row.control_score_id,
    domainCode: row.domain_code,
    metricCode: row.metric_code,
    metricName: row.metric_name,
    driverType: ScoreExplanation.driverTypeFromContribution(contribution, row.driver_type),
    contribution,
    severity: ScoreExplanation.severityFrom(row.severity),
    explanation: row.explanation,
    createdAt: new Date(row.created_at)
  });
}

export function mapDashboardAlertRow(row: DashboardAlertRow) {
  return new DashboardAlert({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    severity: ScoreExplanation.severityFrom(row.severity),
    status: normalizeAlertStatus(row.status),
    title: row.title,
    message: row.message,
    source: normalizeAlertSource(row.source),
    domainCode: row.domain_code,
    metricCode: row.metric_code,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    occurredAt: new Date(row.occurred_at)
  });
}

export function mapFraudAlertRow(row: FraudAlertRow) {
  const actionRequired = row.action_required?.trim();

  return new DashboardAlert({
    id: `fraud-alert:${row.id}`,
    tenantId: row.tenant_id,
    businessUnitId: null,
    severity: ScoreExplanation.severityFrom(row.severity),
    status: normalizeAlertStatus(row.status),
    title: `Fraud ${row.alert_type.replaceAll("_", " ")} alert`,
    message: actionRequired || `Fraud incident ${row.incident_id} requires review.`,
    source: "fraud",
    domainCode: "fraud_risk",
    metricCode: null,
    resourceType: "fraud_alert",
    resourceId: row.alert_id,
    occurredAt: new Date(row.generated_at)
  });
}

export function jsonObjectToRecord(value: Json): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeAlertStatus(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "acknowledged" || normalized === "resolved") {
    return normalized;
  }

  return "active";
}

function normalizeAlertSource(value: string) {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "control_score" ||
    normalized === "fraud" ||
    normalized === "audit" ||
    normalized === "operations"
  ) {
    return normalized;
  }

  return "dashboard";
}

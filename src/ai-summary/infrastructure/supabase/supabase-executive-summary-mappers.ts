import { ExecutiveSummary, type ExecutiveSummaryMetadata } from "@/ai-summary/domain";
import type { Database, Json } from "@/types/database";

export type ExecutiveSummaryRow =
  Database["public"]["Tables"]["ai_executive_summaries"]["Row"];
export type ExecutiveSummaryInsert =
  Database["public"]["Tables"]["ai_executive_summaries"]["Insert"];

export function mapExecutiveSummaryRow(row: ExecutiveSummaryRow) {
  return new ExecutiveSummary({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    summaryType: row.summary_type,
    status: row.status,
    headline: row.headline,
    overallAssessment: row.overall_assessment,
    keyPositiveSignals: jsonToStringArray(row.key_positive_signals),
    keyNegativeSignals: jsonToStringArray(row.key_negative_signals),
    criticalRisks: jsonToStringArray(row.critical_risks),
    recommendedActions: jsonToStringArray(row.recommended_actions),
    confidence: Number(row.confidence),
    sourceModules: jsonToStringArray(row.source_modules),
    generatedAt: new Date(row.generated_at),
    metadata: jsonToMetadata(row.metadata)
  });
}

export function mapExecutiveSummaryInsert(summary: ExecutiveSummary): ExecutiveSummaryInsert {
  return {
    id: summary.id,
    tenant_id: summary.tenantId,
    business_unit_id: summary.businessUnitId,
    period_start: summary.periodStart.toISOString(),
    period_end: summary.periodEnd.toISOString(),
    summary_type: summary.summaryType,
    status: summary.status,
    headline: summary.headline,
    overall_assessment: summary.overallAssessment,
    key_positive_signals: summary.keyPositiveSignals,
    key_negative_signals: summary.keyNegativeSignals,
    critical_risks: summary.criticalRisks,
    recommended_actions: summary.recommendedActions,
    confidence: summary.confidence,
    source_modules: summary.sourceModules,
    generated_at: summary.generatedAt.toISOString(),
    metadata: summary.metadata
  };
}

function jsonToStringArray(value: Json): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function jsonToMetadata(value: Json): ExecutiveSummaryMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<ExecutiveSummaryMetadata>((metadata, [key, item]) => {
    if (item !== undefined && isMetadataValue(item)) {
      metadata[key] = item;
    }

    return metadata;
  }, {});
}

function isMetadataValue(value: Json): value is ExecutiveSummaryMetadata[string] {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" || typeof item === "number")
  );
}

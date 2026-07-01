import type { SupabaseClient } from "@supabase/supabase-js";
import type { FraudRepository } from "@/fraud/ports/fraud-repository";
import { FraudIncident } from "@/fraud/entities/fraud-incident";
import { FraudRiskScore, SuspiciousPattern } from "@/fraud/value-objects/index";
import type { FraudSeverity, FraudStatus } from "@/fraud/types";

const FRAUD_SEVERITIES = ["low", "medium", "high", "critical"] as const satisfies readonly FraudSeverity[];

export type FraudIncidentRow = {
  id: string;
  tenant_id: string;
  status: FraudStatus;
  severity: string;
  risk_score: number;
  patterns: Array<{
    type: string;
    severity: string;
    confidence: { confidence: number; level: string };
    evidence: string;
    weight: number;
  }>;
  order_id: string | null;
  employee_id: string | null;
  location_id: string | null;
  shift_id: string | null;
  investigation_notes: string | null;
  dismissal_reason: string | null;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseFraudRepository implements FraudRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(incident: FraudIncident): Promise<void> {
    const { error } = await this.supabase.from("fraud_incidents").insert({
      id: crypto.randomUUID(),
      tenant_id: incident.tenantId,
      incident_id: incident.id,
      status: incident.status,
      severity: incident.severity,
      risk_score: incident.riskScore.value,
      patterns: incident.patterns.map((p) => p.toJSON()),
      order_id: incident.orderId,
      employee_id: incident.employeeId,
      location_id: incident.locationId,
      shift_id: incident.shiftId,
      investigation_notes: incident.investigationNotes,
      dismissal_reason: incident.dismissalReason,
      detected_at: incident.detectedAt.toISOString(),
      resolved_at: incident.resolvedAt?.toISOString() ?? null
    });

    if (error) {
      throw new Error(`Failed to save fraud incident: ${error.message}`);
    }
  }

  async findById(id: string, tenantId: string): Promise<FraudIncident | null> {
    const { data, error } = await this.supabase
      .from("fraud_incidents")
      .select("*")
      .eq("incident_id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to find fraud incident: ${error.message}`);
    }

    return this.rowToIncident(data as FraudIncidentRow);
  }

  async findByTenant(
    tenantId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<FraudIncident[]> {
    let query = this.supabase
      .from("fraud_incidents")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("detected_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find fraud incidents: ${error.message}`);
    }

    return (data as FraudIncidentRow[]).map((row) => this.rowToIncident(row));
  }

  async findByOrder(orderId: string, tenantId: string): Promise<FraudIncident[]> {
    const { data, error } = await this.supabase
      .from("fraud_incidents")
      .select("*")
      .eq("order_id", orderId)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Failed to find fraud incidents by order: ${error.message}`);
    }

    return (data as FraudIncidentRow[]).map((row) => this.rowToIncident(row));
  }

  async findByEmployee(employeeId: string, tenantId: string): Promise<FraudIncident[]> {
    const { data, error } = await this.supabase
      .from("fraud_incidents")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("tenant_id", tenantId)
      .order("detected_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to find fraud incidents by employee: ${error.message}`);
    }

    return (data as FraudIncidentRow[]).map((row) => this.rowToIncident(row));
  }

  async findByLocation(locationId: string, tenantId: string): Promise<FraudIncident[]> {
    const { data, error } = await this.supabase
      .from("fraud_incidents")
      .select("*")
      .eq("location_id", locationId)
      .eq("tenant_id", tenantId)
      .order("detected_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to find fraud incidents by location: ${error.message}`);
    }

    return (data as FraudIncidentRow[]).map((row) => this.rowToIncident(row));
  }

  async findByShift(shiftId: string, tenantId: string): Promise<FraudIncident[]> {
    const { data, error } = await this.supabase
      .from("fraud_incidents")
      .select("*")
      .eq("shift_id", shiftId)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Failed to find fraud incidents by shift: ${error.message}`);
    }

    return (data as FraudIncidentRow[]).map((row) => this.rowToIncident(row));
  }

  async update(incident: FraudIncident): Promise<void> {
    const { error } = await this.supabase
      .from("fraud_incidents")
      .update({
        status: incident.status,
        severity: incident.severity,
        risk_score: incident.riskScore.value,
        patterns: incident.patterns.map((p) => p.toJSON()),
        investigation_notes: incident.investigationNotes,
        dismissal_reason: incident.dismissalReason,
        resolved_at: incident.resolvedAt?.toISOString() ?? null
      })
      .eq("incident_id", incident.id)
      .eq("tenant_id", incident.tenantId);

    if (error) {
      throw new Error(`Failed to update fraud incident: ${error.message}`);
    }
  }

  async count(
    tenantId: string,
    filters?: {
      status?: string;
      severity?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<number> {
    let query = this.supabase
      .from("fraud_incidents")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.severity) {
      query = query.eq("severity", filters.severity);
    }

    if (filters?.fromDate) {
      query = query.gte("detected_at", filters.fromDate.toISOString());
    }

    if (filters?.toDate) {
      query = query.lte("detected_at", filters.toDate.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count fraud incidents: ${error.message}`);
    }

    return count ?? 0;
  }

  async getStatistics(
    tenantId: string,
    timeWindowDays = 30
  ): Promise<{
    totalIncidents: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    averageRiskScore: number;
    criticalCount: number;
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - timeWindowDays);

    const { data, error } = await this.supabase
      .from("fraud_incidents")
      .select("status, severity, risk_score")
      .eq("tenant_id", tenantId)
      .gte("detected_at", fromDate.toISOString());

    if (error) {
      throw new Error(`Failed to get fraud statistics: ${error.message}`);
    }

    const rows = data as Array<{ status: string; severity: string; risk_score: number }>;

    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let totalRiskScore = 0;
    let criticalCount = 0;

    for (const row of rows) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      bySeverity[row.severity] = (bySeverity[row.severity] ?? 0) + 1;
      totalRiskScore += row.risk_score;
      if (row.severity === "critical") {
        criticalCount++;
      }
    }

    return {
      totalIncidents: rows.length,
      byStatus,
      bySeverity,
      averageRiskScore: rows.length > 0 ? Math.round(totalRiskScore / rows.length) : 0,
      criticalCount
    };
  }

  private rowToIncident(row: FraudIncidentRow): FraudIncident {
    const patterns = row.patterns.map((p) =>
      SuspiciousPattern.fromAnomalous(
        p.type,
        this.toFraudSeverity(p.severity),
        p.confidence.confidence,
        p.evidence,
        p.weight
      )
    );

    return new FraudIncident({
      id: row.id,
      tenantId: row.tenant_id,
      status: row.status,
      detectedAt: new Date(row.detected_at),
      riskScore: new FraudRiskScore(row.risk_score),
      patterns,
      orderId: row.order_id,
      employeeId: row.employee_id,
      locationId: row.location_id,
      shiftId: row.shift_id,
      investigationNotes: row.investigation_notes,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : null,
      dismissalReason: row.dismissal_reason
    });
  }

  private toFraudSeverity(value: string): FraudSeverity {
    if (FRAUD_SEVERITIES.includes(value as FraudSeverity)) {
      return value as FraudSeverity;
    }

    throw new Error(`Unsupported fraud severity: ${value}`);
  }
}

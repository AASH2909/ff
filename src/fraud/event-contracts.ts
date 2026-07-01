import type { FraudSeverity, FraudStatus, AnomalyType } from "@/fraud/types";

export type FraudDetectedEventPayload = {
  incidentId: string;
  tenantId: string;
  detectedAt: string;
  riskScore: number;
  severity: FraudSeverity;
  status: FraudStatus;
  patterns: Array<{
    type: AnomalyType;
    severity: FraudSeverity;
    confidence: number;
    evidence: string;
    weight: number;
  }>;
  orderId?: string | null;
  employeeId?: string | null;
  locationId?: string | null;
  shiftId?: string | null;
};

export type FraudStatusChangedEventPayload = {
  incidentId: string;
  tenantId: string;
  previousStatus: FraudStatus;
  newStatus: FraudStatus;
  changedAt: string;
  reason?: string;
  investigationNotes?: string | null;
  dismissalReason?: string | null;
};

export type FraudRiskScoreUpdatedEventPayload = {
  incidentId: string;
  tenantId: string;
  previousScore: number;
  newScore: number;
  previousSeverity: FraudSeverity;
  newSeverity: FraudSeverity;
  updatedAt: string;
  reason: string;
};

export type FraudAlertGeneratedEventPayload = {
  alertId: string;
  incidentId: string;
  tenantId: string;
  severity: FraudSeverity;
  generatedAt: string;
  recipientType: "system_admin" | "location_manager" | "compliance_officer" | "all";
  actionRequired: string;
};

export type RefundAnomalyDetectedEventPayload = {
  tenantId: string;
  employeeId?: string;
  locationId?: string;
  refundCount: number;
  totalRefundAmount: number;
  timeWindowDays: number;
  detectedAt: string;
  riskScore: number;
};

export type CancellationAnomalyDetectedEventPayload = {
  tenantId: string;
  employeeId?: string;
  locationId?: string;
  cancellationCount: number;
  cancellationRate: number;
  timeWindowDays: number;
  detectedAt: string;
  riskScore: number;
};

export type DiscountAnomalyDetectedEventPayload = {
  tenantId: string;
  employeeId?: string;
  locationId?: string;
  discountCount: number;
  averageDiscountPercentage: number;
  timeWindowDays: number;
  detectedAt: string;
  riskScore: number;
};

export type InventoryAnomalyDetectedEventPayload = {
  tenantId: string;
  locationId?: string;
  discrepancyCount: number;
  totalUnaccountedQuantity: number;
  discrepancyValue: number;
  timeWindowDays: number;
  detectedAt: string;
  riskScore: number;
};

export type EmployeeAnomalyDetectedEventPayload = {
  tenantId: string;
  employeeId: string;
  anomalyType: string;
  deviationFromBaseline: number;
  percentageDeviation: number;
  detectedAt: string;
  riskScore: number;
};

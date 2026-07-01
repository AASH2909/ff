export type FraudSeverity = "low" | "medium" | "high" | "critical";
export type FraudStatus = "detected" | "investigating" | "confirmed" | "resolved" | "dismissed";
export type RuleType = "refund" | "cancellation" | "discount" | "inventory" | "employee" | "behavioral";
export type AnomalyType =
  | "excessive_refunds"
  | "refund_abuse"
  | "suspicious_cancellations"
  | "abnormal_discount_pattern"
  | "inventory_discrepancy"
  | "employee_anomaly"
  | "velocity_abuse";

export type FraudContext = {
  tenantId: string;
  locationId?: string;
  employeeId?: string;
  orderId?: string;
  shiftId?: string;
  timestamp: Date;
};

export type FraudIndicator = {
  type: AnomalyType;
  severity: FraudSeverity;
  confidence: number; // 0-1
  evidence: string;
  weight: number; // Used for scoring
};

export type RuleEngineResult = {
  triggered: boolean;
  indicators: FraudIndicator[];
  riskScore: number;
  severity: FraudSeverity;
  recommendations: string[];
};

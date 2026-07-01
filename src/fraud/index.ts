/**
 * Fraud Module Exports
 * Main entry point for fraud detection functionality
 */

// Value Objects
export { FraudRiskScore, ConfidenceScore, SuspiciousPattern } from "./value-objects/index";

// Entities
export { FraudIncident } from "./entities/fraud-incident";
export type { FraudIncidentProps } from "./entities/fraud-incident";

// Rules Engine
export {
  ExcessiveRefundsRule,
  SuspiciousCancellationsRule,
  AbnormalDiscountRule,
  InventoryManipulationRule,
  EmployeeAnomalyRule,
  VelocityAbuseRule,
  FraudRiskScoreCalculator,
  type RefundAnalysis,
  type CancellationAnalysis,
  type DiscountAnalysis,
  type InventoryAnalysis,
  type EmployeeAnalysis,
  type VelocityAnalysis,
  type FraudRuleContext
} from "./rules-engine";

// Ports
export type { FraudRepository } from "./ports/fraud-repository";

// Event Contracts
export type {
  FraudDetectedEventPayload,
  FraudStatusChangedEventPayload,
  FraudRiskScoreUpdatedEventPayload,
  FraudAlertGeneratedEventPayload,
  RefundAnomalyDetectedEventPayload,
  CancellationAnomalyDetectedEventPayload,
  DiscountAnomalyDetectedEventPayload,
  InventoryAnomalyDetectedEventPayload,
  EmployeeAnomalyDetectedEventPayload
} from "./event-contracts";

// Types
export type {
  FraudSeverity,
  FraudStatus,
  RuleType,
  AnomalyType,
  FraudContext,
  FraudIndicator,
  RuleEngineResult
} from "./types";

// Use Cases
export { DetectFraudUseCase } from "@/application/use-cases/detect-fraud-use-case";
export type { DetectFraudInputDto, DetectFraudOutputDto } from "@/application/use-cases/detect-fraud-use-case";

// Repositories
export { SupabaseFraudRepository } from "@/repositories/supabase/supabase-fraud-repository";

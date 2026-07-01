import type { Result } from "@/application/result";
import { ok } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { FraudDetectedPayload as ApplicationFraudDetectedPayload } from "@/events/contracts";
import type { FraudRepository } from "@/fraud/ports/fraud-repository";
import { FraudIncident } from "@/fraud/entities/fraud-incident";
import { SuspiciousPattern, FraudRiskScore } from "@/fraud/value-objects/index";
import {
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
  type VelocityAnalysis
} from "@/fraud/rules-engine";
import type { FraudDetectedEventPayload } from "@/fraud/event-contracts";
import type { AnomalyType } from "@/fraud/types";

const FRAUD_ANOMALY_TYPES = [
  "excessive_refunds",
  "refund_abuse",
  "suspicious_cancellations",
  "abnormal_discount_pattern",
  "inventory_discrepancy",
  "employee_anomaly",
  "velocity_abuse"
] as const satisfies readonly AnomalyType[];

type FraudDetectedPublishPayload = FraudDetectedEventPayload & ApplicationFraudDetectedPayload;

export type DetectFraudInputDto = {
  tenantId: string;
  context: {
    orderId?: string;
    employeeId?: string;
    locationId?: string;
    shiftId?: string;
  };
  analyses: {
    refunds?: RefundAnalysis;
    cancellations?: CancellationAnalysis;
    discounts?: DiscountAnalysis;
    inventory?: InventoryAnalysis;
    employee?: EmployeeAnalysis;
    velocity?: VelocityAnalysis;
  };
  correlationId?: string;
  causationId?: string;
};

export type DetectFraudOutputDto = {
  incidentId?: string;
  fraudDetected: boolean;
  riskScore: number;
  severity: "low" | "medium" | "high" | "critical";
  patterns: Array<{
    type: string;
    severity: string;
    confidence: number;
    evidence: string;
  }>;
  recommendations: string[];
};

/**
 * Detect Fraud Use Case
 * Analyzes various suspicious patterns and creates fraud incidents
 */
export class DetectFraudUseCase implements UseCase<DetectFraudInputDto, DetectFraudOutputDto> {
  private readonly refundsRule = new ExcessiveRefundsRule();
  private readonly cancellationsRule = new SuspiciousCancellationsRule();
  private readonly discountRule = new AbnormalDiscountRule();
  private readonly inventoryRule = new InventoryManipulationRule();
  private readonly employeeRule = new EmployeeAnomalyRule();
  private readonly velocityRule = new VelocityAbuseRule();
  private readonly scoreCalculator = new FraudRiskScoreCalculator();

  constructor(
    private readonly fraudRepository: FraudRepository,
    private readonly idGenerator: IdGenerator,
    private readonly eventPublisher: ApplicationEventPublisher
  ) {}

  async execute(input: DetectFraudInputDto): Promise<Result<DetectFraudOutputDto>> {
    const patterns: SuspiciousPattern[] = [];

    // Evaluate all rules
    if (input.analyses.refunds) {
      const pattern = this.refundsRule.evaluate(input.analyses.refunds);
      if (pattern) patterns.push(pattern);
    }

    if (input.analyses.cancellations) {
      const pattern = this.cancellationsRule.evaluate(input.analyses.cancellations);
      if (pattern) patterns.push(pattern);
    }

    if (input.analyses.discounts) {
      const pattern = this.discountRule.evaluate(input.analyses.discounts);
      if (pattern) patterns.push(pattern);
    }

    if (input.analyses.inventory) {
      const pattern = this.inventoryRule.evaluate(input.analyses.inventory);
      if (pattern) patterns.push(pattern);
    }

    if (input.analyses.employee) {
      const pattern = this.employeeRule.evaluate(input.analyses.employee);
      if (pattern) patterns.push(pattern);
    }

    if (input.analyses.velocity) {
      const pattern = this.velocityRule.evaluate(input.analyses.velocity);
      if (pattern) patterns.push(pattern);
    }

    // If no patterns detected, return clean
    if (patterns.length === 0) {
      return ok({
        fraudDetected: false,
        riskScore: 0,
        severity: "low",
        patterns: [],
        recommendations: []
      });
    }

    // Calculate risk score
    const riskScore = this.scoreCalculator.calculateFromPatterns(patterns);

    // Create fraud incident
    const incidentId = this.idGenerator.nextId();
    const incident = FraudIncident.create(incidentId, input.tenantId, patterns, {
      orderId: input.context.orderId,
      employeeId: input.context.employeeId,
      locationId: input.context.locationId,
      shiftId: input.context.shiftId
    });

    incident.updateRiskScore(riskScore);

    // Save to repository
    await this.fraudRepository.save(incident);

    // Publish fraud detected event
    const eventPatterns = patterns.map((pattern) => this.toEventPattern(pattern));
    const detectedAt = incident.detectedAt.toISOString();
    const payload: FraudDetectedPublishPayload = {
      incidentId: incident.id,
      tenantId: incident.tenantId,
      detectedAt,
      riskScore: riskScore.value,
      severity: riskScore.severity,
      status: incident.status,
      description: eventPatterns.map((pattern) => pattern.evidence).join(" | "),
      patterns: eventPatterns,
      orderId: incident.orderId ?? undefined,
      employeeId: incident.employeeId ?? undefined,
      locationId: incident.locationId,
      shiftId: incident.shiftId
    };

    await this.eventPublisher.publish({
      eventName: "FraudDetected",
      aggregateId: incidentId,
      tenantId: input.tenantId,
      occurredAt: detectedAt,
      payload,
      correlationId: input.correlationId,
      causationId: input.causationId
    });

    return ok({
      incidentId,
      fraudDetected: true,
      riskScore: riskScore.value,
      severity: riskScore.severity,
      patterns: eventPatterns.map(({ type, severity, confidence, evidence }) => ({
        type,
        severity,
        confidence,
        evidence
      })),
      recommendations: this.getRecommendations(patterns, riskScore)
    });
  }

  private toEventPattern(pattern: SuspiciousPattern): FraudDetectedEventPayload["patterns"][number] {
    return {
      type: this.toAnomalyType(pattern.type),
      severity: pattern.severity,
      confidence: pattern.confidence.value,
      evidence: pattern.evidence,
      weight: pattern.weight
    };
  }

  private toAnomalyType(value: string): AnomalyType {
    if (FRAUD_ANOMALY_TYPES.includes(value as AnomalyType)) {
      return value as AnomalyType;
    }

    throw new Error(`Unsupported fraud anomaly type: ${value}`);
  }

  private getRecommendations(
    patterns: SuspiciousPattern[],
    riskScore: FraudRiskScore
  ): string[] {
    const recommendations: Set<string> = new Set();

    if (riskScore.isCritical) {
      recommendations.add("⚠️ CRITICAL: Immediately escalate to compliance team");
      recommendations.add("🔒 Consider freezing employee/location pending investigation");
      recommendations.add("📋 Initiate formal fraud investigation protocol");
    } else if (riskScore.isHighRisk) {
      recommendations.add("🚨 Schedule urgent investigation");
      recommendations.add("👁️ Enable enhanced monitoring");
      recommendations.add("📞 Notify location manager");
    }

    for (const pattern of patterns) {
      switch (pattern.type) {
        case "excessive_refunds":
          recommendations.add("💰 Review refund justifications and exception policies");
          recommendations.add("📊 Audit recent refund transactions");
          break;
        case "suspicious_cancellations":
          recommendations.add("❌ Analyze cancellation patterns by employee");
          recommendations.add("🔍 Review customer complaints related to cancellations");
          break;
        case "abnormal_discount_pattern":
          recommendations.add("💸 Review discount authorization policies");
          recommendations.add("🎯 Require manager approval for discounts > threshold");
          break;
        case "inventory_discrepancy":
          recommendations.add("📦 Perform immediate physical inventory count");
          recommendations.add("🔐 Review access logs for affected products");
          break;
        case "employee_anomaly":
          recommendations.add("👤 Profile employee behavior against historical baseline");
          recommendations.add("🔄 Cross-reference with other metrics");
          break;
        case "velocity_abuse":
          recommendations.add("⚡ Flag account for rapid transaction pattern");
          recommendations.add("🛡️ Implement transaction rate limiting");
          break;
      }
    }

    return Array.from(recommendations);
  }
}

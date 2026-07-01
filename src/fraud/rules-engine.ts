import { FraudRiskScore, SuspiciousPattern } from "@/fraud/value-objects/index";

/**
 * Fraud Rules Engine
 * Evaluates suspicious patterns and calculates fraud risk scores
 */

export interface FraudRuleContext {
  tenantId: string;
  employeeId?: string;
  orderId?: string;
  locationId?: string;
}

export type RefundAnalysis = {
  refundCount: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
  timeWindowDays: number;
};

export type CancellationAnalysis = {
  cancellationCount: number;
  totalCancelledAmount: number;
  averageCancelledAmount: number;
  timeWindowDays: number;
  cancellationRate: number;
};

export type DiscountAnalysis = {
  discountCount: number;
  totalDiscountAmount: number;
  averageDiscountPercentage: number;
  timeWindowDays: number;
};

export type InventoryAnalysis = {
  discrepancyCount: number;
  totalUnaccountedQuantity: number;
  discrepancyValue: number;
  timeWindowDays: number;
};

export type EmployeeAnalysis = {
  anomalyType: string;
  deviationFromBaseline: number;
  percentageDeviation: number;
};

export type VelocityAnalysis = {
  transactionCount: number;
  timeWindowMinutes: number;
  avgTimePerTransaction: number;
};

/**
 * Rule: Excessive Refunds
 * Detects abnormal refund patterns
 */
export class ExcessiveRefundsRule {
  // Thresholds
  private readonly REFUND_COUNT_THRESHOLD = 5; // 5+ refunds in 24 hours
  private readonly REFUND_AMOUNT_THRESHOLD = 500; // Total > 500 units
  private readonly CONFIDENCE_BASE = 70;

  evaluate(analysis: RefundAnalysis): SuspiciousPattern | null {
    if (
      analysis.refundCount < this.REFUND_COUNT_THRESHOLD ||
      analysis.totalRefundAmount < this.REFUND_AMOUNT_THRESHOLD
    ) {
      return null;
    }

    const confidence = Math.min(
      100,
      this.CONFIDENCE_BASE +
        (analysis.refundCount - this.REFUND_COUNT_THRESHOLD) * 5 +
        Math.min(30, (analysis.totalRefundAmount - this.REFUND_AMOUNT_THRESHOLD) / 100)
    );

    const weight = Math.min(
      100,
      40 + (analysis.refundCount - this.REFUND_COUNT_THRESHOLD) * 8
    );

    const severity =
      confidence > 90
        ? "critical"
        : confidence > 80
          ? "high"
          : confidence > 65
            ? "medium"
            : "low";

    return SuspiciousPattern.fromAnomalous(
      "excessive_refunds",
      severity,
      confidence,
      `${analysis.refundCount} refunds totaling ${analysis.totalRefundAmount} in ${analysis.timeWindowDays} days. Average: ${analysis.averageRefundAmount}`,
      weight
    );
  }
}

/**
 * Rule: Suspicious Cancellations
 */
export class SuspiciousCancellationsRule {
  private readonly CANCELLATION_COUNT_THRESHOLD = 10;
  private readonly CANCELLATION_RATE_THRESHOLD = 0.4; // 40% cancellation rate
  private readonly CONFIDENCE_BASE = 65;

  evaluate(analysis: CancellationAnalysis): SuspiciousPattern | null {
    if (
      analysis.cancellationCount < this.CANCELLATION_COUNT_THRESHOLD &&
      analysis.cancellationRate < this.CANCELLATION_RATE_THRESHOLD
    ) {
      return null;
    }

    const rateDeviation = Math.max(0, analysis.cancellationRate - 0.15); // Normal rate ~15%
    const confidence = Math.min(
      100,
      this.CONFIDENCE_BASE +
        (analysis.cancellationCount - this.CANCELLATION_COUNT_THRESHOLD) * 3 +
        rateDeviation * 100
    );

    const weight = Math.min(
      100,
      35 + (analysis.cancellationCount - this.CANCELLATION_COUNT_THRESHOLD) * 5
    );

    const severity =
      confidence > 85
        ? "critical"
        : confidence > 75
          ? "high"
          : confidence > 60
            ? "medium"
            : "low";

    return SuspiciousPattern.fromAnomalous(
      "suspicious_cancellations",
      severity,
      confidence,
      `${analysis.cancellationCount} cancellations (${(analysis.cancellationRate * 100).toFixed(1)}% rate) totaling ${analysis.totalCancelledAmount}`,
      weight
    );
  }
}

/**
 * Rule: Abnormal Discount Pattern
 */
export class AbnormalDiscountRule {
  private readonly DISCOUNT_COUNT_THRESHOLD = 8;
  private readonly AVG_DISCOUNT_PERCENTAGE_THRESHOLD = 15; // 15% average discount
  private readonly CONFIDENCE_BASE = 60;

  evaluate(analysis: DiscountAnalysis): SuspiciousPattern | null {
    if (
      analysis.discountCount < this.DISCOUNT_COUNT_THRESHOLD ||
      analysis.averageDiscountPercentage < this.AVG_DISCOUNT_PERCENTAGE_THRESHOLD
    ) {
      return null;
    }

    const discountExcess = analysis.averageDiscountPercentage - this.AVG_DISCOUNT_PERCENTAGE_THRESHOLD;
    const confidence = Math.min(
      100,
      this.CONFIDENCE_BASE +
        (analysis.discountCount - this.DISCOUNT_COUNT_THRESHOLD) * 4 +
        discountExcess * 3
    );

    const weight = Math.min(
      100,
      30 + (analysis.discountCount - this.DISCOUNT_COUNT_THRESHOLD) * 6
    );

    const severity =
      confidence > 80
        ? "high"
        : confidence > 70
          ? "medium"
          : confidence > 50
            ? "low"
            : "low";

    return SuspiciousPattern.fromAnomalous(
      "abnormal_discount_pattern",
      severity,
      confidence,
      `${analysis.discountCount} discounts with average ${analysis.averageDiscountPercentage.toFixed(1)}% off, totaling ${analysis.totalDiscountAmount} in discounts`,
      weight
    );
  }
}

/**
 * Rule: Inventory Manipulation
 */
export class InventoryManipulationRule {
  private readonly DISCREPANCY_COUNT_THRESHOLD = 5;
  private readonly DISCREPANCY_VALUE_THRESHOLD = 1000;
  private readonly CONFIDENCE_BASE = 75;

  evaluate(analysis: InventoryAnalysis): SuspiciousPattern | null {
    if (
      analysis.discrepancyCount < this.DISCREPANCY_COUNT_THRESHOLD ||
      analysis.discrepancyValue < this.DISCREPANCY_VALUE_THRESHOLD
    ) {
      return null;
    }

    const valueDeviation = analysis.discrepancyValue - this.DISCREPANCY_VALUE_THRESHOLD;
    const confidence = Math.min(
      100,
      this.CONFIDENCE_BASE +
        (analysis.discrepancyCount - this.DISCREPANCY_COUNT_THRESHOLD) * 5 +
        Math.min(15, valueDeviation / 200)
    );

    const weight = Math.min(
      100,
      50 + (analysis.discrepancyCount - this.DISCREPANCY_COUNT_THRESHOLD) * 8
    );

    const severity =
      confidence > 90
        ? "critical"
        : confidence > 80
          ? "high"
          : confidence > 65
            ? "medium"
            : "low";

    return SuspiciousPattern.fromAnomalous(
      "inventory_discrepancy",
      severity,
      confidence,
      `${analysis.discrepancyCount} discrepancies: ${analysis.totalUnaccountedQuantity} units missing, worth ${analysis.discrepancyValue}`,
      weight
    );
  }
}

/**
 * Rule: Employee Anomaly
 */
export class EmployeeAnomalyRule {
  private readonly DEVIATION_THRESHOLD = 2; // 2 standard deviations
  private readonly CONFIDENCE_BASE = 70;

  evaluate(analysis: EmployeeAnalysis): SuspiciousPattern | null {
    if (analysis.deviationFromBaseline < this.DEVIATION_THRESHOLD) {
      return null;
    }

    const confidence = Math.min(
      100,
      this.CONFIDENCE_BASE +
        (analysis.deviationFromBaseline - this.DEVIATION_THRESHOLD) * 5 +
        Math.min(20, analysis.percentageDeviation / 10)
    );

    const weight = Math.min(
      100,
      45 + (analysis.deviationFromBaseline - this.DEVIATION_THRESHOLD) * 10
    );

    const severity =
      confidence > 85
        ? "high"
        : confidence > 70
          ? "medium"
          : confidence > 50
            ? "low"
            : "low";

    return SuspiciousPattern.fromAnomalous(
      "employee_anomaly",
      severity,
      confidence,
      `Employee behavior deviates by ${analysis.deviationFromBaseline.toFixed(2)} std deviations (${analysis.percentageDeviation.toFixed(1)}% deviation): ${analysis.anomalyType}`,
      weight
    );
  }
}

/**
 * Rule: Velocity Abuse
 * Detects rapid-fire transactions suggesting automated fraud
 */
export class VelocityAbuseRule {
  private readonly MIN_TRANSACTION_COUNT = 20;
  private readonly MAX_AVG_TIME_SECONDS = 15; // Average time per transaction
  private readonly CONFIDENCE_BASE = 65;

  evaluate(analysis: VelocityAnalysis): SuspiciousPattern | null {
    if (
      analysis.transactionCount < this.MIN_TRANSACTION_COUNT ||
      analysis.avgTimePerTransaction > this.MAX_AVG_TIME_SECONDS
    ) {
      return null;
    }

    const timeDeviation = this.MAX_AVG_TIME_SECONDS - analysis.avgTimePerTransaction;
    const confidence = Math.min(
      100,
      this.CONFIDENCE_BASE +
        (analysis.transactionCount - this.MIN_TRANSACTION_COUNT) * 2 +
        timeDeviation * 3
    );

    const weight = Math.min(100, 40 + (analysis.transactionCount - this.MIN_TRANSACTION_COUNT));

    const severity =
      confidence > 85
        ? "critical"
        : confidence > 75
          ? "high"
          : confidence > 60
            ? "medium"
            : "low";

    return SuspiciousPattern.fromAnomalous(
      "velocity_abuse",
      severity,
      confidence,
      `${analysis.transactionCount} transactions in ${analysis.timeWindowMinutes} minutes (${analysis.avgTimePerTransaction.toFixed(1)}s avg per transaction)`,
      weight
    );
  }
}

/**
 * Risk Score Calculator
 * Combines multiple patterns into a unified risk score
 */
export class FraudRiskScoreCalculator {
  calculateFromPatterns(patterns: SuspiciousPattern[]): FraudRiskScore {
    if (patterns.length === 0) {
      return new FraudRiskScore(0);
    }

    const contributions = patterns.map((p) => p.calculateContribution());
    const totalContribution = contributions.reduce((a, b) => a + b, 0);

    // Scale contributions to 0-1000
    const baseScore = Math.min(1000, totalContribution * 100);

    // Apply multiplier for multiple concurrent patterns
    const multiplier = 1 + patterns.length * 0.1;
    const finalScore = Math.round(Math.min(1000, baseScore * multiplier));

    return new FraudRiskScore(finalScore);
  }

  adjustScore(
    currentScore: FraudRiskScore,
    adjustment: number,
    reason?: string
  ): FraudRiskScore {
    if (adjustment > 0) {
      return currentScore.add(adjustment);
    }
    // For negative adjustments, create new score
    const newScore = Math.max(0, currentScore.value + adjustment);
    return new FraudRiskScore(newScore);
  }
}

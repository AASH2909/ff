import { DomainError } from "@/domain/errors";

/**
 * Fraud Risk Score - Immutable value object
 * Range: 0-1000, where:
 * 0-200: Low Risk
 * 201-400: Medium Risk
 * 401-700: High Risk
 * 701-1000: Critical Risk
 */
export class FraudRiskScore {
  private readonly score: number;

  constructor(score: number) {
    if (!Number.isInteger(score) || score < 0 || score > 1000) {
      throw new DomainError("Fraud risk score must be an integer between 0 and 1000.");
    }
    this.score = score;
  }

  get value(): number {
    return this.score;
  }

  get severity(): "low" | "medium" | "high" | "critical" {
    if (this.score <= 200) return "low";
    if (this.score <= 400) return "medium";
    if (this.score <= 700) return "high";
    return "critical";
  }

  get isHighRisk(): boolean {
    return this.score > 400;
  }

  get isCritical(): boolean {
    return this.score > 700;
  }

  add(amount: number): FraudRiskScore {
    return new FraudRiskScore(Math.min(1000, this.score + Math.round(amount)));
  }

  multiply(factor: number): FraudRiskScore {
    return new FraudRiskScore(Math.round(Math.min(1000, this.score * factor)));
  }

  toJSON() {
    return {
      score: this.score,
      severity: this.severity
    };
  }
}

/**
 * Confidence Score - Probability that fraud is occurring (0-100)
 */
export class ConfidenceScore {
  private readonly confidence: number;

  constructor(confidence: number) {
    if (confidence < 0 || confidence > 100) {
      throw new DomainError("Confidence score must be between 0 and 100.");
    }
    this.confidence = Math.round(confidence);
  }

  get value(): number {
    return this.confidence;
  }

  get isHigh(): boolean {
    return this.confidence > 75;
  }

  get isMedium(): boolean {
    return this.confidence > 50 && this.confidence <= 75;
  }

  get isLow(): boolean {
    return this.confidence <= 50;
  }

  toJSON() {
    return {
      confidence: this.confidence,
      level: this.isHigh ? "high" : this.isMedium ? "medium" : "low"
    };
  }
}

/**
 * Suspicious Pattern - Represents a detected anomaly
 */
export class SuspiciousPattern {
  constructor(
    private readonly _type: string,
    private readonly _severity: "low" | "medium" | "high" | "critical",
    private readonly _confidence: ConfidenceScore,
    private readonly _evidence: string,
    private readonly _weight: number
  ) {
    if (_weight < 0 || _weight > 100) {
      throw new DomainError("Pattern weight must be between 0 and 100.");
    }
  }

  static fromAnomalous(
    type: string,
    severity: "low" | "medium" | "high" | "critical",
    confidence: number,
    evidence: string,
    weight: number
  ): SuspiciousPattern {
    return new SuspiciousPattern(
      type,
      severity,
      new ConfidenceScore(confidence),
      evidence,
      weight
    );
  }

  get type(): string {
    return this._type;
  }

  get severity(): "low" | "medium" | "high" | "critical" {
    return this._severity;
  }

  get confidence(): ConfidenceScore {
    return this._confidence;
  }

  get evidence(): string {
    return this._evidence;
  }

  get weight(): number {
    return this._weight;
  }

  calculateContribution(): number {
    const severityWeight = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      critical: 2
    };
    return (this._weight * severityWeight[this._severity] * this._confidence.value) / 100;
  }

  toJSON() {
    return {
      type: this._type,
      severity: this._severity,
      confidence: this._confidence.toJSON(),
      evidence: this._evidence,
      weight: this._weight
    };
  }
}

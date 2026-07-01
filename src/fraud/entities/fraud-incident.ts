import { DomainError } from "@/domain/errors";
import { FraudRiskScore, SuspiciousPattern } from "@/fraud/value-objects/index";
import type { FraudStatus, FraudSeverity } from "@/fraud/types";

export type FraudIncidentProps = {
  id: string;
  tenantId: string;
  detectedAt: Date;
  status?: FraudStatus;
  patterns?: SuspiciousPattern[];
  riskScore?: FraudRiskScore;
  orderId?: string | null;
  employeeId?: string | null;
  locationId?: string | null;
  shiftId?: string | null;
  investigationNotes?: string | null;
  resolvedAt?: Date | null;
  dismissalReason?: string | null;
};

/**
 * Fraud Incident Entity
 * Represents a detected or suspected fraudulent activity in the system
 */
export class FraudIncident {
  private readonly props: {
    id: string;
    tenantId: string;
    detectedAt: Date;
    status: FraudStatus;
    patterns: SuspiciousPattern[];
    riskScore: FraudRiskScore;
    orderId: string | null;
    employeeId: string | null;
    locationId: string | null;
    shiftId: string | null;
    investigationNotes: string | null;
    resolvedAt: Date | null;
    dismissalReason: string | null;
  };

  constructor(props: FraudIncidentProps) {
    if (!props.id.trim()) {
      throw new DomainError("Fraud incident ID is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Tenant ID is required.");
    }

    if (props.patterns && props.patterns.length === 0) {
      throw new DomainError("At least one suspicious pattern is required.");
    }

    this.props = {
      id: props.id,
      tenantId: props.tenantId,
      detectedAt: props.detectedAt,
      status: props.status ?? "detected",
      patterns: props.patterns ?? [],
      riskScore: props.riskScore ?? new FraudRiskScore(0),
      orderId: props.orderId ?? null,
      employeeId: props.employeeId ?? null,
      locationId: props.locationId ?? null,
      shiftId: props.shiftId ?? null,
      investigationNotes: props.investigationNotes ?? null,
      resolvedAt: props.resolvedAt ?? null,
      dismissalReason: props.dismissalReason ?? null
    };
  }

  static create(
    id: string,
    tenantId: string,
    patterns: SuspiciousPattern[],
    context?: {
      orderId?: string;
      employeeId?: string;
      locationId?: string;
      shiftId?: string;
    }
  ): FraudIncident {
    return new FraudIncident({
      id,
      tenantId,
      detectedAt: new Date(),
      patterns,
      ...context
    });
  }

  get id(): string {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get detectedAt(): Date {
    return this.props.detectedAt;
  }

  get status(): FraudStatus {
    return this.props.status;
  }

  get patterns(): SuspiciousPattern[] {
    return [...this.props.patterns];
  }

  get riskScore(): FraudRiskScore {
    return this.props.riskScore;
  }

  get severity(): FraudSeverity {
    return this.props.riskScore.severity;
  }

  get orderId(): string | null {
    return this.props.orderId;
  }

  get employeeId(): string | null {
    return this.props.employeeId;
  }

  get locationId(): string | null {
    return this.props.locationId;
  }

  get shiftId(): string | null {
    return this.props.shiftId;
  }

  get investigationNotes(): string | null {
    return this.props.investigationNotes;
  }

  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }

  get dismissalReason(): string | null {
    return this.props.dismissalReason;
  }

  get isResolved(): boolean {
    return this.props.status === "resolved" || this.props.status === "dismissed";
  }

  addPattern(pattern: SuspiciousPattern): void {
    this.props.patterns.push(pattern);
  }

  updateRiskScore(newScore: FraudRiskScore): void {
    this.props.riskScore = newScore;
  }

  confirm(): void {
    if (this.props.status === "resolved" || this.props.status === "dismissed") {
      throw new DomainError("Cannot confirm a resolved or dismissed fraud incident.");
    }
    this.props.status = "confirmed";
  }

  investigate(notes: string): void {
    if (this.props.status === "resolved" || this.props.status === "dismissed") {
      throw new DomainError("Cannot investigate a resolved or dismissed fraud incident.");
    }
    this.props.status = "investigating";
    this.props.investigationNotes = notes;
  }

  resolve(notes?: string): void {
    if (this.props.status === "dismissed") {
      throw new DomainError("Cannot resolve a dismissed fraud incident.");
    }
    this.props.status = "resolved";
    this.props.resolvedAt = new Date();
    if (notes) {
      this.props.investigationNotes = notes;
    }
  }

  dismiss(reason: string): void {
    if (this.props.status === "resolved") {
      throw new DomainError("Cannot dismiss a resolved fraud incident.");
    }
    this.props.status = "dismissed";
    this.props.dismissalReason = reason;
    this.props.resolvedAt = new Date();
  }

  toSnapshot() {
    return {
      id: this.props.id,
      tenantId: this.props.tenantId,
      detectedAt: this.props.detectedAt,
      status: this.props.status,
      patterns: this.props.patterns.map((p) => p.toJSON()),
      riskScore: this.props.riskScore.toJSON(),
      orderId: this.props.orderId,
      employeeId: this.props.employeeId,
      locationId: this.props.locationId,
      shiftId: this.props.shiftId,
      investigationNotes: this.props.investigationNotes,
      resolvedAt: this.props.resolvedAt,
      dismissalReason: this.props.dismissalReason
    };
  }
}

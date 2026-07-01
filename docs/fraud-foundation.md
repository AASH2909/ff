# Fraud Foundation Architecture - CONTROL OS

## Overview

The Fraud Foundation is a comprehensive, production-ready fraud detection system designed for retail POS environments. It detects suspicious patterns across refunds, cancellations, discounts, inventory, and employee behavior with intelligent risk scoring and automated alerting.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│                                                               │
│  DetectFraudUseCase ◄─────► FraudRepository                  │
│       ▲                              ▲                        │
│       │                              │                        │
│       └──────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│              Domain Layer                                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Fraud Rules Engine                                  │    │
│  │                                                     │    │
│  │  • ExcessiveRefundsRule                             │    │
│  │  • SuspiciousCancellationsRule                      │    │
│  │  • AbnormalDiscountRule                            │    │
│  │  • InventoryManipulationRule                       │    │
│  │  • EmployeeAnomalyRule                             │    │
│  │  • VelocityAbuseRule                               │    │
│  │  • FraudRiskScoreCalculator                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ▲                                    │
│                          │                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Domain Entities & Value Objects                     │    │
│  │                                                     │    │
│  │  • FraudIncident (Entity)                           │    │
│  │  • FraudRiskScore (Value Object)                    │    │
│  │  • ConfidenceScore (Value Object)                   │    │
│  │  • SuspiciousPattern (Value Object)                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│           Infrastructure Layer                               │
│                                                               │
│  SupabaseFraudRepository ◄──► Database                       │
│                                                               │
│  Tables:                                                      │
│  • fraud_incidents                                            │
│  • fraud_rules                                                │
│  • fraud_monitoring_events                                    │
│  • fraud_alerts                                               │
│  • fraud_statistics                                           │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Value Objects

#### FraudRiskScore
- **Range:** 0-1000
- **Severity Levels:**
  - 0-200: Low Risk
  - 201-400: Medium Risk
  - 401-700: High Risk
  - 701-1000: Critical Risk
- **Methods:**
  - `add(amount)` - Increases score
  - `multiply(factor)` - Multiplies score
  - `severity` - Returns severity level

#### ConfidenceScore
- **Range:** 0-100 (probability percentage)
- **Levels:**
  - 0-50: Low confidence
  - 51-75: Medium confidence
  - 76-100: High confidence

#### SuspiciousPattern
- Represents a detected anomaly
- Contains type, severity, confidence, evidence, weight
- Calculates contribution to total risk score

### 2. Fraud Incident Entity

Represents a detected or suspected fraudulent activity.

**Properties:**
- `id` - Unique incident identifier
- `tenantId` - Tenant owning the incident
- `status` - "detected" | "investigating" | "confirmed" | "resolved" | "dismissed"
- `patterns` - Array of SuspiciousPattern objects
- `riskScore` - FraudRiskScore value object
- `severity` - Derived from risk score
- `orderId` - Related order (optional)
- `employeeId` - Related employee (optional)
- `locationId` - Related location (optional)
- `shiftId` - Related shift (optional)
- `investigationNotes` - Notes from investigation
- `dismissalReason` - Reason for dismissal

**Lifecycle:**
```
Detected → Investigating → Confirmed → Resolved
              ↓                ↓
            Dismissed ←─────────
```

### 3. Fraud Rules Engine

#### Rule Types

**1. Excessive Refunds Rule**
- **Trigger:** 5+ refunds in 24 hours OR total > 500 units
- **Confidence Base:** 70%
- **Severity:** Escalates with count and amount
- **Evidence:** Count, total amount, average amount

**2. Suspicious Cancellations Rule**
- **Trigger:** 10+ cancellations OR 40%+ cancellation rate
- **Confidence Base:** 65%
- **Severity:** High for excessive counts or rates
- **Evidence:** Count, rate percentage, total amount

**3. Abnormal Discount Rule**
- **Trigger:** 8+ discounts with 15%+ average
- **Confidence Base:** 60%
- **Severity:** Medium to High
- **Evidence:** Count, average percentage, total amount

**4. Inventory Manipulation Rule**
- **Trigger:** 5+ discrepancies OR total value > 1000
- **Confidence Base:** 75%
- **Severity:** High to Critical
- **Evidence:** Count, unaccounted quantity, value

**5. Employee Anomaly Rule**
- **Trigger:** 2+ standard deviations from baseline
- **Confidence Base:** 70%
- **Severity:** Medium to High
- **Evidence:** Deviation magnitude, percentage

**6. Velocity Abuse Rule**
- **Trigger:** 20+ transactions in short timeframe (<15s avg)
- **Confidence Base:** 65%
- **Severity:** Medium to Critical
- **Evidence:** Transaction count, time window, avg time

### 4. Risk Scoring Logic

**Calculation Process:**

```
For each pattern:
  contribution = (weight × severity_factor × confidence) / 100

Total base score = sum(contributions) × 100

Final score = min(1000, base_score × pattern_multiplier)

Severity Level:
  - 0-200 → "low"
  - 201-400 → "medium"
  - 401-700 → "high"
  - 701-1000 → "critical"
```

**Severity Factors:**
- Low: 0.5
- Medium: 1.0
- High: 1.5
- Critical: 2.0

**Pattern Multiplier:** 1 + (pattern_count × 0.1)

## Database Schema

### fraud_incidents
```sql
- id: UUID (PK)
- tenant_id: TEXT
- incident_id: TEXT (UNIQUE) -- Business ID
- status: TEXT (detected|investigating|confirmed|resolved|dismissed)
- severity: TEXT (low|medium|high|critical)
- risk_score: INTEGER (0-1000)
- patterns: JSONB (Array of detected patterns)
- order_id: TEXT (nullable)
- employee_id: TEXT (nullable)
- location_id: TEXT (nullable)
- shift_id: TEXT (nullable)
- investigation_notes: TEXT (nullable)
- dismissal_reason: TEXT (nullable)
- detected_at: TIMESTAMPTZ
- resolved_at: TIMESTAMPTZ (nullable)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ (auto-updated)

Indexes:
- tenant_id
- status
- severity
- employee_id
- order_id
- location_id
- shift_id
- detected_at (DESC)
- risk_score (DESC)
```

### fraud_rules
```sql
Configuration for fraud detection rules per tenant

- id: UUID (PK)
- tenant_id: TEXT
- rule_type: TEXT
- rule_name: TEXT
- enabled: BOOLEAN
- thresholds: JSONB (rule-specific parameters)
- severity_base: TEXT
- weight: INTEGER (0-100)
- description: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

Unique constraint: (tenant_id, rule_type)
```

### fraud_monitoring_events
```sql
Event log for fraud detection activities

- id: UUID (PK)
- tenant_id: TEXT
- event_type: TEXT
- incident_id: TEXT (nullable)
- employee_id: TEXT (nullable)
- order_id: TEXT (nullable)
- location_id: TEXT (nullable)
- shift_id: TEXT (nullable)
- details: JSONB
- risk_score: INTEGER (nullable)
- severity: TEXT (nullable)
- occurred_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ

Indexes:
- tenant_id, event_type
- incident_id
- employee_id
- occurred_at (DESC)
```

### fraud_alerts
```sql
Alerts generated for fraud incidents

- id: UUID (PK)
- tenant_id: TEXT
- alert_id: TEXT (UNIQUE)
- incident_id: TEXT
- severity: TEXT
- alert_type: TEXT (automated|manual|escalation)
- recipient_type: TEXT (system_admin|location_manager|compliance_officer|all)
- status: TEXT (pending|acknowledged|resolved)
- action_required: TEXT (nullable)
- generated_at: TIMESTAMPTZ
- acknowledged_at: TIMESTAMPTZ (nullable)
- resolved_at: TIMESTAMPTZ (nullable)
- created_at: TIMESTAMPTZ

Indexes:
- tenant_id
- incident_id
- status
- severity
- generated_at (DESC)
```

### fraud_statistics
```sql
Aggregated statistics for dashboards

- id: UUID (PK)
- tenant_id: TEXT
- period_start: TIMESTAMPTZ
- period_end: TIMESTAMPTZ
- total_incidents: INTEGER
- critical_incidents: INTEGER
- high_incidents: INTEGER
- medium_incidents: INTEGER
- low_incidents: INTEGER
- confirmed_incidents: INTEGER
- dismissed_incidents: INTEGER
- average_risk_score: NUMERIC
- total_prevented_loss: NUMERIC (nullable)
- created_at: TIMESTAMPTZ

Unique constraint: (tenant_id, period_start, period_end)
```

## Event Model

### FraudDetected Event
```typescript
{
  incidentId: string;           // Unique incident ID
  tenantId: string;
  detectedAt: string;           // ISO timestamp
  riskScore: number;            // 0-1000
  severity: FraudSeverity;      // low|medium|high|critical
  status: FraudStatus;
  patterns: Array<{
    type: AnomalyType;
    severity: FraudSeverity;
    confidence: number;         // 0-100
    evidence: string;           // Human-readable description
    weight: number;             // 0-100
  }>;
  orderId?: string;
  employeeId?: string;
  locationId?: string;
  shiftId?: string;
}
```

### FraudStatusChanged Event
```typescript
{
  incidentId: string;
  tenantId: string;
  previousStatus: FraudStatus;
  newStatus: FraudStatus;
  changedAt: string;
  reason?: string;
  investigationNotes?: string;
}
```

### FraudAlertGenerated Event
```typescript
{
  alertId: string;
  incidentId: string;
  tenantId: string;
  severity: FraudSeverity;
  generatedAt: string;
  recipientType: "system_admin" | "location_manager" | "compliance_officer" | "all";
  actionRequired: string;
}
```

## Integration Points

### 1. Order Service Integration

**When to trigger fraud detection:**
- After order is cancelled
- After refund is processed
- After payment is made (velocity checks)

```typescript
// In CancelOrderUseCase or PayOrderUseCase
await detectFraudUseCase.execute({
  tenantId,
  context: { orderId, employeeId, locationId, shiftId },
  analyses: {
    cancellations: await calculateCancellationAnalysis(employeeId),
    refunds: await calculateRefundAnalysis(employeeId)
  }
});
```

### 2. Inventory Service Integration

**When to trigger fraud detection:**
- After write-offs
- During inventory reconciliation
- After large adjustments

```typescript
// In WriteOffInventoryUseCase
await detectFraudUseCase.execute({
  tenantId,
  context: { locationId, employeeId },
  analyses: {
    inventory: await calculateInventoryAnalysis(locationId)
  }
});
```

### 3. Shift Management Integration

**When to trigger fraud detection:**
- After shift close
- For shift reconciliation

```typescript
// In CloseShiftUseCase
await detectFraudUseCase.execute({
  tenantId,
  context: { shiftId, employeeId, locationId },
  analyses: {
    refunds: await calculateRefundAnalysis(employeeId, shiftId),
    cancellations: await calculateCancellationAnalysis(employeeId, shiftId),
    velocity: await calculateVelocityAnalysis(employeeId, shiftId)
  }
});
```

## Usage Examples

### Basic Fraud Detection

```typescript
// Inject dependencies
const fraudRepository = new SupabaseFraudRepository(supabaseClient);
const idGenerator = new UUIDGenerator();
const eventPublisher = new NATSEventPublisher();

const detectFraudUseCase = new DetectFraudUseCase(
  fraudRepository,
  idGenerator,
  eventPublisher
);

// Detect fraud
const result = await detectFraudUseCase.execute({
  tenantId: "tenant-123",
  context: {
    orderId: "order-456",
    employeeId: "emp-789",
    locationId: "loc-001"
  },
  analyses: {
    refunds: {
      refundCount: 6,
      totalRefundAmount: 600,
      averageRefundAmount: 100,
      timeWindowDays: 1
    },
    cancellations: {
      cancellationCount: 12,
      totalCancelledAmount: 800,
      averageCancelledAmount: 66.67,
      timeWindowDays: 1,
      cancellationRate: 0.45
    }
  }
});

if (result.isSuccess) {
  console.log(`Fraud detected: ${result.value.fraudDetected}`);
  console.log(`Risk Score: ${result.value.riskScore}`);
  console.log(`Severity: ${result.value.severity}`);
  console.log(`Recommendations:`, result.value.recommendations);
}
```

### Querying Fraud Incidents

```typescript
// Find all critical incidents
const criticalIncidents = await fraudRepository.findByTenant(tenantId, {
  severity: "critical",
  limit: 50
});

// Find incidents for employee
const employeeIncidents = await fraudRepository.findByEmployee(employeeId, tenantId);

// Get statistics
const stats = await fraudRepository.getStatistics(tenantId, 30); // Last 30 days
console.log(`Total incidents: ${stats.totalIncidents}`);
console.log(`Critical: ${stats.criticalCount}`);
console.log(`Average risk score: ${stats.averageRiskScore}`);
```

### Investigating Fraud Incidents

```typescript
// Get incident
const incident = await fraudRepository.findById(incidentId, tenantId);

if (incident) {
  // Start investigation
  incident.investigate("Initial review - customer complaint received");
  
  // Later: Confirm fraud
  incident.confirm();
  
  // Later: Resolve
  incident.resolve("Refund processed, employee terminated");
  
  // Save updates
  await fraudRepository.update(incident);
}
```

## Customization & Configuration

### Per-Tenant Rule Configuration

Rules can be configured per tenant to adjust thresholds:

```typescript
// In fraud_rules table
{
  tenant_id: "tenant-123",
  rule_type: "refund",
  enabled: true,
  thresholds: {
    refundCountThreshold: 5,
    refundAmountThreshold: 500,
    confidenceBase: 70,
    timeWindowDays: 1
  },
  severity_base: "medium",
  weight: 40
}
```

### Adding New Rules

To add a new fraud rule:

1. Create a new rule class implementing the evaluation logic
2. Add to `fraud_rules` table configuration
3. Integrate in `DetectFraudUseCase.execute()`

```typescript
export class NewFraudRule {
  evaluate(analysis: AnalysisType): SuspiciousPattern | null {
    // Implement logic
  }
}
```

## Recommendations & Actions

The system provides automated recommendations based on detected patterns:

### By Severity

**Critical:**
- Immediately escalate to compliance team
- Consider freezing employee/location
- Initiate formal investigation protocol

**High:**
- Schedule urgent investigation
- Enable enhanced monitoring
- Notify location manager

**Medium:**
- Flag for review
- Standard investigation
- Monitor for patterns

### By Pattern Type

**Excessive Refunds:**
- Review refund justifications
- Audit recent transactions
- Review exception policies

**Suspicious Cancellations:**
- Analyze patterns by employee
- Review customer complaints
- Check with management

**Abnormal Discounts:**
- Review authorization policies
- Require manager approval
- Audit discount usage

**Inventory Discrepancies:**
- Perform physical count
- Review access logs
- Investigate missing items

**Employee Anomalies:**
- Profile against baseline
- Cross-reference metrics
- Schedule conversation

**Velocity Abuse:**
- Flag for rapid patterns
- Implement rate limiting
- Monitor account

## Monitoring & Alerting

### Monitoring Metrics

- **Detection Rate:** Incidents detected per day/week/month
- **False Positive Rate:** Dismissed incidents vs total
- **Response Time:** Time from detection to investigation
- **Resolution Rate:** Confirmed fraud vs total incidents
- **Severity Distribution:** Count by severity level
- **Pattern Distribution:** Count by pattern type
- **Employee Risk Score:** Average risk score per employee
- **Location Risk Score:** Average risk score per location

### Alert Recipients

**System Admin:** All critical incidents
**Location Manager:** Incidents affecting their location
**Compliance Officer:** High/Critical incidents, regular summaries

## Performance Considerations

- **Index Strategy:** All queries have appropriate indexes
- **Query Optimization:** Uses pagination and filtering
- **Archive Strategy:** Move resolved incidents to archive table after 90 days
- **Statistics Cache:** Refresh fraud_statistics table daily

## Compliance & Security

- **Audit Trail:** All changes logged in audit_logs table
- **Data Sensitivity:** Fraud data classified as sensitive
- **Access Control:** Role-based access to fraud incidents
- **GDPR:** Data retention policy enforced (90 days default)
- **Encryption:** Sensitive data encrypted at rest

## Future Enhancements

1. **Machine Learning Models**
   - Anomaly detection using historical patterns
   - Employee behavior profiling
   - Transaction clustering

2. **Advanced Analytics**
   - Predictive fraud scoring
   - Seasonal pattern analysis
   - Peer group comparison

3. **Integration**
   - Third-party fraud detection services
   - Bank/payment processor verification
   - External compliance platforms

4. **Real-time Processing**
   - Stream processing for immediate detection
   - WebSocket alerts for critical incidents
   - Mobile push notifications

## Testing Strategy

### Unit Tests
- Test each fraud rule independently
- Test risk score calculations
- Test entity state transitions

### Integration Tests
- Test full fraud detection flow
- Test repository operations
- Test event publishing

### E2E Tests
- Simulate complete fraud scenarios
- Verify alerts are generated
- Verify statistics are calculated

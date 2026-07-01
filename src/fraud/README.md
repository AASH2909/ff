# Fraud Foundation Module

## Quick Overview

Comprehensive, production-ready fraud detection system for CONTROL OS POS platform.

**Features:**
- 🎯 6 advanced fraud detection rules
- 📊 Intelligent risk scoring (0-1000)
- 🔍 Full investigation workflow
- 📈 Real-time analytics
- 🔐 Enterprise-grade security

---

## Module Structure

```
fraud/
├── types.ts                     # Type definitions
├── index.ts                     # Module exports
├── rules-engine.ts              # Fraud detection rules & scoring
├── event-contracts.ts           # Event type definitions
├── value-objects/
│   └── index.ts                 # FraudRiskScore, ConfidenceScore, SuspiciousPattern
├── entities/
│   └── fraud-incident.ts        # FraudIncident domain entity
└── ports/
    └── fraud-repository.ts      # Repository interface
```

---

## Core Components

### Value Objects
- **FraudRiskScore** (0-1000) - Immutable risk score with severity levels
- **ConfidenceScore** (0-100) - Pattern confidence/probability
- **SuspiciousPattern** - Individual detected anomaly

### Entities
- **FraudIncident** - Main fraud incident aggregate root
  - Status lifecycle: detected → investigating → confirmed → resolved/dismissed
  - Contains patterns, risk score, investigation notes

### Rules Engine (6 Production Rules)
1. **ExcessiveRefundsRule** - Detects 5+ refunds or >$500 in 24h
2. **SuspiciousCancellationsRule** - Detects 10+ cancellations or 40%+ rate
3. **AbnormalDiscountRule** - Detects 8+ discounts with 15%+ average
4. **InventoryManipulationRule** - Detects 5+ write-offs or >$1000 value
5. **EmployeeAnomalyRule** - Detects 2+ std deviation from baseline
6. **VelocityAbuseRule** - Detects rapid-fire transactions (20+/15min avg)

### Use Cases
- **DetectFraudUseCase** - Main orchestrator for fraud detection

### Repository
- **FraudRepository** - Port for persistence
- **SupabaseFraudRepository** - Supabase implementation

---

## Quick Start

### 1. Import Module
```typescript
import {
  DetectFraudUseCase,
  FraudIncident,
  FraudRiskScore,
  SupabaseFraudRepository
} from "@/fraud";
```

### 2. Create Dependencies
```typescript
const fraudRepository = new SupabaseFraudRepository(supabaseClient);
const detectFraudUseCase = new DetectFraudUseCase(
  fraudRepository,
  idGenerator,
  eventPublisher
);
```

### 3. Detect Fraud
```typescript
const result = await detectFraudUseCase.execute({
  tenantId: "tenant-123",
  context: { employeeId: "emp-456", orderId: "order-789" },
  analyses: {
    refunds: {
      refundCount: 6,
      totalRefundAmount: 600,
      averageRefundAmount: 100,
      timeWindowDays: 1
    }
  }
});

if (result.isSuccess) {
  console.log(`Risk Score: ${result.value.riskScore}`);
  console.log(`Severity: ${result.value.severity}`);
  console.log(`Recommendations:`, result.value.recommendations);
}
```

---

## Risk Score Levels

| Score | Severity | Response |
|-------|----------|----------|
| 0-200 | Low | Monitor & review |
| 201-400 | Medium | Investigate |
| 401-700 | High | Urgent investigation |
| 701-1000 | Critical | Immediate action |

---

## Database Tables

### fraud_incidents
Primary storage for fraud incidents
- incident_id (business ID)
- status (detected/investigating/confirmed/resolved/dismissed)
- risk_score (0-1000)
- patterns (JSONB array)
- investigation_notes
- All indexed for performance

### fraud_rules
Per-tenant rule configuration
- rule_type, enabled, thresholds
- severity_base, weight

### fraud_monitoring_events
Event log for tracking
- event_type, details, risk_score

### fraud_alerts
Alert management
- alert_id, status, recipient_type

### fraud_statistics
Aggregated metrics for dashboards
- period-based statistics
- incident counts by severity

---

## Integration Points

### Order Service
```typescript
// In CancelOrderUseCase
const refundAnalysis = await calculateRefundMetrics(employeeId, tenantId, 24);
await detectFraudUseCase.execute({
  tenantId,
  context: { orderId, employeeId, locationId },
  analyses: { refunds: refundAnalysis }
});
```

### Inventory Service
```typescript
// In WriteOffInventoryUseCase
const inventoryAnalysis = await calculateInventoryMetrics(locationId, tenantId, 1);
await detectFraudUseCase.execute({
  tenantId,
  context: { locationId, employeeId },
  analyses: { inventory: inventoryAnalysis }
});
```

### Shift Management
```typescript
// In CloseShiftUseCase
const [refunds, cancellations, velocity] = await Promise.all([
  calculateRefundMetrics(employeeId, tenantId, timeWindowHours),
  calculateCancellationMetrics(employeeId, tenantId, timeWindowHours),
  calculateVelocityMetrics(employeeId, tenantId, 60)
]);

await detectFraudUseCase.execute({
  tenantId,
  context: { shiftId, employeeId, locationId },
  analyses: { refunds, cancellations, velocity }
});
```

---

## Events Emitted

### FraudDetected
Primary event when fraud is detected
```json
{
  "incidentId": "string",
  "tenantId": "string",
  "riskScore": 650,
  "severity": "high",
  "patterns": [...],
  "employeeId": "string?"
}
```

### FraudStatusChanged
When incident status changes (investigating/confirmed/resolved)

### FraudRiskScoreUpdated
When risk score is adjusted after investigation

### FraudAlertGenerated
When alert is sent to stakeholders

---

## Investigation Workflow

```
1. FraudDetected Event
        ↓
2. Assess & Prioritize (by severity)
        ↓
3. Gather Evidence
        ↓
4. Determine Status
        ├─ Dismiss (false positive)
        ├─ Investigate (needs more info)
        └─ Confirm (clear fraud)
        ↓
5. Take Action
        ├─ Employee termination
        ├─ Financial recovery
        ├─ Policy update
        └─ Customer notification
        ↓
6. Monitor & Close
```

---

## Query Examples

```typescript
// Find by incident ID
const incident = await fraudRepository.findById(id, tenantId);

// Find all critical incidents
const critical = await fraudRepository.findByTenant(tenantId, {
  status: "critical",
  limit: 50
});

// Find incidents by employee
const employeeIncidents = await fraudRepository.findByEmployee(empId, tenantId);

// Get statistics
const stats = await fraudRepository.getStatistics(tenantId, 30);
// Returns: { totalIncidents, byStatus, bySeverity, averageRiskScore, criticalCount }

// Update incident
incident.investigate("Initial review...");
await fraudRepository.update(incident);
```

---

## Configuration

### Per-Tenant Rules
```sql
INSERT INTO fraud_rules (
  tenant_id, rule_type, enabled, thresholds, severity_base, weight
) VALUES (
  'tenant-1', 'refund', true, 
  '{
    "refundCountThreshold": 5,
    "refundAmountThreshold": 500,
    "confidenceBase": 70
  }',
  'medium', 40
);
```

### Custom Thresholds
Adjust thresholds in fraud_rules table:
- refundCountThreshold
- refundAmountThreshold
- cancellationCountThreshold
- discountCountThreshold
- inventoryDiscrepancyThreshold
- velocityTransactionThreshold

---

## Testing

### Unit Test Pattern
```typescript
const rule = new ExcessiveRefundsRule();
const pattern = rule.evaluate({
  refundCount: 6,
  totalRefundAmount: 600,
  averageRefundAmount: 100,
  timeWindowDays: 1
});

expect(pattern).not.toBeNull();
expect(pattern?.severity).toBe("high");
```

### Integration Test Pattern
```typescript
const result = await detectFraudUseCase.execute({...});

expect(result.isSuccess).toBe(true);
expect(result.value.fraudDetected).toBe(true);
expect(fraudRepository.save).toHaveBeenCalled();
```

---

## Performance

- All queries have indexes
- Pagination supported (limit/offset)
- JSONB queries optimized
- Archive old incidents (90+ days)
- Statistics pre-calculated daily

---

## Monitoring

### Key Metrics
- Total incidents per tenant
- Average risk score
- Critical incident count
- False positive rate
- Investigation closure time
- Financial impact recovered

### Example Queries
```sql
-- Critical incidents in last 24h
SELECT COUNT(*) FROM fraud_incidents 
WHERE severity = 'critical' 
AND detected_at > now() - interval '24 hours';

-- Statistics by severity
SELECT severity, COUNT(*) 
FROM fraud_incidents 
WHERE tenant_id = 'tenant-1'
GROUP BY severity;

-- Confirmed fraud by employee
SELECT employee_id, COUNT(*), SUM(risk_score) 
FROM fraud_incidents
WHERE status = 'confirmed' 
GROUP BY employee_id 
ORDER BY COUNT(*) DESC;
```

---

## Documentation

- 📘 [Architecture Guide](fraud-foundation.md) - Detailed design
- 📗 [Implementation Guide](fraud-implementation-guide.md) - Setup & integration
- 📙 [Investigation Procedures](fraud-investigation-procedures.md) - Response workflow

---

## Support

For issues or questions:
1. Check [Troubleshooting](fraud-implementation-guide.md#troubleshooting)
2. Review [Investigation Procedures](fraud-investigation-procedures.md)
3. Consult [Architecture](fraud-foundation.md) for design details

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** 2026-06-24

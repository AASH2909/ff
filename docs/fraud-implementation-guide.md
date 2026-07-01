# Fraud Foundation - Implementation Guide

## Quick Start

### 1. Database Setup

Run the migration to create fraud tables:

```bash
# Using Supabase CLI
supabase migration up --version 202606240001_create_fraud_foundation

# Or manually in Supabase Dashboard:
# Copy contents of supabase/migrations/202606240001_create_fraud_foundation.sql
```

**Tables created:**
- `fraud_incidents` - Main incident storage
- `fraud_rules` - Configuration per tenant
- `fraud_monitoring_events` - Event log
- `fraud_alerts` - Alert management
- `fraud_statistics` - Dashboard data

### 2. Core Dependency Setup

```typescript
// src/application/dependencies.ts

import { SupabaseFraudRepository } from "@/repositories/supabase/supabase-fraud-repository";
import { DetectFraudUseCase } from "@/application/use-cases/detect-fraud-use-case";

export function createFraudDependencies() {
  const fraudRepository = new SupabaseFraudRepository(supabaseClient);
  
  const detectFraudUseCase = new DetectFraudUseCase(
    fraudRepository,
    idGenerator,
    eventPublisher
  );

  return {
    fraudRepository,
    detectFraudUseCase
  };
}
```

### 3. Integration with Order Service

In your order cancellation use case:

```typescript
// src/application/use-cases/cancel-order-use-case.ts

export class CancelOrderUseCase implements UseCase<CancelOrderInputDto, CancelOrderOutputDto> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditLogger: AuditLogger,
    private readonly eventPublisher: ApplicationEventPublisher,
    private readonly detectFraudUseCase: DetectFraudUseCase // NEW
  ) {}

  async execute(input: CancelOrderInputDto): Promise<Result<CancelOrderOutputDto>> {
    // ... existing cancel logic ...

    // NEW: Detect fraud on cancellation
    const order = await this.orderRepository.findById(input.orderId, input.tenantId);
    const cancelAnalysis = await calculateCancellationMetrics(
      order.employeeId,
      input.tenantId,
      24 // Last 24 hours
    );

    await this.detectFraudUseCase.execute({
      tenantId: input.tenantId,
      context: {
        orderId: input.orderId,
        employeeId: order.employeeId,
        locationId: order.locationId
      },
      analyses: {
        cancellations: cancelAnalysis
      },
      correlationId: input.correlationId
    });

    return success({ order: toOrderDto(order) });
  }
}
```

### 4. Integration with Refund Processing

```typescript
// src/application/use-cases/refund-order-use-case.ts

export class RefundOrderUseCase implements UseCase<RefundOrderInputDto, RefundOrderOutputDto> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly detectFraudUseCase: DetectFraudUseCase // NEW
  ) {}

  async execute(input: RefundOrderInputDto): Promise<Result<RefundOrderOutputDto>> {
    // ... existing refund logic ...

    // NEW: Detect refund anomalies
    const order = await this.orderRepository.findById(input.orderId, input.tenantId);
    const refundAnalysis = await calculateRefundMetrics(
      order.employeeId,
      input.tenantId,
      24 // Last 24 hours
    );

    await this.detectFraudUseCase.execute({
      tenantId: input.tenantId,
      context: {
        orderId: input.orderId,
        employeeId: order.employeeId,
        locationId: order.locationId
      },
      analyses: {
        refunds: refundAnalysis
      },
      correlationId: input.correlationId
    });

    return success({ order: toOrderDto(order) });
  }
}
```

### 5. Helper Functions for Analysis Calculation

```typescript
// src/fraud/analysis-helpers.ts

import { Money } from "@/domain/value-objects/money";

/**
 * Calculate refund metrics for an employee in a time window
 */
export async function calculateRefundMetrics(
  employeeId: string,
  tenantId: string,
  timeWindowHours: number,
  orderRepository: OrderRepository
): Promise<RefundAnalysis> {
  const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
  
  const refundedOrders = await orderRepository.findRefundedByEmployee(
    employeeId,
    tenantId,
    since
  );

  const refundAmounts = refundedOrders
    .map(o => o.payment?.amount ?? Money.zero("USD"))
    .reduce((total, amount) => total.add(amount), Money.zero("USD"));

  return {
    refundCount: refundedOrders.length,
    totalRefundAmount: refundAmounts.amount,
    averageRefundAmount: 
      refundedOrders.length > 0 
        ? refundAmounts.amount / refundedOrders.length 
        : 0,
    timeWindowDays: timeWindowHours / 24
  };
}

/**
 * Calculate cancellation metrics for an employee in a time window
 */
export async function calculateCancellationMetrics(
  employeeId: string,
  tenantId: string,
  timeWindowHours: number,
  orderRepository: OrderRepository
): Promise<CancellationAnalysis> {
  const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
  
  const allOrders = await orderRepository.findByEmployeeAndDate(
    employeeId,
    tenantId,
    since
  );
  
  const cancelledOrders = allOrders.filter(o => o.status === "cancelled");
  
  const cancelledAmounts = cancelledOrders
    .map(o => o.total)
    .reduce((total, amount) => total.add(amount), Money.zero("USD"));

  return {
    cancellationCount: cancelledOrders.length,
    totalCancelledAmount: cancelledAmounts.amount,
    averageCancelledAmount:
      cancelledOrders.length > 0
        ? cancelledAmounts.amount / cancelledOrders.length
        : 0,
    timeWindowDays: timeWindowHours / 24,
    cancellationRate: allOrders.length > 0 
      ? cancelledOrders.length / allOrders.length 
      : 0
  };
}

/**
 * Calculate discount metrics
 */
export async function calculateDiscountMetrics(
  employeeId: string,
  tenantId: string,
  timeWindowHours: number,
  orderRepository: OrderRepository
): Promise<DiscountAnalysis> {
  const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
  
  const ordersWithDiscounts = await orderRepository.findWithDiscountsByEmployee(
    employeeId,
    tenantId,
    since
  );

  const totalDiscount = ordersWithDiscounts.reduce(
    (sum, order) => sum + (order.discount?.amount ?? 0),
    0
  );

  const avgDiscountPercentage = ordersWithDiscounts.length > 0
    ? ordersWithDiscounts.reduce((sum, order) => 
        sum + (order.discount?.percentage ?? 0), 0
      ) / ordersWithDiscounts.length
    : 0;

  return {
    discountCount: ordersWithDiscounts.length,
    totalDiscountAmount: totalDiscount,
    averageDiscountPercentage: avgDiscountPercentage,
    timeWindowDays: timeWindowHours / 24
  };
}

/**
 * Calculate inventory discrepancies
 */
export async function calculateInventoryMetrics(
  locationId: string,
  tenantId: string,
  timeWindowDays: number,
  inventoryRepository: InventoryRepository,
  auditRepository: AuditRepository
): Promise<InventoryAnalysis> {
  const since = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

  // Get write-offs
  const writeOffs = await auditRepository.findByResourceType(
    tenantId,
    "inventory_write_off",
    since
  );

  const totalQuantity = writeOffs.reduce(
    (sum, audit) => sum + (audit.newValue?.quantity ?? 0),
    0
  );

  // Estimate value based on products
  let totalValue = 0;
  for (const writeOff of writeOffs) {
    const product = await inventoryRepository.getProduct(writeOff.metadata?.productId);
    if (product) {
      totalValue += (writeOff.newValue?.quantity ?? 0) * product.price;
    }
  }

  return {
    discrepancyCount: writeOffs.length,
    totalUnaccountedQuantity: totalQuantity,
    discrepancyValue: totalValue,
    timeWindowDays
  };
}

/**
 * Calculate velocity metrics (transaction frequency)
 */
export async function calculateVelocityMetrics(
  employeeId: string,
  tenantId: string,
  timeWindowMinutes: number,
  orderRepository: OrderRepository
): Promise<VelocityAnalysis> {
  const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
  
  const recentOrders = await orderRepository.findByEmployeeAndDate(
    employeeId,
    tenantId,
    since
  );

  const timeSpanSeconds = (Date.now() - since.getTime()) / 1000;
  const avgTimePerTransaction = recentOrders.length > 0
    ? timeSpanSeconds / recentOrders.length
    : 0;

  return {
    transactionCount: recentOrders.length,
    timeWindowMinutes,
    avgTimePerTransaction
  };
}
```

### 6. Fraud Alerts Subscriber

Handle fraud detected events:

```typescript
// src/events/subscribers/fraud-detected-subscriber.ts

import type { Subscription } from "@/events/event-bus";

export class FraudDetectedSubscriber implements Subscription {
  name = "fraud-detected-subscriber";
  eventName = "FraudDetected";
  subject = "controlos.events.v1.FraudDetected";

  constructor(
    private readonly fraudRepository: FraudRepository,
    private readonly emailService: EmailService
  ) {}

  async handle(event: DomainEvent<"FraudDetected">): Promise<void> {
    const payload = event.payload;

    // Log for monitoring
    console.log(
      `🚨 Fraud Detected [${payload.severity}]: ${payload.riskScore} risk score`
    );

    // Send alerts based on severity
    if (payload.severity === "critical") {
      await this.emailService.send({
        to: await this.getComplianceOfficers(payload.tenantId),
        subject: `⚠️ CRITICAL FRAUD ALERT - ${payload.incidentId}`,
        template: "fraud-alert-critical",
        data: {
          incidentId: payload.incidentId,
          riskScore: payload.riskScore,
          patterns: payload.patterns,
          recommendations: this.getRecommendations(payload.patterns)
        }
      });
    } else if (payload.severity === "high") {
      await this.emailService.send({
        to: await this.getLocationManagers(payload.tenantId),
        subject: `⚠️ High Risk Fraud Alert - ${payload.incidentId}`,
        template: "fraud-alert-high",
        data: { incidentId: payload.incidentId, riskScore: payload.riskScore }
      });
    }

    // Store alert in database
    await this.fraudRepository.saveAlert({
      alertId: `alert-${payload.incidentId}-${Date.now()}`,
      incidentId: payload.incidentId,
      tenantId: payload.tenantId,
      severity: payload.severity,
      alertType: "automated",
      recipientType: this.getRecipientType(payload.severity),
      actionRequired: this.getActionRequired(payload.severity)
    });
  }

  private getRecipientType(severity: FraudSeverity): string {
    if (severity === "critical") return "all";
    if (severity === "high") return "compliance_officer";
    return "location_manager";
  }

  private getActionRequired(severity: FraudSeverity): string {
    if (severity === "critical") return "Immediate investigation and escalation required";
    if (severity === "high") return "Schedule urgent investigation";
    return "Standard investigation";
  }

  private getRecommendations(patterns: any[]): string[] {
    // Extract recommendations from patterns
    return [];
  }

  private async getComplianceOfficers(tenantId: string): Promise<string[]> {
    // Get compliance officers from user service
    return [];
  }

  private async getLocationManagers(tenantId: string): Promise<string[]> {
    // Get location managers from user service
    return [];
  }
}
```

### 7. Register in Event Bus

```typescript
// src/events/subscribers/index.ts

import { FraudDetectedSubscriber } from "./fraud-detected-subscriber";

export function registerFraudSubscribers(eventBus: EventBus) {
  const fraudDetectedSubscriber = new FraudDetectedSubscriber(
    fraudRepository,
    emailService
  );

  eventBus.subscribe(fraudDetectedSubscriber);
}
```

## Testing

### Unit Test Example

```typescript
// src/fraud/rules-engine.spec.ts

import { ExcessiveRefundsRule } from "@/fraud/rules-engine";

describe("ExcessiveRefundsRule", () => {
  let rule: ExcessiveRefundsRule;

  beforeEach(() => {
    rule = new ExcessiveRefundsRule();
  });

  it("should detect excessive refunds", () => {
    const analysis = {
      refundCount: 6,
      totalRefundAmount: 600,
      averageRefundAmount: 100,
      timeWindowDays: 1
    };

    const pattern = rule.evaluate(analysis);

    expect(pattern).not.toBeNull();
    expect(pattern?.severity).toBe("high");
    expect(pattern?.confidence.value).toBeGreaterThan(70);
  });

  it("should not flag low refund counts", () => {
    const analysis = {
      refundCount: 2,
      totalRefundAmount: 200,
      averageRefundAmount: 100,
      timeWindowDays: 1
    };

    const pattern = rule.evaluate(analysis);

    expect(pattern).toBeNull();
  });
});
```

### Integration Test Example

```typescript
// src/application/use-cases/detect-fraud-use-case.spec.ts

describe("DetectFraudUseCase", () => {
  let useCase: DetectFraudUseCase;
  let fraudRepository: FraudRepository;
  let idGenerator: IdGenerator;
  let eventPublisher: ApplicationEventPublisher;

  beforeEach(() => {
    fraudRepository = mockFraudRepository();
    idGenerator = mockIdGenerator();
    eventPublisher = mockEventPublisher();
    useCase = new DetectFraudUseCase(fraudRepository, idGenerator, eventPublisher);
  });

  it("should create fraud incident when patterns detected", async () => {
    const result = await useCase.execute({
      tenantId: "tenant-1",
      context: { employeeId: "emp-1" },
      analyses: {
        refunds: {
          refundCount: 6,
          totalRefundAmount: 600,
          averageRefundAmount: 100,
          timeWindowDays: 1
        }
      }
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.fraudDetected).toBe(true);
    expect(fraudRepository.save).toHaveBeenCalled();
    expect(eventPublisher.publish).toHaveBeenCalled();
  });

  it("should return clean result when no patterns detected", async () => {
    const result = await useCase.execute({
      tenantId: "tenant-1",
      context: {},
      analyses: {}
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.fraudDetected).toBe(false);
    expect(result.value.riskScore).toBe(0);
  });
});
```

## Monitoring

### Key Metrics to Track

1. **Detection Metrics**
   ```
   fraud_incidents_total{tenant_id, severity}
   fraud_incidents_created_rate
   fraud_average_risk_score{tenant_id}
   ```

2. **Performance Metrics**
   ```
   fraud_detection_duration_ms
   fraud_repository_operation_duration_ms
   fraud_event_publish_duration_ms
   ```

3. **Quality Metrics**
   ```
   fraud_false_positive_rate
   fraud_confirmation_rate
   fraud_resolution_time_hours
   ```

### Example Prometheus Queries

```promql
# Critical fraud incidents in last 24h
fraud_incidents_total{severity="critical"} offset 24h

# Average detection time
avg(fraud_detection_duration_ms) by (rule_type)

# Confirmation rate
fraud_confirmed_incidents / fraud_total_incidents
```

## Troubleshooting

### Issue: No fraud detected when expected

**Cause:** Thresholds might be too high

**Solution:**
1. Check fraud_rules configuration
2. Verify analysis data being passed
3. Lower thresholds in fraud_rules table for testing

### Issue: Too many false positives

**Cause:** Thresholds too low or patterns misconfigured

**Solution:**
1. Review dismissed incidents
2. Adjust weights in fraud_rules
3. Add seasonality adjustments

### Issue: Performance degradation

**Cause:** Large incident count affecting queries

**Solution:**
1. Archive old incidents (90+ days)
2. Use pagination in queries
3. Add more specific indexes

## Next Steps

1. ✅ Deploy migrations
2. ✅ Integrate with use cases
3. ✅ Configure per-tenant rules
4. ✅ Set up alert handlers
5. ✅ Add monitoring
6. ✅ Train team on investigation process
7. ✅ Document policies and procedures

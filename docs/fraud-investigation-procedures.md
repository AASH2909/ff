# Fraud Investigation & Response Procedures

## Investigation Workflow

### Alert Received

```
FraudDetected Event
        ↓
Severity Check
        ↓
├─ CRITICAL → Immediate Escalation
├─ HIGH → Urgent Investigation  
├─ MEDIUM → Standard Investigation
└─ LOW → Routine Review
```

### Investigation Steps

#### Step 1: Initial Assessment (Within 15 minutes for Critical)

```typescript
// Get incident details
const incident = await fraudRepository.findById(incidentId, tenantId);

// Review patterns
incident.patterns.forEach(pattern => {
  console.log(`Pattern: ${pattern.type}`);
  console.log(`Severity: ${pattern.severity}`);
  console.log(`Confidence: ${pattern.confidence.value}%`);
  console.log(`Evidence: ${pattern.evidence}`);
});

// Calculate composite risk
console.log(`Risk Score: ${incident.riskScore.value}/1000`);
console.log(`Overall Severity: ${incident.severity}`);
```

#### Step 2: Context Gathering

**If Employee Involved:**
- Employee history
- Performance metrics
- Previous incidents
- Training records

**If Order Involved:**
- Customer details
- Order items
- Payment method
- Discounts/refunds applied

**If Location Involved:**
- Location performance
- Staff composition
- Recent changes
- Audit history

**If Shift Involved:**
- Shift duration
- Transactions processed
- Beginning/ending cash
- Exception events

```typescript
// Gather context
const context = {
  employee: await getEmployeeContext(incident.employeeId),
  order: await getOrderContext(incident.orderId),
  location: await getLocationContext(incident.locationId),
  shift: await getShiftContext(incident.shiftId),
  auditHistory: await auditRepository.findRelated(incident.id, tenantId)
};
```

#### Step 3: Evidence Collection

**For Refund Anomalies:**
- Review refund justifications
- Check customer complaints
- Verify product receipt
- Compare to peer average
- Review exception policy usage

**For Cancellation Anomalies:**
- Review cancellation reasons
- Check customer satisfaction scores
- Verify patterns by customer
- Compare to peer average
- Review manager approvals

**For Discount Anomalies:**
- Review discount authorizations
- Check discount levels
- Verify items discounted
- Compare to peers
- Review company policies

**For Inventory Anomalies:**
- Physical inventory count
- Review access logs
- Check receiving records
- Verify write-off justifications
- Compare to system records

**For Employee Anomalies:**
- Review transaction samples
- Conduct interviews
- Check for personal issues
- Verify training status
- Review work history

**For Velocity Abuse:**
- Review transaction timestamps
- Check for automation evidence
- Verify payment processor logs
- Review customer behavior
- Check device information

```typescript
// Evidence collection template
const evidence = {
  documentedProof: [] as string[], // References to audit logs, receipts
  witnessStatements: [] as string[], // Manager, colleague statements
  transactionSamples: [] as string[], // Specific transaction IDs
  policyViolations: [] as string[], // Which policies broken
  financialImpact: 0, // Amount affected
  timeline: [] as Array<{ date: Date; event: string }>, // Event sequence
  contradictions: [] as string[] // Inconsistencies found
};
```

#### Step 4: Determination

**Not Fraud (Dismiss):**
- No policy violations found
- Reasonable explanations provided
- Patterns within normal range for location/employee
- Customer satisfaction maintained

**Possible Fraud (Investigate):**
- Some evidence of policy violation
- Patterns warrant further investigation
- Need additional information
- Employee cooperation needed

**Confirmed Fraud:**
- Clear policy violations
- Deliberate intent evident
- Financial loss occurred
- Multiple confirming indicators

```typescript
// Determination logic
function determineIncidentStatus(evidence: Evidence): FraudStatus {
  if (evidence.contradictions.length === 0 && !evidence.policyViolations.length) {
    return "dismissed";
  }
  
  if (evidence.documentedProof.length > 0 && evidence.policyViolations.length > 2) {
    return "confirmed";
  }
  
  return "investigating";
}
```

### Investigation Record

Document all investigation activities:

```typescript
const investigation = {
  incidentId: incident.id,
  investigator: investigatorId,
  startedAt: new Date(),
  findings: {
    summary: "Clear evidence of unauthorized discounts applied",
    details: [
      {
        date: "2026-06-24",
        finding: "10% discount on $100 order - no authorization",
        source: "Order receipt #12345"
      }
    ]
  },
  recommendations: [
    "Terminate employee - deliberate policy violation",
    "Recover $10 from payroll",
    "Implement additional approval layers"
  ],
  evidenceReferences: [
    "audit-log-entry-123",
    "order-receipt-456",
    "training-record-789"
  ],
  completedAt: new Date()
};

// Update incident with investigation
incident.investigate(JSON.stringify(investigation));
incident.confirm(); // If fraud confirmed
incident.resolve("Investigation complete - fraud confirmed");

await fraudRepository.update(incident);
```

## Response Actions

### By Severity Level

#### Critical Fraud Response

**Immediate (< 1 hour):**
1. ✅ Notify Compliance Officer
2. ✅ Notify System Administrator
3. ✅ Freeze employee account/location
4. ✅ Preserve all evidence
5. ✅ Initiate formal investigation

**Within 24 hours:**
1. ✅ Complete evidence collection
2. ✅ Interview key stakeholders
3. ✅ Calculate financial impact
4. ✅ Contact legal counsel
5. ✅ Notify affected customers
6. ✅ Brief executive team

**Follow-up:**
1. ✅ Law enforcement notification (if >$5,000)
2. ✅ Implement preventive controls
3. ✅ Communicate findings to board
4. ✅ Initiate recovery process
5. ✅ Update fraud detection thresholds

#### High Fraud Response

**Within 4 hours:**
1. ✅ Notify location manager
2. ✅ Review evidence
3. ✅ Notify compliance officer
4. ✅ Preserve evidence

**Within 24 hours:**
1. ✅ Complete investigation
2. ✅ Determine if confirmed fraud
3. ✅ Calculate impact
4. ✅ Document findings

**Follow-up:**
1. ✅ Employee meeting/termination
2. ✅ Process refunds/recovery
3. ✅ Update policies if needed
4. ✅ Enhanced monitoring period

#### Medium Fraud Response

**Within 48 hours:**
1. ✅ Conduct investigation
2. ✅ Gather evidence
3. ✅ Interview relevant parties

**Outcomes:**
1. ✅ If confirmed: Take appropriate action
2. ✅ If possible: Escalate to high priority
3. ✅ If unconfirmed: Dismiss with notes
4. ✅ If training issue: Provide coaching

#### Low Fraud Response

**Standard process:**
1. ✅ Flag for review
2. ✅ Add to monitoring list
3. ✅ Review with employee
4. ✅ Close if false positive

### Action Templates

#### Employee Termination

```typescript
const terminationAction = {
  type: "employee_termination",
  date: new Date(),
  employee: employeeId,
  reason: "Fraudulent refunds - $500 loss over 2 days",
  authorization: managerApproval,
  evidence: incidentIds,
  recovery: {
    amount: 500,
    method: "payroll_deduction"
  },
  notifications: {
    hr: true,
    payroll: true,
    security: true,
    customer: false
  }
};
```

#### Customer Notification

```typescript
const customerNotification = {
  type: "customer_notification",
  date: new Date(),
  customers: affectedCustomerIds,
  message: "Your refund was processed fraudulently by an employee",
  action: "Full refund provided",
  compensation: "5% discount on next purchase",
  followUp: "Customer service call within 24 hours"
};
```

#### Financial Recovery

```typescript
const recoveryAction = {
  type: "financial_recovery",
  incidentId: incident.id,
  amount: calculatedLoss,
  recoveryMethods: [
    { method: "payroll_deduction", amount: 500, schedule: "next_paycheck" },
    { method: "small_claims", amount: 0, status: "pending_legal" }
  ],
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
};
```

#### Policy Update

```typescript
const policyUpdate = {
  type: "policy_update",
  triggeringIncident: incidentId,
  changes: [
    {
      policy: "discount_authorization",
      change: "Require manager approval for discounts > 10%",
      effective: new Date()
    }
  ],
  reason: "Prevent unauthorized discount patterns",
  communicationPlan: "Manager meeting next Monday"
};
```

## Fraud Response Checklist

### For Each Confirmed Fraud Incident

```
IMMEDIATE ACTIONS (Day 1)
□ Notify compliance officer
□ Preserve all evidence
□ Freeze involved accounts/locations
□ Interview manager
□ Calculate financial impact
□ Document initial findings
□ Plan investigation

INVESTIGATION (Days 2-5)
□ Collect and organize evidence
□ Interview all relevant parties
□ Review historical transactions
□ Verify policy violations
□ Calculate total loss
□ Document timeline
□ Consult legal counsel

DETERMINATION (Day 5)
□ Confirm fraud or dismiss
□ Assign severity level
□ Calculate investigation cost
□ Prepare findings report
□ Recommend actions

RESPONSE (Days 6+)
□ Execute recommended actions
□ Notify affected parties
□ Process financial recovery
□ Update prevention controls
□ Train staff on prevention
□ Monitor for recurrence

CLOSURE
□ Close incident
□ Archive evidence
□ Update statistics
□ Share learnings
□ Monitor for trends
```

## Common Fraud Scenarios & Responses

### Scenario 1: Employee Excessive Refunds
**Pattern:** 10+ refunds per day, $50-200 each
**Investigation:** Review refund justifications, customer feedback, peer comparison
**Likely Cause:** Customer returns (legitimate) OR refunding friends/family (fraud) OR accepting cash without issuing receipt (theft)
**Response if Fraud:** 
- Terminate if deliberate
- Recover funds
- Add manager approval for refunds > $50
- Review camera footage

### Scenario 2: Ghost Discounts
**Pattern:** 15%+ average discount, no authorization trail
**Investigation:** Review discount codes, authorization policies, customer profiles
**Likely Cause:** Employee sharing discount codes OR manually applying unapproved discounts
**Response if Fraud:**
- Terminate if deliberate
- Recover lost revenue
- Implement centralized discount control
- Audit all historical discounts

### Scenario 3: Inventory Write-off Abuse
**Pattern:** Regular high-value write-offs, poor documentation
**Investigation:** Physical inventory count, access logs, justification review
**Likely Cause:** Poor process control OR deliberate inventory theft
**Response if Fraud:**
- Implement physical counts
- Improve write-off documentation
- Add manager approval
- Review security camera footage

### Scenario 4: Velocity Attack
**Pattern:** 50+ transactions in 10 minutes, rapid refunds
**Investigation:** Check customer identity, payment fraud signals, automation detection
**Likely Cause:** Automated attack OR employee manipulation
**Response:**
- Block account immediately
- Reverse transactions
- Add rate limiting
- Enhance payment verification

### Scenario 5: Collusion
**Pattern:** Multiple employees enabling fraud (manager + cashier)
**Investigation:** Timeline analysis, transaction patterns, communication logs
**Likely Cause:** Organized internal fraud ring
**Response:**
- Terminate all involved parties
- Full audit of their transactions
- Law enforcement notification
- Implement segregation of duties

## Prevention Measures

### Preventive Controls to Implement

1. **Authorization Levels**
   - Refunds > $100 require manager approval
   - Discounts > 15% require manager approval
   - Write-offs > $500 require location manager approval
   - Multiple approvals for values > $1,000

2. **Monitoring**
   - Daily fraud risk score per employee
   - Weekly pattern analysis by location
   - Monthly peer benchmarking
   - Quarterly trend analysis

3. **Segregation of Duties**
   - Approval ≠ Execution
   - Different employees: cashier, manager, accountant
   - No single person should open/close register

4. **Audit Trail**
   - All exceptions logged
   - Video recording when possible
   - Signature trails for approvals
   - Timestamps on all actions

5. **Training**
   - Monthly fraud awareness training
   - Clear policy communication
   - Consequences education
   - Detection training for managers

## Reporting

### Daily Fraud Report

```
Date: 2026-06-24
Period: 24 hours

High-Risk Incidents: 2
- Incident #FC-001: Excessive refunds, $500
- Incident #FC-002: Inventory discrepancies, $200

Medium-Risk Incidents: 5
Low-Risk Incidents: 12

Total Risk Score: 3,250
Average Risk Score: 162.5

Actions Taken:
- 1 employee suspension pending investigation
- 2 policy violations documented
- 3 customers notified

Recovery Initiated: $1,200
Estimated Impact: $2,500
```

### Investigation Summary Report

```
Incident ID: FC-001
Employee: John Doe (EMP-123)
Severity: HIGH
Status: CONFIRMED

Period: 2026-06-20 to 2026-06-24
Transactions Reviewed: 247
Suspicious Transactions: 12
Total Impact: $500

Findings:
- 10 unauthorized refunds to personal card
- No corresponding returns or complaints
- Bypassed normal return process
- Manager unaware of transactions

Recommendation: TERMINATE + RECOVER FUNDS

Evidence:
- Transaction receipts
- Customer records
- Video footage
- Register audit logs
- Employee interview notes
```

## Legal & Compliance

### Documentation Requirements
- Written investigation report
- Evidence chain of custody
- Witness statements
- Legal review
- Disciplinary documentation

### Reporting Obligations
- Internal: Board/Executive summary
- Regulatory: Report if required by license
- Law Enforcement: Report if >$5,000 loss
- Insurance: Notify carrier immediately

### Data Retention
- Keep investigation files for 7 years
- Archive resolved incidents after 90 days
- Retain evidence per legal hold
- Destroy personal data per GDPR

import {
  ExecutiveRecommendation,
  type RecommendationCategory,
  type RecommendationPriority,
  type RecommendationSeverity,
  type RecommendationSource
} from "@/recommendation/domain/entities/executive-recommendation";
import type {
  RecommendationAlertFact,
  RecommendationDomainFact,
  RecommendationExplanationFact,
  RecommendationRuleContext
} from "@/recommendation/domain/services/recommendation-rule-context";

const HIGH_RISK_DOMAIN_SCORE = 65;
const MATERIAL_DOMAIN_DECLINE = -5;

export class RecommendationRuleEngine {
  generate(context: RecommendationRuleContext): ExecutiveRecommendation[] {
    return sortRecommendations(
      dedupeRecommendations([
        ...this.recommendCriticalAlertActions(context),
        ...this.recommendInventoryAudit(context),
        ...this.recommendRefundInvestigation(context),
        ...this.recommendKitchenStaffingReview(context),
        ...this.recommendCashReconciliation(context),
        ...this.recommendDeterioratingDomainActions(context)
      ])
    );
  }

  private recommendCriticalAlertActions(context: RecommendationRuleContext) {
    return context.alerts
      .filter((alert) => alert.severity === "critical" || alert.severity === "severe")
      .map(
        (alert) =>
          new ExecutiveRecommendation({
            id: buildRecommendationId("critical-alert", alert.id),
            priority: "CRITICAL",
            severity: alert.severity,
            category: categoryFromSignal(alert.domainCode, alert.title, alert.message, alert.source),
            title: `Review ${titleCase(alert.severity)} alert`,
            description: alert.title,
            businessImpact: alert.message,
            recommendedAction: "Assign an executive owner and confirm mitigation status.",
            confidence: alert.severity === "severe" ? 0.95 : 0.9,
            source: alert.source,
            createdAt: alert.occurredAt
          })
      );
  }

  private recommendInventoryAudit(context: RecommendationRuleContext) {
    const inventoryDomain = findDecliningDomain(context.domains, ["inventory", "stock"]);
    const wasteDomain = findDecliningDomain(context.domains, ["waste", "write off", "spoilage", "loss"]);

    if (!inventoryDomain || !wasteDomain) {
      return [];
    }

    return [
      new ExecutiveRecommendation({
        id: buildRecommendationId("inventory-audit", inventoryDomain.id, wasteDomain.id),
        priority: "HIGH",
        severity: "critical",
        category: "Inventory",
        title: "Run inventory variance audit",
        description: "Inventory and waste domains both deteriorated in the latest Control Score window.",
        businessImpact: "Margin leakage and stock accuracy risk may be increasing together.",
        recommendedAction: "Audit high-variance products, waste logs, write-offs, and receiving records.",
        confidence: 0.86,
        source: "domain_score",
        createdAt: latestDate(inventoryDomain.calculatedAt, wasteDomain.calculatedAt)
      })
    ];
  }

  private recommendRefundInvestigation(context: RecommendationRuleContext) {
    const refundFraudSignals = [
      ...context.explanations.filter(
        (explanation) =>
          hasSignal(explanation, ["refund"]) &&
          (hasSignal(explanation, ["fraud", "risk", "suspicious"]) ||
            explanation.driverType === "risk")
      ),
      ...context.alerts.filter(
        (alert) => hasSignal(alert, ["refund"]) && hasSignal(alert, ["fraud", "risk", "suspicious"])
      )
    ];

    if (refundFraudSignals.length === 0) {
      return [];
    }

    const primarySignal = refundFraudSignals[0];

    return [
      new ExecutiveRecommendation({
        id: buildRecommendationId("refund-investigation", signalId(primarySignal)),
        priority: "CRITICAL",
        severity: "critical",
        category: "Fraud",
        title: "Investigate refund fraud pattern",
        description: "Refund-related fraud or risk signal was returned by dashboard intelligence.",
        businessImpact: "Uncontrolled refunds can create direct revenue loss and cash variance exposure.",
        recommendedAction: "Review refund approvals, employee activity, order history, and manager overrides.",
        confidence: 0.9,
        source: signalSource(primarySignal),
        createdAt: signalDate(primarySignal)
      })
    ];
  }

  private recommendKitchenStaffingReview(context: RecommendationRuleContext) {
    const kitchenDelaySignals = [
      ...context.explanations.filter(
        (explanation) =>
          hasSignal(explanation, ["kitchen"]) &&
          hasSignal(explanation, ["delay", "wait", "prep", "ticket", "service time"])
      ),
      ...context.alerts.filter(
        (alert) =>
          hasSignal(alert, ["kitchen"]) &&
          hasSignal(alert, ["delay", "wait", "prep", "ticket", "service time"])
      )
    ];

    if (kitchenDelaySignals.length === 0) {
      return [];
    }

    const primarySignal = kitchenDelaySignals[0];

    return [
      new ExecutiveRecommendation({
        id: buildRecommendationId("kitchen-staffing-review", signalId(primarySignal)),
        priority: "HIGH",
        severity: "warning",
        category: "Kitchen",
        title: "Review kitchen staffing and throughput",
        description: "Kitchen delay signal was returned by dashboard intelligence.",
        businessImpact: "Longer prep or ticket times can reduce service quality and sales throughput.",
        recommendedAction: "Compare staffing coverage with rush periods and rebalance prep responsibilities.",
        confidence: 0.78,
        source: signalSource(primarySignal),
        createdAt: signalDate(primarySignal)
      })
    ];
  }

  private recommendCashReconciliation(context: RecommendationRuleContext) {
    const cashDomain = findDecliningDomain(context.domains, ["cash", "payment", "till"]);
    const cashSignals = context.explanations.filter(
      (explanation) =>
        hasSignal(explanation, ["cash", "till", "payment"]) &&
        (explanation.driverType === "negative" || explanation.driverType === "risk")
    );

    if (!cashDomain && cashSignals.length === 0) {
      return [];
    }

    const severity = cashDomain && (cashDomain.scoreChange ?? 0) <= -10 ? "critical" : "warning";
    const sourceId = cashDomain?.id ?? cashSignals[0]?.id ?? context.score.id;

    return [
      new ExecutiveRecommendation({
        id: buildRecommendationId("cash-reconciliation", sourceId),
        priority: severity === "critical" ? "HIGH" : "MEDIUM",
        severity,
        category: "Cash",
        title: "Perform cash reconciliation review",
        description: "Cash-related score or explanation signal deteriorated in dashboard intelligence.",
        businessImpact: "Cash variance may indicate process gaps, training issues, or control risk.",
        recommendedAction: "Reconcile tills, payments, refunds, discounts, and manager overrides.",
        confidence: cashDomain ? 0.82 : 0.72,
        source: cashDomain ? "domain_score" : "score_explanation",
        createdAt: cashDomain?.calculatedAt ?? cashSignals[0]?.createdAt ?? context.generatedAt
      })
    ];
  }

  private recommendDeterioratingDomainActions(context: RecommendationRuleContext) {
    return context.domains
      .filter(
        (domain) =>
          domain.scoreChange !== null &&
          domain.scoreChange <= MATERIAL_DOMAIN_DECLINE &&
          domain.score <= HIGH_RISK_DOMAIN_SCORE
      )
      .map((domain) => {
        const category = categoryFromSignal(domain.domainCode, domain.domainName);

        return new ExecutiveRecommendation({
          id: buildRecommendationId("domain-deterioration", domain.id),
          priority: domain.score <= 50 ? "HIGH" : "MEDIUM",
          severity: domain.score <= 50 ? "critical" : "warning",
          category,
          title: `Stabilize ${domain.domainName}`,
          description: `${domain.domainName} declined and is below the executive watch threshold.`,
          businessImpact: "Continued deterioration can reduce business health and increase control risk.",
          recommendedAction: actionForCategory(category),
          confidence: 0.7,
          source: "domain_score",
          createdAt: domain.calculatedAt
        });
      });
  }
}

export function sortRecommendations(recommendations: ExecutiveRecommendation[]) {
  return [...recommendations].sort((left, right) => {
    const priorityDifference = priorityRank(right.priority) - priorityRank(left.priority);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const severityDifference = severityRank(right.severity) - severityRank(left.severity);

    if (severityDifference !== 0) {
      return severityDifference;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

function dedupeRecommendations(recommendations: ExecutiveRecommendation[]) {
  const byId = new Map<string, ExecutiveRecommendation>();

  recommendations.forEach((recommendation) => {
    byId.set(recommendation.id, recommendation);
  });

  return [...byId.values()];
}

function findDecliningDomain(domains: RecommendationDomainFact[], keywords: string[]) {
  return domains.find(
    (domain) =>
      domain.scoreChange !== null &&
      domain.scoreChange < 0 &&
      includesAny(`${domain.domainCode} ${domain.domainName}`, keywords)
  );
}

function categoryFromSignal(
  domainCode: string | null | undefined,
  title = "",
  message = "",
  source?: RecommendationSource
): RecommendationCategory {
  const value = `${domainCode ?? ""} ${title} ${message}`;

  if (source === "fraud_alert" || includesAny(value, ["fraud", "refund", "suspicious"])) {
    return "Fraud";
  }

  if (includesAny(value, ["finance", "revenue", "profit", "margin"])) {
    return "Finance";
  }

  if (includesAny(value, ["kitchen", "prep", "ticket"])) {
    return "Kitchen";
  }

  if (includesAny(value, ["inventory", "stock"])) {
    return "Inventory";
  }

  if (includesAny(value, ["waste", "write off", "spoilage", "loss"])) {
    return "Waste";
  }

  if (includesAny(value, ["staff", "employee", "labor", "training"])) {
    return "Staff";
  }

  if (includesAny(value, ["cash", "till", "payment"])) {
    return "Cash";
  }

  if (includesAny(value, ["security", "access", "permission"])) {
    return "Security";
  }

  if (includesAny(value, ["compliance", "audit", "policy"])) {
    return "Compliance";
  }

  if (includesAny(value, ["performance", "efficiency", "speed", "delay"])) {
    return "Performance";
  }

  return "Operations";
}

function actionForCategory(category: RecommendationCategory) {
  const actions: Record<RecommendationCategory, string> = {
    Fraud: "Open a fraud investigation and review affected transactions.",
    Finance: "Review revenue, margin, discounts, refunds, and cost controls.",
    Kitchen: "Review kitchen throughput, staffing coverage, and prep bottlenecks.",
    Inventory: "Audit stock counts, receiving records, transfers, and write-offs.",
    Waste: "Review waste logs, spoilage reasons, and product handling controls.",
    Staff: "Review employee performance, training gaps, and shift coverage.",
    Cash: "Reconcile tills, payments, refunds, and cash handling exceptions.",
    Operations: "Review operating procedures and assign an owner for corrective action.",
    Security: "Review access permissions, suspicious activity, and control exceptions.",
    Compliance: "Review audit exceptions and document corrective action.",
    Performance: "Review performance bottlenecks and prioritize operational recovery."
  };

  return actions[category];
}

function hasSignal(
  signal: RecommendationExplanationFact | RecommendationAlertFact,
  keywords: string[]
) {
  return includesAny(signalText(signal), keywords);
}

function signalText(signal: RecommendationExplanationFact | RecommendationAlertFact) {
  if ("explanation" in signal) {
    return [
      signal.domainCode,
      signal.metricCode,
      signal.metricName,
      signal.driverType,
      signal.explanation
    ]
      .filter((value): value is string => typeof value === "string")
      .join(" ");
  }

  return [signal.domainCode, signal.metricCode, signal.title, signal.message, signal.resourceType]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

function signalId(signal: RecommendationExplanationFact | RecommendationAlertFact) {
  return signal.id;
}

function signalSource(signal: RecommendationExplanationFact | RecommendationAlertFact) {
  if ("explanation" in signal) {
    return "score_explanation" as const;
  }

  return signal.source;
}

function signalDate(signal: RecommendationExplanationFact | RecommendationAlertFact) {
  if ("createdAt" in signal) {
    return signal.createdAt;
  }

  return signal.occurredAt;
}

function includesAny(value: string, keywords: string[]) {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
}

function normalizeText(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").toLowerCase();
}

function buildRecommendationId(ruleCode: string, ...parts: string[]) {
  return `recommendation:${ruleCode}:${parts.map(toIdPart).join(":")}`;
}

function toIdPart(value: string) {
  return value.trim().replaceAll(":", "-");
}

function latestDate(left: Date, right: Date) {
  return left.getTime() >= right.getTime() ? left : right;
}

function priorityRank(priority: RecommendationPriority) {
  const rank: Record<RecommendationPriority, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  return rank[priority];
}

function severityRank(severity: RecommendationSeverity) {
  const rank: Record<RecommendationSeverity, number> = {
    information: 1,
    warning: 2,
    critical: 3,
    severe: 4
  };

  return rank[severity];
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

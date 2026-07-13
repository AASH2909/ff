import { describe, expect, it } from "vitest";
import {
  applyOperationalDemoAction,
  initialOperationalDemoState
} from "@/components/app/operational-demo-state";

describe("operational demo state", () => {
  it("starts with the connected operational warning state", () => {
    expect(initialOperationalDemoState).toMatchObject({
      controlScore: 64,
      inventoryVariance: "warning",
      kitchenLoad: "rush",
      shiftStatus: "active",
      recommendationStage: "active",
      dashboardAlertCount: 3,
      kitchenOrderCount: 11,
      inventoryAlertCount: 9,
      posQueueCount: 4
    });
  });

  it("completes the rebalance and updates its recommendation, score, and badges", () => {
    const next = applyOperationalDemoAction(initialOperationalDemoState, "complete-rebalance");

    expect(next).toMatchObject({
      recommendationStage: "completed",
      recommendationTitle: "Shift handoff is ready",
      recommendationCtaLabel: "Open inventory",
      shiftStatus: "completed",
      inventoryVariance: "healthy",
      kitchenLoad: "steady",
      controlScore: 72,
      dashboardAlertCount: 1,
      kitchenOrderCount: 4,
      inventoryAlertCount: 4,
      posQueueCount: 2
    });
  });

  it("carries shared state through inventory audit and refund review", () => {
    const rebalanced = applyOperationalDemoAction(initialOperationalDemoState, "complete-rebalance");
    const audited = applyOperationalDemoAction(rebalanced, "complete-inventory-audit");
    const reviewed = applyOperationalDemoAction(audited, "complete-refund-review");

    expect(audited).toMatchObject({
      controlScore: 74,
      shiftStatus: "reviewed",
      recommendationCtaLabel: "Open POS",
      inventoryAlertCount: 2,
      posQueueCount: 2
    });
    expect(reviewed).toMatchObject({
      controlScore: 76,
      recommendationTitle: "Service review is complete",
      recommendationCtaLabel: "Return to dashboard",
      kitchenOrderCount: 3,
      posQueueCount: 0
    });
  });

  it("keeps the exported initial state clean for a fresh provider reset", () => {
    applyOperationalDemoAction(initialOperationalDemoState, "complete-rebalance");

    expect(initialOperationalDemoState.controlScore).toBe(64);
    expect(initialOperationalDemoState.recommendationStage).toBe("active");
    expect(initialOperationalDemoState.posQueueCount).toBe(4);
  });
});

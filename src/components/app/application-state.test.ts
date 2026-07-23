import { describe, expect, it } from "vitest";
import {
  APPLICATION_STAGES,
  applicationStateReducer,
  createInitialApplicationState,
  initialApplicationState,
  selectDashboardState,
  selectInventoryState,
  selectKitchenState,
  selectNavigationBadges,
  selectOperationalProgress,
  selectPosState
} from "@/components/app/application-state";

describe("canonical operational application state", () => {
  it("has a deterministic immutable initial state with no session or authorization data", () => {
    expect(initialApplicationState).toEqual({ stage: "shift-rebalance" });
    expect(Object.isFrozen(initialApplicationState)).toBe(true);
    expect(Object.keys(initialApplicationState)).toEqual(["stage"]);
  });

  it("creates a fresh frozen initial value for every reset", () => {
    const first = createInitialApplicationState();
    const second = applicationStateReducer(
      { stage: "completed" },
      { type: "reset-demo" }
    );
    expect(first).toEqual(initialApplicationState);
    expect(second).toEqual(initialApplicationState);
    expect(first).not.toBe(initialApplicationState);
    expect(second).not.toBe(initialApplicationState);
    expect(first).not.toBe(second);
    expect(Object.isFrozen(second)).toBe(true);
  });

  it("advances only through the accepted journey and fails safely otherwise", () => {
    const inventory = applicationStateReducer(initialApplicationState, {
      type: "complete-shift-rebalance"
    });
    const refund = applicationStateReducer(inventory, {
      type: "complete-inventory-audit"
    });
    const completed = applicationStateReducer(refund, {
      type: "complete-refund-review"
    });

    expect(inventory.stage).toBe("inventory-audit");
    expect(refund.stage).toBe("refund-review");
    expect(completed.stage).toBe("completed");
    expect(
      applicationStateReducer(initialApplicationState, {
        type: "complete-refund-review"
      })
    ).toBe(initialApplicationState);
    expect(
      applicationStateReducer(completed, {
        type: "complete-refund-review"
      })
    ).toBe(completed);
  });

  it.each([
    ["shift-rebalance", 64, [3, 11, 9, 4], "/kitchen"],
    ["inventory-audit", 72, [1, 4, 4, 2], "/inventory"],
    ["refund-review", 74, [1, 4, 2, 2], "/pos"],
    ["completed", 76, [1, 3, 2, 0], "/dashboard"]
  ] as const)(
    "derives synchronized score, badges, and CTA for %s",
    (stage, score, counts, destination) => {
      const state = Object.freeze({ stage });
      const dashboard = selectDashboardState(state);
      const badges = selectNavigationBadges(state);
      expect(dashboard.controlScore).toBe(score);
      expect(dashboard.controlScoreDelta).toBe(score - 64);
      expect(dashboard.ctaDestination).toBe(destination);
      expect([
        badges.dashboardAlertCount,
        badges.kitchenOrderCount,
        badges.inventoryAlertCount,
        badges.posQueueCount
      ]).toEqual(counts);
    }
  );

  it.each(APPLICATION_STAGES)("derives every surface and progress consistently for %s", (stage) => {
    const state = Object.freeze({ stage });
    const snapshot = structuredClone(state);

    expect(selectDashboardState(state).missionKey).toMatch(/^demo\./);
    expect(selectDashboardState(state).recommendationTitleKey).toMatch(/^demo\./);
    expect(selectKitchenState(state).missionKey).toMatch(/^demo\./);
    expect(["warning", "healthy"]).toContain(
      selectInventoryState(state).inventoryVariance
    );
    expect(selectPosState(state).posQueueCount).toBeGreaterThanOrEqual(0);
    expect(selectOperationalProgress(state)).toHaveLength(3);
    expect(state).toEqual(snapshot);
  });

  it("marks completed, current, and pending progress stages without mutation", () => {
    expect(
      selectOperationalProgress({ stage: "refund-review" }).map(
        ({ id, status }) => [id, status]
      )
    ).toEqual([
      ["shift-rebalance", "completed"],
      ["inventory-audit", "completed"],
      ["refund-review", "current"]
    ]);
    expect(
      selectOperationalProgress({ stage: "completed" }).every(
        ({ status }) => status === "completed"
      )
    ).toBe(true);
  });
});

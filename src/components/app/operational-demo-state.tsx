"use client";

import * as React from "react";
import { StatusChip } from "@/components/design-system";

export type OperationalDemoRecommendationStage = "active" | "completed";
export type OperationalDemoVariance = "warning" | "healthy";
export type OperationalDemoLoad = "rush" | "steady";
export type OperationalDemoShiftStatus = "active" | "completed" | "reviewed";
export type OperationalDemoAction =
  | "complete-rebalance"
  | "complete-inventory-audit"
  | "complete-refund-review";

export type OperationalDemoState = {
  controlScore: number;
  inventoryVariance: OperationalDemoVariance;
  kitchenLoad: OperationalDemoLoad;
  shiftStatus: OperationalDemoShiftStatus;
  recommendationStage: OperationalDemoRecommendationStage;
  currentMission: string;
  openedFrom: string;
  helperText: string;
  recommendationTitle: string;
  recommendationDescription: string;
  recommendationCtaLabel: string;
  dashboardAlertCount: number;
  kitchenOrderCount: number;
  inventoryAlertCount: number;
  posQueueCount: number;
};

type OperationalDemoContextValue = {
  state: OperationalDemoState;
  completeAction: (action: OperationalDemoAction) => void;
};

export const initialOperationalDemoState: OperationalDemoState = {
  controlScore: 64,
  inventoryVariance: "warning",
  kitchenLoad: "rush",
  shiftStatus: "active",
  recommendationStage: "active",
  currentMission: "Rebalance the evening shift before 7:15 PM",
  openedFrom: "Inventory variance detected",
  helperText: "Inventory drift and staffing pressure are converging at the dinner peak.",
  recommendationTitle: "Rebalance the shift before 7:15 PM",
  recommendationDescription:
    "Move one cross-trained server to expo, verify grill protein counts, and hold high-value refunds for review until close.",
  recommendationCtaLabel: "Start shift rebalance",
  dashboardAlertCount: 3,
  kitchenOrderCount: 11,
  inventoryAlertCount: 9,
  posQueueCount: 4
};

const OperationalDemoContext = React.createContext<OperationalDemoContextValue | null>(null);

export function applyOperationalDemoAction(
  state: OperationalDemoState,
  action: OperationalDemoAction
): OperationalDemoState {
  switch (action) {
    case "complete-rebalance":
      return {
        ...state,
        controlScore: 72,
        inventoryVariance: "healthy",
        kitchenLoad: "steady",
        shiftStatus: "completed",
        recommendationStage: "completed",
        currentMission: "Complete the shift handoff and confirm inventory health",
        openedFrom: "Shift rebalance completed",
        helperText: "The line is now stable and the team is ready for the handoff.",
        recommendationTitle: "Shift handoff is ready",
        recommendationDescription:
          "The kitchen is steady and inventory is aligned. Review the next support task in inventory.",
        recommendationCtaLabel: "Open inventory",
        dashboardAlertCount: 1,
        kitchenOrderCount: 4,
        inventoryAlertCount: 4,
        posQueueCount: 2
      };
    case "complete-inventory-audit":
      return {
        ...state,
        controlScore: 74,
        inventoryVariance: "healthy",
        kitchenLoad: "steady",
        shiftStatus: "reviewed",
        recommendationStage: "completed",
        currentMission: "Confirm the refund queue and close the service review",
        openedFrom: "Inventory audit completed",
        helperText: "The watched ingredients are healthy and the refund queue is now manageable.",
        recommendationTitle: "Inventory is healthy",
        recommendationDescription:
          "The watched ingredients are stable. Open the checkout review to clear the refund queue.",
        recommendationCtaLabel: "Open POS",
        dashboardAlertCount: 1,
        kitchenOrderCount: 4,
        inventoryAlertCount: 2,
        posQueueCount: 2
      };
    case "complete-refund-review":
      return {
        ...state,
        controlScore: 76,
        inventoryVariance: "healthy",
        kitchenLoad: "steady",
        shiftStatus: "reviewed",
        recommendationStage: "completed",
        currentMission: "Close the service review and hand off the next shift",
        openedFrom: "Refund review completed",
        helperText: "Service review is complete and the next shift can start cleanly.",
        recommendationTitle: "Service review is complete",
        recommendationDescription:
          "The refund queue is clear and the team can return to the dashboard for the next move.",
        recommendationCtaLabel: "Return to dashboard",
        dashboardAlertCount: 1,
        kitchenOrderCount: 3,
        inventoryAlertCount: 2,
        posQueueCount: 0
      };
    default:
      return state;
  }
}

export function OperationalDemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<OperationalDemoState>(initialOperationalDemoState);

  const completeAction = React.useCallback((action: OperationalDemoAction) => {
    setState((currentState) => applyOperationalDemoAction(currentState, action));
  }, []);

  const value = React.useMemo<OperationalDemoContextValue>(() => ({ state, completeAction }), [state, completeAction]);

  return <OperationalDemoContext.Provider value={value}>{children}</OperationalDemoContext.Provider>;
}

export function useOperationalDemo() {
  const context = React.useContext(OperationalDemoContext);

  if (!context) {
    throw new Error("useOperationalDemo must be used within an OperationalDemoProvider");
  }

  return context;
}

export function OperationalContextBanner({
  detail,
  title,
  tone = "info",
  value
}: {
  detail?: string;
  title: string;
  tone?: "healthy" | "warning" | "critical" | "info";
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/80 p-3 shadow-apple-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
          {detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}
        </div>
        <StatusChip tone={tone} className="shrink-0">
          {tone === "healthy" ? "Healthy" : tone === "warning" ? "Warning" : tone === "critical" ? "Critical" : "Info"}
        </StatusChip>
      </div>
    </div>
  );
}

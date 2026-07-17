"use client";

import * as React from "react";
import { StatusChip } from "@/components/design-system";
import { t, translateKnownMessage } from "@/localization";
import { useLocale } from "@/components/app/locale-provider";

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
  currentMission: t("demo.initialMission"),
  openedFrom: t("demo.initialOpenedFrom"),
  helperText: t("demo.initialHelper"),
  recommendationTitle: t("demo.initialRecommendation"),
  recommendationDescription: t("demo.initialDescription"),
  recommendationCtaLabel: t("demo.startRebalance"),
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
        currentMission: t("demo.handoffMission"),
        openedFrom: t("demo.rebalanceCompleted"),
        helperText: t("demo.handoffHelper"),
        recommendationTitle: t("demo.handoffReady"),
        recommendationDescription: t("demo.handoffDescription"),
        recommendationCtaLabel: t("demo.openInventory"),
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
        currentMission: t("demo.refundMission"),
        openedFrom: t("demo.auditCompleted"),
        helperText: t("demo.auditHelper"),
        recommendationTitle: t("demo.inventoryHealthy"),
        recommendationDescription: t("demo.inventoryDescription"),
        recommendationCtaLabel: t("demo.openPos"),
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
        currentMission: t("demo.closeMission"),
        openedFrom: t("demo.refundCompleted"),
        helperText: t("demo.reviewHelper"),
        recommendationTitle: t("demo.reviewComplete"),
        recommendationDescription: t("demo.reviewDescription"),
        recommendationCtaLabel: t("demo.returnDashboard"),
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
  const { locale } = useLocale();

  if (!context) {
    throw new Error("useOperationalDemo must be used within an OperationalDemoProvider");
  }

  const localizedState = {
    ...context.state,
    currentMission: translateKnownMessage(context.state.currentMission),
    openedFrom: translateKnownMessage(context.state.openedFrom),
    helperText: translateKnownMessage(context.state.helperText),
    recommendationTitle: translateKnownMessage(context.state.recommendationTitle),
    recommendationDescription: translateKnownMessage(context.state.recommendationDescription),
    recommendationCtaLabel: translateKnownMessage(context.state.recommendationCtaLabel)
  };
  void locale;

  return { ...context, state: localizedState };
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
          {tone === "healthy" ? t("status.healthy") : tone === "warning" ? t("status.warning") : tone === "critical" ? t("status.critical") : t("status.info")}
        </StatusChip>
      </div>
    </div>
  );
}

import type { AppRoute } from "@/lib/auth/authorization";
import type { MessageKey } from "@/localization";

export const APPLICATION_STAGES = Object.freeze([
  "shift-rebalance",
  "inventory-audit",
  "refund-review",
  "completed"
] as const);

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export type ApplicationState = Readonly<{
  stage: ApplicationStage;
}>;

export type ApplicationStateAction =
  | Readonly<{ type: "complete-shift-rebalance" }>
  | Readonly<{ type: "complete-inventory-audit" }>
  | Readonly<{ type: "complete-refund-review" }>
  | Readonly<{ type: "reset-demo" }>;

export type ApplicationStateDispatch = (action: ApplicationStateAction) => void;

export type ApplicationStateContextValue = Readonly<{
  state: ApplicationState;
  dispatch: ApplicationStateDispatch;
}>;

export type OperationalProgressStatus = "completed" | "current" | "pending";

export type OperationalProgressItem = Readonly<{
  id: Exclude<ApplicationStage, "completed">;
  status: OperationalProgressStatus;
}>;

type OperationalSnapshot = Readonly<{
  controlScore: number;
  inventoryVariance: "warning" | "healthy";
  kitchenLoad: "rush" | "steady";
  shiftStatus: "active" | "completed" | "reviewed";
  recommendationStage: "active" | "completed";
  missionKey: MessageKey;
  openedFromKey: MessageKey;
  helperKey: MessageKey;
  recommendationTitleKey: MessageKey;
  recommendationDescriptionKey: MessageKey;
  recommendationCtaKey: MessageKey;
  ctaDestination: AppRoute;
  dashboardAlertCount: number;
  kitchenOrderCount: number;
  inventoryAlertCount: number;
  posQueueCount: number;
  resolvedAlerts: number;
  remainingWarnings: number;
}>;

const operationalSnapshots = Object.freeze({
  "shift-rebalance": Object.freeze({
    controlScore: 64,
    inventoryVariance: "warning",
    kitchenLoad: "rush",
    shiftStatus: "active",
    recommendationStage: "active",
    missionKey: "demo.initialMission",
    openedFromKey: "demo.initialOpenedFrom",
    helperKey: "demo.initialHelper",
    recommendationTitleKey: "demo.initialRecommendation",
    recommendationDescriptionKey: "demo.initialDescription",
    recommendationCtaKey: "demo.startRebalance",
    ctaDestination: "/kitchen",
    dashboardAlertCount: 3,
    kitchenOrderCount: 11,
    inventoryAlertCount: 9,
    posQueueCount: 4,
    resolvedAlerts: 0,
    remainingWarnings: 3
  }),
  "inventory-audit": Object.freeze({
    controlScore: 72,
    inventoryVariance: "healthy",
    kitchenLoad: "steady",
    shiftStatus: "completed",
    recommendationStage: "completed",
    missionKey: "demo.handoffMission",
    openedFromKey: "demo.rebalanceCompleted",
    helperKey: "demo.handoffHelper",
    recommendationTitleKey: "demo.handoffReady",
    recommendationDescriptionKey: "demo.handoffDescription",
    recommendationCtaKey: "demo.openInventory",
    ctaDestination: "/inventory",
    dashboardAlertCount: 1,
    kitchenOrderCount: 4,
    inventoryAlertCount: 4,
    posQueueCount: 2,
    resolvedAlerts: 2,
    remainingWarnings: 1
  }),
  "refund-review": Object.freeze({
    controlScore: 74,
    inventoryVariance: "healthy",
    kitchenLoad: "steady",
    shiftStatus: "reviewed",
    recommendationStage: "completed",
    missionKey: "demo.refundMission",
    openedFromKey: "demo.auditCompleted",
    helperKey: "demo.auditHelper",
    recommendationTitleKey: "demo.inventoryHealthy",
    recommendationDescriptionKey: "demo.inventoryDescription",
    recommendationCtaKey: "demo.openPos",
    ctaDestination: "/pos",
    dashboardAlertCount: 1,
    kitchenOrderCount: 4,
    inventoryAlertCount: 2,
    posQueueCount: 2,
    resolvedAlerts: 4,
    remainingWarnings: 1
  }),
  completed: Object.freeze({
    controlScore: 76,
    inventoryVariance: "healthy",
    kitchenLoad: "steady",
    shiftStatus: "completed",
    recommendationStage: "completed",
    missionKey: "demo.closeMission",
    openedFromKey: "demo.refundCompleted",
    helperKey: "demo.reviewHelper",
    recommendationTitleKey: "demo.reviewComplete",
    recommendationDescriptionKey: "demo.reviewDescription",
    recommendationCtaKey: "demo.returnDashboard",
    ctaDestination: "/dashboard",
    dashboardAlertCount: 1,
    kitchenOrderCount: 3,
    inventoryAlertCount: 2,
    posQueueCount: 0,
    resolvedAlerts: 6,
    remainingWarnings: 0
  })
} as const satisfies Record<ApplicationStage, OperationalSnapshot>);

export const initialApplicationState: ApplicationState = Object.freeze({
  stage: "shift-rebalance"
});

export function createInitialApplicationState(): ApplicationState {
  return Object.freeze({ ...initialApplicationState });
}

export function applicationStateReducer(
  state: ApplicationState,
  action: ApplicationStateAction
): ApplicationState {
  if (action.type === "reset-demo") return createInitialApplicationState();

  const nextStage =
    state.stage === "shift-rebalance" &&
    action.type === "complete-shift-rebalance"
      ? "inventory-audit"
      : state.stage === "inventory-audit" &&
          action.type === "complete-inventory-audit"
        ? "refund-review"
        : state.stage === "refund-review" &&
            action.type === "complete-refund-review"
          ? "completed"
          : null;

  return nextStage ? Object.freeze({ stage: nextStage }) : state;
}

export function selectOperationalSnapshot(state: ApplicationState) {
  return operationalSnapshots[state.stage];
}

export function selectDashboardState(state: ApplicationState) {
  const snapshot = selectOperationalSnapshot(state);
  return {
    stage: state.stage,
    controlScore: snapshot.controlScore,
    controlScoreDelta: snapshot.controlScore - 64,
    inventoryVariance: snapshot.inventoryVariance,
    recommendationStage: snapshot.recommendationStage,
    missionKey: snapshot.missionKey,
    helperKey: snapshot.helperKey,
    recommendationTitleKey: snapshot.recommendationTitleKey,
    recommendationDescriptionKey: snapshot.recommendationDescriptionKey,
    recommendationCtaKey: snapshot.recommendationCtaKey,
    ctaDestination: snapshot.ctaDestination,
    resolvedAlerts: snapshot.resolvedAlerts,
    remainingWarnings: snapshot.remainingWarnings
  } as const;
}

export function selectKitchenState(state: ApplicationState) {
  const snapshot = selectOperationalSnapshot(state);
  return {
    stage: state.stage,
    kitchenLoad: snapshot.kitchenLoad,
    inventoryVariance: snapshot.inventoryVariance,
    missionKey: snapshot.missionKey,
    openedFromKey: snapshot.openedFromKey,
    helperKey: snapshot.helperKey,
    kitchenOrderCount: snapshot.kitchenOrderCount
  } as const;
}

export function selectInventoryState(state: ApplicationState) {
  const snapshot = selectOperationalSnapshot(state);
  return {
    stage: state.stage,
    inventoryVariance: snapshot.inventoryVariance,
    missionKey: snapshot.missionKey,
    openedFromKey: snapshot.openedFromKey,
    helperKey: snapshot.helperKey,
    inventoryAlertCount: snapshot.inventoryAlertCount
  } as const;
}

export function selectPosState(state: ApplicationState) {
  const snapshot = selectOperationalSnapshot(state);
  return {
    stage: state.stage,
    shiftStatus: snapshot.shiftStatus,
    missionKey: snapshot.missionKey,
    openedFromKey: snapshot.openedFromKey,
    helperKey: snapshot.helperKey,
    posQueueCount: snapshot.posQueueCount
  } as const;
}

export function selectNavigationBadges(state: ApplicationState) {
  const snapshot = selectOperationalSnapshot(state);
  return {
    dashboardAlertCount: snapshot.dashboardAlertCount,
    kitchenOrderCount: snapshot.kitchenOrderCount,
    inventoryAlertCount: snapshot.inventoryAlertCount,
    posQueueCount: snapshot.posQueueCount
  } as const;
}

export function selectOperationalProgress(
  state: ApplicationState
): readonly OperationalProgressItem[] {
  const stages = APPLICATION_STAGES.slice(0, -1) as readonly Exclude<
    ApplicationStage,
    "completed"
  >[];
  const currentIndex =
    state.stage === "completed" ? stages.length : stages.indexOf(state.stage);

  return stages.map((id, index) =>
    Object.freeze({
      id,
      status:
        index < currentIndex
          ? "completed"
          : index === currentIndex
            ? "current"
            : "pending"
    })
  );
}

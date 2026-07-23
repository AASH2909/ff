"use client";

import * as React from "react";
import {
  applicationStateReducer,
  createInitialApplicationState,
  selectDashboardState,
  selectInventoryState,
  selectKitchenState,
  selectNavigationBadges,
  selectOperationalProgress,
  selectPosState,
  type ApplicationState,
  type ApplicationStateContextValue
} from "@/components/app/application-state";

const ApplicationStateContext =
  React.createContext<ApplicationStateContextValue | null>(null);

export function ApplicationStateProvider({
  children,
  initialState
}: {
  children: React.ReactNode;
  initialState?: ApplicationState;
}) {
  const [state, dispatch] = React.useReducer(
    applicationStateReducer,
    initialState ?? createInitialApplicationState()
  );

  return (
    <ApplicationStateContext.Provider value={{ state, dispatch }}>
      {children}
    </ApplicationStateContext.Provider>
  );
}

export function useApplicationState() {
  const context = React.useContext(ApplicationStateContext);
  if (!context) {
    throw new Error(
      "useApplicationState must be used within ApplicationStateProvider"
    );
  }
  return context;
}

export function useDashboardState() {
  return selectDashboardState(useApplicationState().state);
}

export function useKitchenState() {
  return selectKitchenState(useApplicationState().state);
}

export function useInventoryState() {
  return selectInventoryState(useApplicationState().state);
}

export function usePosState() {
  return selectPosState(useApplicationState().state);
}

export function useNavigationBadges() {
  return selectNavigationBadges(useApplicationState().state);
}

export function useOperationalProgress() {
  return selectOperationalProgress(useApplicationState().state);
}

export function useOperationalActions() {
  const { dispatch } = useApplicationState();
  return {
    completeShiftRebalance: () =>
      dispatch({ type: "complete-shift-rebalance" }),
    completeInventoryAudit: () =>
      dispatch({ type: "complete-inventory-audit" }),
    completeRefundReview: () =>
      dispatch({ type: "complete-refund-review" }),
    resetDemo: () => dispatch({ type: "reset-demo" })
  } as const;
}

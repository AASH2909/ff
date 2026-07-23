import { isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useContext: vi.fn(),
  useReducer: vi.fn()
}));

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useContext: mocks.useContext,
  useReducer: mocks.useReducer
}));

import {
  ApplicationStateProvider,
  useApplicationState,
  useDashboardState,
  useInventoryState,
  useKitchenState,
  useOperationalActions,
  useOperationalProgress,
  usePosState
} from "@/components/app/application-state-provider";
import {
  createInitialApplicationState,
  type ApplicationStateContextValue
} from "@/components/app/application-state";

describe("ApplicationStateProvider and focused hooks", () => {
  const dispatch = vi.fn();
  const context: ApplicationStateContextValue = {
    state: createInitialApplicationState(),
    dispatch
  };

  beforeEach(() => {
    dispatch.mockReset();
    mocks.useContext.mockReset();
    mocks.useReducer.mockReset();
  });

  it("provides deterministic initial state without reading session or locale", () => {
    mocks.useReducer.mockReturnValue([context.state, dispatch]);
    const result = ApplicationStateProvider({ children: "ROUTE", initialState: context.state });
    expect(isValidElement(result)).toBe(true);
    expect(result.props.value).toEqual(context);
  });

  it("returns context and fails clearly outside the provider", () => {
    mocks.useContext.mockReturnValue(context);
    expect(useApplicationState()).toBe(context);
    mocks.useContext.mockReturnValue(null);
    expect(() => useApplicationState()).toThrow(
      "useApplicationState must be used within ApplicationStateProvider"
    );
  });

  it("exposes focused presentation projections", () => {
    mocks.useContext.mockReturnValue(context);
    expect(useDashboardState()).toHaveProperty("controlScore", 64);
    expect(useKitchenState()).toHaveProperty("kitchenLoad", "rush");
    expect(useInventoryState()).toHaveProperty("inventoryVariance", "warning");
    expect(usePosState()).toHaveProperty("posQueueCount", 4);
    expect(useOperationalProgress()).toHaveLength(3);
  });

  it("dispatches only centralized operational actions and reset", () => {
    mocks.useContext.mockReturnValue(context);
    const actions = useOperationalActions();
    actions.completeShiftRebalance();
    actions.completeInventoryAudit();
    actions.completeRefundReview();
    actions.resetDemo();
    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      "complete-shift-rebalance",
      "complete-inventory-audit",
      "complete-refund-review",
      "reset-demo"
    ]);
  });
});

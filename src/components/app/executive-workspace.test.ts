import { describe, expect, it, vi } from "vitest";
import {
  EXECUTIVE_WORKSPACE_STORAGE_KEY,
  defaultExecutiveWorkspace,
  readExecutiveWorkspace,
  updateExecutiveWorkspace,
  writeExecutiveWorkspace
} from "@/components/app/executive-workspace";
import {
  applyOperationalDemoAction,
  initialOperationalDemoState
} from "@/components/app/operational-demo-state";
import { setActiveLocale, t } from "@/localization";

describe("executive workspace model", () => {
  it("provides an immutable default executive profile and dashboard preferences", () => {
    expect(defaultExecutiveWorkspace).toMatchObject({
      workspace: "demo-workspace",
      activeShift: "dinner",
      operationalMode: "monitoring",
      preferredDashboardScope: "demo",
      preferredLocale: "en",
      compactMode: false,
      notificationsEnabled: true
    });
    expect(Object.isFrozen(defaultExecutiveWorkspace)).toBe(true);
  });

  it("persists and reloads one validated workspace value", () => {
    const storage = createStorage();
    const updated = updateExecutiveWorkspace(defaultExecutiveWorkspace, {
      preferredDashboardScope: "restaurant"
    });

    writeExecutiveWorkspace(storage, updated);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      EXECUTIVE_WORKSPACE_STORAGE_KEY,
      JSON.stringify(updated)
    );
    expect(readExecutiveWorkspace(storage)).toEqual(updated);
  });

  it("falls back safely for missing, malformed, and invalid persisted values", () => {
    expect(readExecutiveWorkspace(undefined)).toBe(defaultExecutiveWorkspace);
    expect(readExecutiveWorkspace(createStorage("{"))).toBe(defaultExecutiveWorkspace);
    expect(
      readExecutiveWorkspace(createStorage(JSON.stringify({ workspace: 42 })))
    ).toBe(defaultExecutiveWorkspace);
  });

  it("updates without mutating the default or current model", () => {
    const current = structuredClone(defaultExecutiveWorkspace);
    const updated = updateExecutiveWorkspace(current, { compactMode: true });

    expect(updated).not.toBe(current);
    expect(current).toEqual(defaultExecutiveWorkspace);
    expect(defaultExecutiveWorkspace.compactMode).toBe(false);
  });

  it("does not alter locale, progressed operational state, or reset defaults", () => {
    setActiveLocale("ru");
    const localizedBefore = t("nav.dashboard");
    const progressed = applyOperationalDemoAction(
      initialOperationalDemoState,
      "complete-rebalance"
    );
    const snapshot = structuredClone(progressed);

    updateExecutiveWorkspace(defaultExecutiveWorkspace, {
      preferredLocale: "en",
      compactMode: true
    });

    expect(t("nav.dashboard")).toBe(localizedBefore);
    expect(progressed).toEqual(snapshot);
    expect(initialOperationalDemoState.controlScore).toBe(64);
    setActiveLocale("en");
  });
});

function createStorage(initialValue: string | null = null) {
  let value = initialValue;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, nextValue: string) => {
      value = nextValue;
    })
  };
}

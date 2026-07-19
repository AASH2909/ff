import { describe, expect, it } from "vitest";
import {
  defaultCurrentUser,
  resolveDemoCurrentUser
} from "@/components/app/current-authorization";
import { applyOperationalDemoAction, initialOperationalDemoState } from "@/components/app/operational-demo-state";
import { setActiveLocale, t } from "@/localization";

describe("current authorization resolution", () => {
  it("isolates the Maya Chen demo identity with the executive role", () => {
    expect(defaultCurrentUser).toEqual({
      id: "demo-maya-chen",
      displayName: "Maya Chen",
      role: "operations-executive"
    });
    expect(Object.isFrozen(defaultCurrentUser)).toBe(true);
    expect(resolveDemoCurrentUser()).toBe(defaultCurrentUser);
  });

  it("preserves role and progressed demo state across locale changes", () => {
    const user = resolveDemoCurrentUser();
    const progressed = applyOperationalDemoAction(
      initialOperationalDemoState,
      "complete-rebalance"
    );
    const snapshot = structuredClone(progressed);

    setActiveLocale("ru");
    expect(user.role).toBe("operations-executive");
    expect(t("auth.role.operationsExecutive")).toBe("Операционный руководитель");
    setActiveLocale("en");

    expect(user).toBe(resolveDemoCurrentUser());
    expect(progressed).toEqual(snapshot);
  });
});

import { describe, expect, it } from "vitest";
import {
  createAuthorizedNavigation,
  isNavigationItemActive
} from "@/components/app/authorized-navigation";
import type { NavigationBadgeKey } from "@/lib/auth/authorization";

const badges = {
  dashboardAlertCount: 3,
  posQueueCount: 4,
  kitchenOrderCount: 11,
  inventoryAlertCount: 9
} satisfies Readonly<Record<NavigationBadgeKey, number>>;

describe("authorized navigation presentation", () => {
  it("shows only permitted destinations and keeps their synchronized badges", () => {
    expect(
      createAuthorizedNavigation("cashier", badges).map(({ id, badgeCount }) => ({
        id,
        badgeCount
      }))
    ).toEqual([
      { id: "pos", badgeCount: 4 },
      { id: "inventory", badgeCount: 9 }
    ]);
    expect(
      createAuthorizedNavigation("kitchen-manager", badges).map(({ id }) => id)
    ).toEqual(["dashboard", "kitchen", "inventory"]);
  });

  it("omits restricted destinations rather than disabling them", () => {
    const cashier = createAuthorizedNavigation("cashier", badges);
    expect(cashier.some(({ id }) => id === "settings")).toBe(false);
    expect(cashier.some(({ id }) => id === "kitchen")).toBe(false);
  });

  it("keeps exact and nested routes highlighted", () => {
    expect(isNavigationItemActive("/inventory", "/inventory")).toBe(true);
    expect(isNavigationItemActive("/inventory/audit", "/inventory")).toBe(true);
    expect(isNavigationItemActive("/pos", "/inventory")).toBe(false);
  });
});

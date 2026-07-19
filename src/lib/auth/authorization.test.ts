import { describe, expect, it } from "vitest";
import {
  APP_ROUTE_POLICIES,
  NAVIGATION_POLICIES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  SUPPORTED_ROLES,
  canAccessRoute,
  getDefaultRouteForRole,
  getNavigationForRole,
  getRouteAccessDecision,
  hasAnyPermission,
  hasPermission,
  resolveProductRoleFromLegacySlug,
  type Permission,
  type UserRole
} from "@/lib/auth/authorization";
import { PROTECTED_ROUTES } from "@/lib/auth/routes";

const routes = ["/dashboard", "/pos", "/kitchen", "/inventory", "/settings"] as const;

describe("authorization policy", () => {
  it("defines a valid immutable configuration for every supported role", () => {
    expect(SUPPORTED_ROLES).toEqual([
      "operations-executive",
      "restaurant-manager",
      "kitchen-manager",
      "cashier",
      "administrator"
    ]);
    for (const role of SUPPORTED_ROLES) {
      expect(ROLE_PERMISSIONS[role].length, role).toBeGreaterThan(0);
      expect(getDefaultRouteForRole(role), role).toMatch(
        /^\/(dashboard|pos|kitchen|settings)$/
      );
      expect(Object.isFrozen(ROLE_PERMISSIONS[role]), role).toBe(true);
    }
  });

  it("uses only catalogued permissions without duplicates", () => {
    const catalog = new Set<Permission>(PERMISSIONS);
    for (const role of SUPPORTED_ROLES) {
      expect(new Set(ROLE_PERMISSIONS[role]).size, role).toBe(
        ROLE_PERMISSIONS[role].length
      );
      for (const permission of ROLE_PERMISSIONS[role]) {
        expect(catalog.has(permission), `${role}:${permission}`).toBe(true);
      }
    }
  });

  it("grants the executive full intended product and demo access", () => {
    for (const route of routes) {
      expect(canAccessRoute("operations-executive", route), route).toBe(true);
    }
    expect(hasPermission("operations-executive", "operational-demo:advance")).toBe(true);
    expect(hasPermission("operations-executive", "operational-demo:reset")).toBe(true);
  });

  it("applies the conservative cashier policy", () => {
    expect(canAccessRoute("cashier", "/pos")).toBe(true);
    expect(hasPermission("cashier", "pos:operate")).toBe(true);
    expect(canAccessRoute("cashier", "/inventory")).toBe(true);
    expect(hasPermission("cashier", "inventory:audit")).toBe(false);
    expect(canAccessRoute("cashier", "/dashboard")).toBe(false);
    expect(canAccessRoute("cashier", "/kitchen")).toBe(false);
    expect(canAccessRoute("cashier", "/settings")).toBe(false);
  });

  it("applies the kitchen manager policy", () => {
    expect(canAccessRoute("kitchen-manager", "/dashboard")).toBe(true);
    expect(canAccessRoute("kitchen-manager", "/kitchen")).toBe(true);
    expect(canAccessRoute("kitchen-manager", "/inventory")).toBe(true);
    expect(hasPermission("kitchen-manager", "inventory:audit")).toBe(true);
    expect(canAccessRoute("kitchen-manager", "/pos")).toBe(false);
    expect(canAccessRoute("kitchen-manager", "/settings")).toBe(false);
  });

  it("allows restaurant operations but denies restricted administration", () => {
    for (const route of ["/dashboard", "/pos", "/kitchen", "/inventory"]) {
      expect(canAccessRoute("restaurant-manager", route), route).toBe(true);
    }
    expect(canAccessRoute("restaurant-manager", "/settings")).toBe(false);
  });

  it("allows administrators to manage settings, team, and security", () => {
    expect(canAccessRoute("administrator", "/settings")).toBe(true);
    expect(hasPermission("administrator", "settings:manage")).toBe(true);
    expect(hasPermission("administrator", "team:manage")).toBe(true);
    expect(hasPermission("administrator", "security:manage")).toBe(true);
  });

  it("separates demo advancement and reset from route visibility", () => {
    expect(hasPermission("cashier", "operational-demo:advance")).toBe(true);
    expect(hasPermission("cashier", "operational-demo:reset")).toBe(false);
    expect(hasPermission("kitchen-manager", "kitchen:operate")).toBe(true);
    expect(hasPermission("kitchen-manager", "inventory:audit")).toBe(true);
    expect(hasPermission("kitchen-manager", "operational-demo:reset")).toBe(false);
    expect(hasPermission("restaurant-manager", "operational-demo:advance")).toBe(true);
    expect(hasPermission("restaurant-manager", "operational-demo:reset")).toBe(false);
    expect(hasPermission("operations-executive", "operational-demo:reset")).toBe(true);
    expect(hasPermission("administrator", "operational-demo:reset")).toBe(true);
  });

  it("fails closed for unknown or missing roles and permissions", () => {
    expect(canAccessRoute("unknown", "/dashboard")).toBe(false);
    expect(canAccessRoute(undefined, "/dashboard")).toBe(false);
    expect(hasPermission("unknown", "dashboard:view")).toBe(false);
    expect(hasAnyPermission(undefined, ["pos:view", "dashboard:view"])).toBe(false);
    expect(getNavigationForRole("unknown")).toEqual([]);
    expect(getDefaultRouteForRole("unknown")).toBe("/unauthorized");
  });

  it("returns correct access for every role and protected route", () => {
    const expected: Record<UserRole, readonly boolean[]> = {
      "operations-executive": [true, true, true, true, true],
      "restaurant-manager": [true, true, true, true, false],
      "kitchen-manager": [true, false, true, true, false],
      cashier: [false, true, false, true, false],
      administrator: [true, true, true, true, true]
    };

    for (const role of SUPPORTED_ROLES) {
      expect(routes.map((route) => canAccessRoute(role, route)), role).toEqual(
        expected[role]
      );
    }
  });

  it("derives navigation from the route policy and prevents duplicate definitions", () => {
    expect(new Set(APP_ROUTE_POLICIES.map(({ path }) => path)).size).toBe(
      APP_ROUTE_POLICIES.length
    );
    expect(new Set(NAVIGATION_POLICIES.map(({ id }) => id)).size).toBe(
      NAVIGATION_POLICIES.length
    );
    expect(new Set(NAVIGATION_POLICIES.map(({ path }) => path)).size).toBe(
      NAVIGATION_POLICIES.length
    );
    for (const role of SUPPORTED_ROLES) {
      for (const item of getNavigationForRole(role)) {
        expect(canAccessRoute(role, item.path), `${role}:${item.path}`).toBe(true);
      }
    }
  });

  it("does not mutate role grants during repeated checks", () => {
    const before = structuredClone(ROLE_PERMISSIONS);
    hasPermission("cashier", "pos:view");
    hasAnyPermission("administrator", ["settings:view", "security:manage"]);
    canAccessRoute("kitchen-manager", "/inventory");
    expect(ROLE_PERMISSIONS).toEqual(before);
  });

  it("defines deliberate default routes and legacy Supabase role mapping", () => {
    expect(getDefaultRouteForRole("operations-executive")).toBe("/dashboard");
    expect(getDefaultRouteForRole("restaurant-manager")).toBe("/dashboard");
    expect(getDefaultRouteForRole("kitchen-manager")).toBe("/kitchen");
    expect(getDefaultRouteForRole("cashier")).toBe("/pos");
    expect(getDefaultRouteForRole("administrator")).toBe("/settings");
    expect(resolveProductRoleFromLegacySlug("owner")).toBe("operations-executive");
    expect(resolveProductRoleFromLegacySlug("admin")).toBe("administrator");
    expect(resolveProductRoleFromLegacySlug("cook")).toBe("kitchen-manager");
    expect(resolveProductRoleFromLegacySlug("cashier")).toBe("cashier");
    expect(resolveProductRoleFromLegacySlug("unknown")).toBeNull();
  });

  it("denies direct forbidden routes without loops and preserves allowed refreshes", () => {
    expect(getRouteAccessDecision("cashier", "/settings")).toEqual({
      allowed: false,
      redirectTo: "/pos"
    });
    expect(getRouteAccessDecision("kitchen-manager", "/settings")).toEqual({
      allowed: false,
      redirectTo: "/kitchen"
    });
    expect(getRouteAccessDecision("cashier", "/pos")).toEqual({
      allowed: true,
      redirectTo: null
    });
    expect(getRouteAccessDecision("unknown", "/settings")).toEqual({
      allowed: false,
      redirectTo: "/unauthorized"
    });
    for (const role of SUPPORTED_ROLES) {
      const defaultRoute = getDefaultRouteForRole(role);
      expect(canAccessRoute(role, defaultRoute), role).toBe(true);
    }
  });

  it("gives every current product route one explicit middleware policy", () => {
    for (const route of routes) {
      const policies = PROTECTED_ROUTES.filter(({ path }) => path === route);
      expect(policies, route).toHaveLength(1);
      for (const role of SUPPORTED_ROLES) {
        expect((policies[0]?.roles as readonly UserRole[]).includes(role), `${route}:${role}`).toBe(
          canAccessRoute(role, route)
        );
      }
    }
  });
});

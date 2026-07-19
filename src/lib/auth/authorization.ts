import type { MessageKey } from "@/localization";

export const SUPPORTED_ROLES = Object.freeze([
  "operations-executive",
  "restaurant-manager",
  "kitchen-manager",
  "cashier",
  "administrator"
] as const);

export type UserRole = (typeof SUPPORTED_ROLES)[number];

export const PERMISSIONS = Object.freeze([
  "dashboard:view",
  "pos:view",
  "pos:operate",
  "kitchen:view",
  "kitchen:operate",
  "inventory:view",
  "inventory:audit",
  "settings:view",
  "settings:manage",
  "team:view",
  "team:manage",
  "security:view",
  "security:manage",
  "operational-demo:advance",
  "operational-demo:reset"
] as const);

export type Permission = (typeof PERMISSIONS)[number];

const executivePermissions = Object.freeze([...PERMISSIONS]);

export const ROLE_PERMISSIONS = Object.freeze({
  "operations-executive": executivePermissions,
  "restaurant-manager": Object.freeze([
    "dashboard:view",
    "pos:view",
    "pos:operate",
    "kitchen:view",
    "kitchen:operate",
    "inventory:view",
    "inventory:audit",
    "operational-demo:advance"
  ]),
  "kitchen-manager": Object.freeze([
    "dashboard:view",
    "kitchen:view",
    "kitchen:operate",
    "inventory:view",
    "inventory:audit",
    "operational-demo:advance"
  ]),
  cashier: Object.freeze([
    "pos:view",
    "pos:operate",
    "inventory:view",
    "operational-demo:advance"
  ]),
  administrator: executivePermissions
} as const satisfies Record<UserRole, readonly Permission[]>);

export type AppRoute = "/dashboard" | "/pos" | "/kitchen" | "/inventory" | "/settings";
export type NavigationId = "dashboard" | "pos" | "kitchen" | "inventory" | "settings";
export type NavigationBadgeKey =
  | "dashboardAlertCount"
  | "posQueueCount"
  | "kitchenOrderCount"
  | "inventoryAlertCount";

export type AppRoutePolicy = Readonly<{
  id: NavigationId;
  path: AppRoute;
  permission: Permission;
  labelKey: MessageKey;
  badgeKey: NavigationBadgeKey | null;
}>;

export const APP_ROUTE_POLICIES = Object.freeze([
  {
    id: "dashboard",
    path: "/dashboard",
    permission: "dashboard:view",
    labelKey: "nav.dashboard",
    badgeKey: "dashboardAlertCount"
  },
  {
    id: "pos",
    path: "/pos",
    permission: "pos:view",
    labelKey: "nav.pos",
    badgeKey: "posQueueCount"
  },
  {
    id: "kitchen",
    path: "/kitchen",
    permission: "kitchen:view",
    labelKey: "nav.kitchen",
    badgeKey: "kitchenOrderCount"
  },
  {
    id: "inventory",
    path: "/inventory",
    permission: "inventory:view",
    labelKey: "nav.inventory",
    badgeKey: "inventoryAlertCount"
  },
  {
    id: "settings",
    path: "/settings",
    permission: "settings:view",
    labelKey: "nav.settings",
    badgeKey: null
  }
] as const satisfies readonly AppRoutePolicy[]);

export const NAVIGATION_POLICIES = APP_ROUTE_POLICIES;

const defaultRouteByRole = Object.freeze({
  "operations-executive": "/dashboard",
  "restaurant-manager": "/dashboard",
  "kitchen-manager": "/kitchen",
  cashier: "/pos",
  administrator: "/settings"
} as const satisfies Record<UserRole, AppRoute>);

const roleLabelKeyByRole = Object.freeze({
  "operations-executive": "auth.role.operationsExecutive",
  "restaurant-manager": "auth.role.restaurantManager",
  "kitchen-manager": "auth.role.kitchenManager",
  cashier: "auth.role.cashier",
  administrator: "auth.role.administrator"
} as const satisfies Record<UserRole, MessageKey>);

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (SUPPORTED_ROLES as readonly string[]).includes(value)
  );
}

export function hasPermission(
  role: unknown,
  permission: Permission
): boolean {
  return (
    isUserRole(role) &&
    (ROLE_PERMISSIONS[role] as readonly Permission[]).includes(permission)
  );
}

export function hasAnyPermission(
  role: unknown,
  permissions: readonly Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function canAccessRoute(role: unknown, pathname: string): boolean {
  if (!isUserRole(role)) return false;
  const policy = getAppRoutePolicy(pathname);
  return policy ? hasPermission(role, policy.permission) : false;
}

export function getAppRoutePolicy(pathname: string) {
  return APP_ROUTE_POLICIES.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function getDefaultRouteForRole(role: unknown): AppRoute | "/unauthorized" {
  return isUserRole(role) ? defaultRouteByRole[role] : "/unauthorized";
}

export function getRoleLabelKey(role: UserRole): MessageKey {
  return roleLabelKeyByRole[role];
}

export function getNavigationForRole(role: unknown): readonly AppRoutePolicy[] {
  if (!isUserRole(role)) return [];
  return NAVIGATION_POLICIES.filter(({ permission }) =>
    hasPermission(role, permission)
  );
}

export function getRouteAccessDecision(role: unknown, pathname: string) {
  const allowed = canAccessRoute(role, pathname);
  return {
    allowed,
    redirectTo: allowed ? null : getDefaultRouteForRole(role)
  } as const;
}

export function getPrimaryRole(roles: readonly UserRole[]): UserRole | null {
  const priority: readonly UserRole[] = [
    "operations-executive",
    "administrator",
    "restaurant-manager",
    "kitchen-manager",
    "cashier"
  ];
  return priority.find((role) => roles.includes(role)) ?? null;
}

export function resolveProductRoleFromLegacySlug(slug: string): UserRole | null {
  const normalized = slug.trim().toLowerCase();
  const roleBySlug: Readonly<Record<string, UserRole>> = {
    owner: "operations-executive",
    "operations-executive": "operations-executive",
    admin: "administrator",
    administrator: "administrator",
    "restaurant-manager": "restaurant-manager",
    cook: "kitchen-manager",
    "kitchen-manager": "kitchen-manager",
    cashier: "cashier"
  };
  return roleBySlug[normalized] ?? null;
}

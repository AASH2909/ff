import { ROLES, type Role } from "@/lib/auth/roles";

export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

export const PROTECTED_ROUTES = [
  {
    path: "/dashboard",
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER, ROLES.COOK]
  },
  {
    path: "/admin",
    roles: [ROLES.OWNER, ROLES.ADMIN]
  },
  {
    path: "/owner",
    roles: [ROLES.OWNER]
  },
  {
    path: "/pos",
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER]
  },
  {
    path: "/kitchen",
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.COOK]
  },
  {
    path: "/inventory",
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.COOK]
  },
  {
    path: "/settings",
    roles: [ROLES.OWNER, ROLES.ADMIN]
  }
] as const satisfies ReadonlyArray<{
  path: string;
  roles: readonly Role[];
}>;

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function getProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
}

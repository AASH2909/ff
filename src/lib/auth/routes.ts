import {
  APP_ROUTE_POLICIES,
  SUPPORTED_ROLES,
  canAccessRoute,
  type UserRole
} from "@/lib/auth/authorization";

export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

const nonProductProtectedRoutes = [
  {
    path: "/api/v1/dashboard",
    roles: ["operations-executive", "administrator"]
  },
  {
    path: "/admin",
    roles: ["operations-executive", "administrator"]
  },
  {
    path: "/owner",
    roles: ["operations-executive"]
  }
] as const satisfies ReadonlyArray<{
  path: string;
  roles: readonly UserRole[];
}>;

const productProtectedRoutes = APP_ROUTE_POLICIES.map(({ path }) => ({
  path,
  roles: SUPPORTED_ROLES.filter((role) => canAccessRoute(role, path))
}));

export const PROTECTED_ROUTES = Object.freeze([
  ...nonProductProtectedRoutes,
  ...productProtectedRoutes
]);

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.find(
    (route) =>
      pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
}

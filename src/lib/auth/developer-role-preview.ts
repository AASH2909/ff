import {
  SUPPORTED_ROLES,
  canAccessRoute,
  getDefaultRouteForRole,
  isUserRole,
  type UserRole
} from "@/lib/auth/authorization";

export const DEVELOPER_ROLE_PREVIEW_COOKIE = "controlos.dev.preview-role";

export type RuntimeMode = "development" | "production" | "test";

export type EffectiveRoleResolution = Readonly<{
  authenticatedRole: UserRole;
  effectiveRole: UserRole;
  previewRole: UserRole | null;
}>;

export function isDeveloperRolePreviewEnabled(
  runtime: RuntimeMode = process.env.NODE_ENV
) {
  return runtime === "development";
}

export function getDeveloperRolePreviewOptions() {
  return SUPPORTED_ROLES;
}

export function resolveEffectiveRole(
  authenticatedRole: UserRole,
  previewValue: unknown,
  runtime: RuntimeMode = process.env.NODE_ENV
): EffectiveRoleResolution {
  const previewRole =
    isDeveloperRolePreviewEnabled(runtime) && isUserRole(previewValue)
      ? previewValue
      : null;

  return Object.freeze({
    authenticatedRole,
    effectiveRole: previewRole ?? authenticatedRole,
    previewRole
  });
}

export function resolvePreviewNavigation(role: UserRole, pathname: string) {
  return canAccessRoute(role, pathname)
    ? pathname
    : getDefaultRouteForRole(role);
}

export function createDeveloperRolePreviewCookie(role: UserRole | null) {
  const value = role ?? "";
  const maxAge = role ? 60 * 60 * 24 * 30 : 0;
  return `${DEVELOPER_ROLE_PREVIEW_COOKIE}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

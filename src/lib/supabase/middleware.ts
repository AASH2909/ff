import { type NextRequest, NextResponse } from "next/server";
import { getProtectedRoute, isAuthRoute } from "@/lib/auth/routes";
import { hasAllowedRole } from "@/lib/auth/roles";
import {
  getDefaultRouteForRole,
  getPrimaryRole
} from "@/lib/auth/authorization";
import {
  DEVELOPER_ROLE_PREVIEW_COOKIE,
  isDeveloperRolePreviewEnabled,
  resolveEffectiveRole
} from "@/lib/auth/developer-role-preview";
import { defaultCurrentUser } from "@/lib/auth/current-user";
import { createMiddlewareRepositories } from "@/repositories/middleware";

const LOGIN_PATH = "/login";
const UNAUTHORIZED_PATH = "/unauthorized";

function redirect(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const middlewareRepositories = createMiddlewareRepositories(request);
  const pathname = request.nextUrl.pathname;
  const protectedRoute = getProtectedRoute(pathname);

  if (!middlewareRepositories.repositories) {
    if (!isDeveloperRolePreviewEnabled()) {
      return middlewareRepositories.response;
    }
    const { effectiveRole } = resolveEffectiveRole(
      defaultCurrentUser.role,
      request.cookies.get(DEVELOPER_ROLE_PREVIEW_COOKIE)?.value
    );
    if (isAuthRoute(pathname)) {
      return redirect(request, getDefaultRouteForRole(effectiveRole));
    }
    if (
      protectedRoute &&
      !hasAllowedRole([effectiveRole], protectedRoute.roles)
    ) {
      const defaultRoute = getDefaultRouteForRole(effectiveRole);
      return redirect(
        request,
        defaultRoute === pathname ? UNAUTHORIZED_PATH : defaultRoute
      );
    }
    return middlewareRepositories.response;
  }

  const { authRepository, userRoleRepository } = middlewareRepositories.repositories;
  const user = await authRepository.getCurrentUser();

  if (!user && protectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute(pathname)) {
    const roles = await userRoleRepository.getRolesForUser(user.id);
    const primaryRole = getPrimaryRole(roles);
    if (!primaryRole) return redirect(request, UNAUTHORIZED_PATH);
    const { effectiveRole } = resolveEffectiveRole(
      primaryRole,
      request.cookies.get(DEVELOPER_ROLE_PREVIEW_COOKIE)?.value
    );
    return redirect(request, getDefaultRouteForRole(effectiveRole));
  }

  if (!user || !protectedRoute) {
    return middlewareRepositories.response;
  }

  const userRoles = await userRoleRepository.getRolesForUser(user.id);
  const primaryRole = getPrimaryRole(userRoles);
  if (!primaryRole) return redirect(request, UNAUTHORIZED_PATH);
  const { effectiveRole } = resolveEffectiveRole(
    primaryRole,
    request.cookies.get(DEVELOPER_ROLE_PREVIEW_COOKIE)?.value
  );

  if (!hasAllowedRole([effectiveRole], protectedRoute.roles)) {
    const defaultRoute = getDefaultRouteForRole(effectiveRole);
    return redirect(
      request,
      defaultRoute === pathname ? UNAUTHORIZED_PATH : defaultRoute
    );
  }

  return middlewareRepositories.response;
}

import { type NextRequest, NextResponse } from "next/server";
import { getProtectedRoute, isAuthRoute } from "@/lib/auth/routes";
import { hasAllowedRole } from "@/lib/auth/roles";
import {
  getDefaultRouteForRole,
  getPrimaryRole
} from "@/lib/auth/authorization";
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

  if (!middlewareRepositories.repositories) {
    return middlewareRepositories.response;
  }

  const { authRepository, userRoleRepository } = middlewareRepositories.repositories;
  const user = await authRepository.getCurrentUser();

  const pathname = request.nextUrl.pathname;
  const protectedRoute = getProtectedRoute(pathname);

  if (!user && protectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute(pathname)) {
    const roles = await userRoleRepository.getRolesForUser(user.id);
    const primaryRole = getPrimaryRole(roles);
    return redirect(request, getDefaultRouteForRole(primaryRole));
  }

  if (!user || !protectedRoute) {
    return middlewareRepositories.response;
  }

  const userRoles = await userRoleRepository.getRolesForUser(user.id);

  if (!hasAllowedRole(userRoles, protectedRoute.roles)) {
    const primaryRole = getPrimaryRole(userRoles);
    const defaultRoute = getDefaultRouteForRole(primaryRole);
    return redirect(
      request,
      defaultRoute === pathname ? UNAUTHORIZED_PATH : defaultRoute
    );
  }

  return middlewareRepositories.response;
}

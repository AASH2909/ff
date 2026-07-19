import { NextResponse, type NextRequest } from "next/server";
import { createServerRepositories } from "@/repositories/server";
import {
  getDefaultRouteForRole,
  getPrimaryRole
} from "@/lib/auth/authorization";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  let redirectPath =
    next?.startsWith("/") && !next.startsWith("//") ? next : null;

  if (code) {
    const { authRepository, userRoleRepository } =
      await createServerRepositories();
    await authRepository.exchangeCodeForSession(code);
    if (!redirectPath) {
      const user = await authRepository.getCurrentUser();
      const roles = user
        ? await userRoleRepository.getRolesForUser(user.id)
        : [];
      redirectPath = getDefaultRouteForRole(getPrimaryRole(roles));
    }
  }

  return NextResponse.redirect(
    new URL(redirectPath ?? "/unauthorized", requestUrl.origin)
  );
}

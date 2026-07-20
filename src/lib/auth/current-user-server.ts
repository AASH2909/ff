import {
  getPrimaryRole
} from "@/lib/auth/authorization";
import { cookies } from "next/headers";
import {
  defaultCurrentUser,
  type CurrentUser
} from "@/lib/auth/current-user";
import {
  DEVELOPER_ROLE_PREVIEW_COOKIE,
  resolveEffectiveRole
} from "@/lib/auth/developer-role-preview";
import { createServerRepositories } from "@/repositories/server";

export async function resolveCurrentAuthorizationUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const previewValue = cookieStore.get(DEVELOPER_ROLE_PREVIEW_COOKIE)?.value;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const resolved = resolveEffectiveRole(defaultCurrentUser.role, previewValue);
    if (!resolved.previewRole) return defaultCurrentUser;
    return Object.freeze({
      ...defaultCurrentUser,
      role: resolved.effectiveRole,
      authenticatedRole: resolved.authenticatedRole,
      previewRole: resolved.previewRole
    });
  }

  const { authRepository, userRoleRepository } =
    await createServerRepositories();
  const user = await authRepository.getCurrentUser();
  if (!user) return null;

  const authenticatedRole = getPrimaryRole(
    await userRoleRepository.getRolesForUser(user.id)
  );
  if (!authenticatedRole) return null;
  const resolved = resolveEffectiveRole(authenticatedRole, previewValue);

  const metadataName = user.user_metadata?.full_name;
  const displayName =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : user.email ?? user.id;

  if (!resolved.previewRole) {
    return Object.freeze({
      id: user.id,
      displayName,
      role: authenticatedRole
    });
  }

  return Object.freeze({
    id: user.id,
    displayName,
    role: resolved.effectiveRole,
    authenticatedRole: resolved.authenticatedRole,
    previewRole: resolved.previewRole
  });
}

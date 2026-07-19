import {
  getPrimaryRole
} from "@/lib/auth/authorization";
import {
  defaultCurrentUser,
  type CurrentUser
} from "@/lib/auth/current-user";
import { createServerRepositories } from "@/repositories/server";

export async function resolveCurrentAuthorizationUser(): Promise<CurrentUser | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return defaultCurrentUser;
  }

  const { authRepository, userRoleRepository } =
    await createServerRepositories();
  const user = await authRepository.getCurrentUser();
  if (!user) return null;

  const role = getPrimaryRole(
    await userRoleRepository.getRolesForUser(user.id)
  );
  if (!role) return null;

  const metadataName = user.user_metadata?.full_name;
  const displayName =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : user.email ?? user.id;

  return Object.freeze({
    id: user.id,
    displayName,
    role
  });
}

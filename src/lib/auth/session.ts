import { redirect } from "next/navigation";
import { ROLES, type Role } from "@/lib/auth/roles";
import { createServerRepositories } from "@/repositories/server";

const LOGIN_PATH = "/login";
const UNAUTHORIZED_PATH = "/unauthorized";

export async function getCurrentUser() {
  const { authRepository } = await createServerRepositories();
  return authRepository.getCurrentUser();
}

export async function getCurrentUserRoles(): Promise<Role[]> {
  const { authRepository, userRoleRepository } = await createServerRepositories();
  const user = await authRepository.getCurrentUser();

  if (!user) {
    return [];
  }

  return userRoleRepository.getRolesForUser(user.id);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(LOGIN_PATH);
  }

  return user;
}

export async function requireRole(allowedRoles: readonly Role[]) {
  const user = await requireUser();
  const roles = await getCurrentUserRoles();
  const hasRole = roles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    redirect(UNAUTHORIZED_PATH);
  }

  return {
    user,
    roles
  };
}

export async function requireOwner() {
  return requireRole([ROLES.OWNER]);
}

export async function requireAdmin() {
  return requireRole([ROLES.OWNER, ROLES.ADMIN]);
}

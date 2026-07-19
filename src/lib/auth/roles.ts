import {
  resolveProductRoleFromLegacySlug,
  type UserRole
} from "@/lib/auth/authorization";

export const ROLES = {
  OWNER: "operations-executive",
  ADMIN: "administrator",
  RESTAURANT_MANAGER: "restaurant-manager",
  COOK: "kitchen-manager",
  CASHIER: "cashier"
} as const satisfies Record<string, UserRole>;

export type Role = UserRole;

const roleSlugByRole = {
  "operations-executive": "owner",
  administrator: "admin",
  "restaurant-manager": "restaurant-manager",
  "kitchen-manager": "cook",
  cashier: "cashier"
} as const satisfies Record<Role, string>;

export function roleToSlug(role: Role) {
  return roleSlugByRole[role];
}

export function slugToRole(slug: string): Role | null {
  return resolveProductRoleFromLegacySlug(slug);
}

export function hasAllowedRole(
  userRoles: readonly Role[],
  allowedRoles: readonly Role[]
) {
  return userRoles.some((role) => allowedRoles.includes(role));
}

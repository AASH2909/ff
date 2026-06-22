export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
  COOK: "COOK"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const roleSlugByRole = {
  [ROLES.OWNER]: "owner",
  [ROLES.ADMIN]: "admin",
  [ROLES.CASHIER]: "cashier",
  [ROLES.COOK]: "cook"
} as const satisfies Record<Role, string>;

export function roleToSlug(role: Role) {
  return roleSlugByRole[role];
}

export function slugToRole(slug: string): Role | null {
  const role = slug.toUpperCase();

  if (role === ROLES.OWNER || role === ROLES.ADMIN || role === ROLES.CASHIER || role === ROLES.COOK) {
    return role;
  }

  return null;
}

export function hasAllowedRole(userRoles: Role[], allowedRoles: readonly Role[]) {
  return userRoles.some((role) => allowedRoles.includes(role));
}

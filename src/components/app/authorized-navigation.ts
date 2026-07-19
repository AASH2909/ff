import {
  getNavigationForRole,
  type NavigationBadgeKey,
  type UserRole
} from "@/lib/auth/authorization";

type BadgeState = Readonly<Record<NavigationBadgeKey, number>>;

export function createAuthorizedNavigation(
  role: UserRole,
  badges: BadgeState
) {
  return getNavigationForRole(role).map((item) => ({
    ...item,
    badgeCount: item.badgeKey ? badges[item.badgeKey] : 0
  }));
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

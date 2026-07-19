import type { UserRole } from "@/lib/auth/authorization";

export type CurrentUser = Readonly<{
  id: string;
  displayName: string;
  role: UserRole;
}>;

export const defaultCurrentUser: CurrentUser = Object.freeze({
  id: "demo-maya-chen",
  displayName: "Maya Chen",
  role: "operations-executive"
});

export function resolveDemoCurrentUser(): CurrentUser {
  return defaultCurrentUser;
}

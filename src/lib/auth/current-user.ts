import type { UserRole } from "@/lib/auth/authorization";

export type CurrentUser = Readonly<{
  id: string;
  displayName: string;
  role: UserRole;
  authenticatedRole?: UserRole;
  previewRole?: UserRole | null;
}>;

export const defaultCurrentUser: CurrentUser = Object.freeze({
  id: "demo-maya-chen",
  displayName: "Maya Chen",
  role: "operations-executive"
});

export function resolveDemoCurrentUser(): CurrentUser {
  return defaultCurrentUser;
}

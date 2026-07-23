import {
  defaultExecutiveWorkspace,
  type ExecutiveWorkspace
} from "@/components/app/executive-workspace";
import type { CurrentUser } from "@/lib/auth/current-user";
import type { UserRole } from "@/lib/auth/authorization";

export type ApplicationSessionUser = Readonly<{
  id: string;
  displayName: string;
  authenticatedRole: UserRole;
  effectiveRole: UserRole;
  previewRole: UserRole | null;
}>;

export type ApplicationSession = Readonly<{
  currentUser: ApplicationSessionUser;
  workspace: ExecutiveWorkspace["workspace"];
  restaurant: ExecutiveWorkspace["restaurant"];
  location: ExecutiveWorkspace["location"];
  shift: ExecutiveWorkspace["activeShift"];
  monitoringStatus: ExecutiveWorkspace["operationalMode"];
}>;

export function createApplicationSession(
  currentUser: CurrentUser,
  workspace: ExecutiveWorkspace = defaultExecutiveWorkspace
): ApplicationSession {
  const sessionUser: ApplicationSessionUser = Object.freeze({
    id: currentUser.id,
    displayName: currentUser.displayName,
    authenticatedRole: currentUser.authenticatedRole ?? currentUser.role,
    effectiveRole: currentUser.role,
    previewRole: currentUser.previewRole ?? null
  });

  return Object.freeze({
    currentUser: sessionUser,
    workspace: workspace.workspace,
    restaurant: workspace.restaurant,
    location: workspace.location,
    shift: workspace.activeShift,
    monitoringStatus: workspace.operationalMode
  });
}

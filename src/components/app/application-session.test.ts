import { describe, expect, it } from "vitest";
import {
  createApplicationSession,
  type ApplicationSession
} from "@/components/app/application-session";
import { defaultExecutiveWorkspace } from "@/components/app/executive-workspace";
import type { CurrentUser } from "@/lib/auth/current-user";
import { SUPPORTED_ROLES } from "@/lib/auth/authorization";

describe("application session model", () => {
  it("creates one immutable UI session from resolved user and workspace context", () => {
    const user: CurrentUser = {
      id: "cashier-user",
      displayName: "Casey",
      role: "administrator",
      authenticatedRole: "cashier",
      previewRole: "administrator"
    };
    const userSnapshot = structuredClone(user);
    const workspaceSnapshot = structuredClone(defaultExecutiveWorkspace);

    const session = createApplicationSession(user, defaultExecutiveWorkspace);

    expect(session).toEqual({
      currentUser: {
        id: "cashier-user",
        displayName: "Casey",
        authenticatedRole: "cashier",
        effectiveRole: "administrator",
        previewRole: "administrator"
      },
      workspace: "demo-workspace",
      restaurant: "harbor-and-pine",
      location: "downtown",
      shift: "dinner",
      monitoringStatus: "monitoring"
    });
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.currentUser)).toBe(true);
    expect(user).toEqual(userSnapshot);
    expect(defaultExecutiveWorkspace).toEqual(workspaceSnapshot);
  });

  it("keeps the authenticated role stable while effective and preview roles change", () => {
    const real = createApplicationSession({
      id: "user-1",
      displayName: "Maya",
      role: "cashier"
    });
    const preview = createApplicationSession({
      id: "user-1",
      displayName: "Maya",
      role: "administrator",
      authenticatedRole: "cashier",
      previewRole: "administrator"
    });

    expect(real.currentUser.authenticatedRole).toBe("cashier");
    expect(real.currentUser.effectiveRole).toBe("cashier");
    expect(real.currentUser.previewRole).toBeNull();
    expect(preview.currentUser.authenticatedRole).toBe("cashier");
    expect(preview.currentUser.effectiveRole).toBe("administrator");
  });

  it.each(SUPPORTED_ROLES)("creates a valid %s session without changing authorization", (role) => {
    const session: ApplicationSession = createApplicationSession({
      id: `${role}-user`,
      displayName: role,
      role
    });
    expect(session.currentUser.effectiveRole).toBe(role);
    expect(session.currentUser.authenticatedRole).toBe(role);
  });
});

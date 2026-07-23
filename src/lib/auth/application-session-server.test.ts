import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn()
}));

vi.mock("@/lib/auth/current-user-server", () => ({
  resolveCurrentAuthorizationUser: mocks.currentUser
}));

import { resolveApplicationSession } from "@/lib/auth/application-session-server";

describe("server application session resolution", () => {
  beforeEach(() => mocks.currentUser.mockReset());

  it("fails closed when server authorization cannot resolve a user", async () => {
    mocks.currentUser.mockResolvedValue(null);
    expect(await resolveApplicationSession()).toBeNull();
  });

  it("builds session context from the already-resolved effective role", async () => {
    mocks.currentUser.mockResolvedValue({
      id: "preview-user",
      displayName: "Maya Chen",
      role: "kitchen-manager",
      authenticatedRole: "operations-executive",
      previewRole: "kitchen-manager"
    });

    expect(await resolveApplicationSession()).toEqual({
      currentUser: {
        id: "preview-user",
        displayName: "Maya Chen",
        authenticatedRole: "operations-executive",
        effectiveRole: "kitchen-manager",
        previewRole: "kitchen-manager"
      },
      workspace: "demo-workspace",
      restaurant: "harbor-and-pine",
      location: "downtown",
      shift: "dinner",
      monitoringStatus: "monitoring"
    });
  });
});

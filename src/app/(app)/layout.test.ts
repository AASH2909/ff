import { isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  })
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}));

vi.mock("@/lib/auth/application-session-server", () => ({
  resolveApplicationSession: mocks.session
}));

import ProtectedAppLayout from "@/app/(app)/layout";

describe("protected app layout authorization boundary", () => {
  beforeEach(() => {
    mocks.session.mockReset();
    mocks.redirect.mockClear();
  });

  it("fails closed before returning protected children when user resolution fails", async () => {
    mocks.session.mockResolvedValue(null);
    await expect(
      ProtectedAppLayout({ children: "PROTECTED-CONTENT" })
    ).rejects.toThrow("REDIRECT:/unauthorized");
    expect(mocks.redirect).toHaveBeenCalledWith("/unauthorized");
  });

  it("returns the session provider only after server resolution succeeds", async () => {
    const session = {
      currentUser: {
        id: "cashier-user",
        displayName: "Cashier",
        authenticatedRole: "cashier",
        effectiveRole: "cashier",
        previewRole: null
      },
      workspace: "demo-workspace",
      restaurant: "harbor-and-pine",
      location: "downtown",
      shift: "dinner",
      monitoringStatus: "monitoring"
    } as const;
    mocks.session.mockResolvedValue(session);
    const result = await ProtectedAppLayout({
      children: "PROTECTED-CONTENT"
    });
    expect(isValidElement(result)).toBe(true);
    expect(result.props.session).toBe(session);
  });
});

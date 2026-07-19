import { isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  })
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}));

vi.mock("@/lib/auth/current-user-server", () => ({
  resolveCurrentAuthorizationUser: mocks.currentUser
}));

import ProtectedAppLayout from "@/app/(app)/layout";

describe("protected app layout authorization boundary", () => {
  beforeEach(() => {
    mocks.currentUser.mockReset();
    mocks.redirect.mockClear();
  });

  it("fails closed before returning protected children when user resolution fails", async () => {
    mocks.currentUser.mockResolvedValue(null);
    await expect(
      ProtectedAppLayout({ children: "PROTECTED-CONTENT" })
    ).rejects.toThrow("REDIRECT:/unauthorized");
    expect(mocks.redirect).toHaveBeenCalledWith("/unauthorized");
  });

  it("returns the authorization provider only after server resolution succeeds", async () => {
    mocks.currentUser.mockResolvedValue({
      id: "cashier-user",
      displayName: "Cashier",
      role: "cashier"
    });
    const result = await ProtectedAppLayout({
      children: "PROTECTED-CONTENT"
    });
    expect(isValidElement(result)).toBe(true);
    expect(result.props.currentUser.role).toBe("cashier");
  });
});

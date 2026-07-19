import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/lib/auth/authorization";

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

import Home from "@/app/page";

describe("root role-aware default routing", () => {
  beforeEach(() => {
    mocks.currentUser.mockReset();
    mocks.redirect.mockClear();
  });

  it.each([
    ["operations-executive", "/dashboard"],
    ["restaurant-manager", "/dashboard"],
    ["kitchen-manager", "/kitchen"],
    ["cashier", "/pos"],
    ["administrator", "/settings"]
  ] satisfies ReadonlyArray<readonly [UserRole, string]>)(
    "routes %s to %s",
    async (role, expectedPath) => {
      mocks.currentUser.mockResolvedValue({
        id: `${role}-user`,
        displayName: role,
        role
      });
      await expect(Home()).rejects.toThrow(`REDIRECT:${expectedPath}`);
      expect(mocks.redirect).toHaveBeenCalledWith(expectedPath);
    }
  );

  it("routes a missing current user to login", async () => {
    mocks.currentUser.mockResolvedValue(null);
    await expect(Home()).rejects.toThrow("REDIRECT:/login");
  });
});

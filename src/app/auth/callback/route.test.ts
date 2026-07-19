import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/lib/auth/authorization";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getCurrentUser: vi.fn(),
  getRolesForUser: vi.fn()
}));

vi.mock("@/repositories/server", () => ({
  createServerRepositories: vi.fn(async () => ({
    authRepository: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getCurrentUser: mocks.getCurrentUser
    },
    userRoleRepository: {
      getRolesForUser: mocks.getRolesForUser
    }
  }))
}));

import { GET } from "@/app/auth/callback/route";

describe("auth callback centralized default routing", () => {
  beforeEach(() => {
    mocks.exchangeCodeForSession.mockReset();
    mocks.getCurrentUser.mockReset();
    mocks.getRolesForUser.mockReset();
  });

  it.each([
    ["operations-executive", "/dashboard"],
    ["restaurant-manager", "/dashboard"],
    ["kitchen-manager", "/kitchen"],
    ["cashier", "/pos"],
    ["administrator", "/settings"]
  ] satisfies ReadonlyArray<readonly [UserRole, string]>)(
    "uses the centralized %s default %s",
    async (role, expectedPath) => {
      mocks.getCurrentUser.mockResolvedValue({ id: `${role}-user` });
      mocks.getRolesForUser.mockResolvedValue([role]);
      const response = await GET(callbackRequest());
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("auth-code");
      expect(new URL(requiredLocation(response)).pathname).toBe(expectedPath);
    }
  );

  it("fails closed when the callback cannot resolve a role", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "unknown-user" });
    mocks.getRolesForUser.mockResolvedValue([]);
    const response = await GET(callbackRequest());
    expect(new URL(requiredLocation(response)).pathname).toBe("/unauthorized");
  });

  it("preserves a safe explicit next route for middleware enforcement", async () => {
    const response = await GET(
      new NextRequest(
        "https://fastflow.test/auth/callback?code=auth-code&next=/inventory"
      )
    );
    expect(new URL(requiredLocation(response)).pathname).toBe("/inventory");
  });
});

function callbackRequest() {
  return new NextRequest(
    "https://fastflow.test/auth/callback?code=auth-code"
  );
}

function requiredLocation(response: Response) {
  const location = response.headers.get("location");
  expect(location).not.toBeNull();
  return location as string;
}

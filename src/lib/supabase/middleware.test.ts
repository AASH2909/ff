import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/lib/auth/authorization";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getRolesForUser: vi.fn()
}));

vi.mock("@/repositories/middleware", () => ({
  createMiddlewareRepositories: (request: NextRequest) => ({
    response: NextResponse.next({ request }),
    repositories: {
      authRepository: {
        getCurrentUser: mocks.getCurrentUser
      },
      userRoleRepository: {
        getRolesForUser: mocks.getRolesForUser
      }
    }
  })
}));

import { updateSession } from "@/lib/supabase/middleware";

describe("server middleware authorization enforcement", () => {
  beforeEach(() => {
    mocks.getCurrentUser.mockReset();
    mocks.getRolesForUser.mockReset();
  });

  it("keeps public routes accessible without authorization", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const response = await request("/login");
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects unauthenticated protected access before content can continue", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const response = await request("/settings");
    expect(response.status).toBe(307);
    expect(new URL(requiredLocation(response)).pathname).toBe("/login");
    expect(new URL(requiredLocation(response)).searchParams.get("next")).toBe(
      "/settings"
    );
    expect(response.headers.get("x-middleware-next")).toBeNull();
  });

  it.each([
    ["operations-executive", "/dashboard"],
    ["cashier", "/pos"],
    ["cashier", "/inventory"],
    ["kitchen-manager", "/kitchen"],
    ["administrator", "/settings"]
  ] satisfies ReadonlyArray<readonly [UserRole, string]>)(
    "allows %s to access %s on initial request and refresh",
    async (role, pathname) => {
      authorize(role);
      const first = await request(pathname);
      const refresh = await request(pathname);
      expect(first.status).toBe(200);
      expect(refresh.status).toBe(200);
      expect(first.headers.get("location")).toBeNull();
      expect(refresh.headers.get("location")).toBeNull();
    }
  );

  it.each([
    ["cashier", "/settings", "/pos"],
    ["kitchen-manager", "/settings", "/kitchen"]
  ] satisfies ReadonlyArray<readonly [UserRole, string, string]>)(
    "denies %s direct access to %s before protected content and redirects to %s",
    async (role, pathname, expectedDefault) => {
      authorize(role);
      const response = await request(pathname);
      expect(response.status).toBe(307);
      expect(new URL(requiredLocation(response)).pathname).toBe(expectedDefault);
      expect(response.headers.get("x-middleware-next")).toBeNull();
    }
  );

  it("fails closed for an authenticated user with no resolved role", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "unknown-user" });
    mocks.getRolesForUser.mockResolvedValue([]);
    const response = await request("/dashboard");
    expect(response.status).toBe(307);
    expect(new URL(requiredLocation(response)).pathname).toBe("/unauthorized");
  });

  it.each([
    ["cashier", "/pos"],
    ["kitchen-manager", "/kitchen"],
    ["administrator", "/settings"]
  ] satisfies ReadonlyArray<readonly [UserRole, string]>)(
    "does not redirect-loop when the %s default route %s is evaluated",
    async (role, pathname) => {
      authorize(role);
      const response = await request(pathname);
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  );

  it.each([
    ["cashier", "/pos"],
    ["kitchen-manager", "/kitchen"],
    ["administrator", "/settings"],
    ["operations-executive", "/dashboard"]
  ] satisfies ReadonlyArray<readonly [UserRole, string]>)(
    "redirects an authenticated %s away from login to %s",
    async (role, expectedDefault) => {
      authorize(role);
      const response = await request("/login");
      expect(response.status).toBe(307);
      expect(new URL(requiredLocation(response)).pathname).toBe(expectedDefault);
    }
  );
});

function authorize(role: UserRole) {
  mocks.getCurrentUser.mockResolvedValue({ id: `${role}-user` });
  mocks.getRolesForUser.mockResolvedValue([role]);
}

function request(pathname: string) {
  return updateSession(
    new NextRequest(`https://fastflow.test${pathname}`)
  );
}

function requiredLocation(response: NextResponse) {
  const location = response.headers.get("location");
  expect(location).not.toBeNull();
  return location as string;
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getRolesForUser: vi.fn()
}));

vi.mock("@/repositories/server", () => ({
  createServerRepositories: vi.fn(async () => ({
    authRepository: {
      getCurrentUser: mocks.getCurrentUser
    },
    userRoleRepository: {
      getRolesForUser: mocks.getRolesForUser
    }
  }))
}));

import { defaultCurrentUser } from "@/lib/auth/current-user";
import { resolveCurrentAuthorizationUser } from "@/lib/auth/current-user-server";

describe("server current-user authorization resolution", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    mocks.getCurrentUser.mockReset();
    mocks.getRolesForUser.mockReset();
  });

  afterEach(() => {
    restoreEnvironment("NEXT_PUBLIC_SUPABASE_URL", originalUrl);
    restoreEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY", originalKey);
  });

  it("uses the isolated executive demo user when Supabase is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(await resolveCurrentAuthorizationUser()).toBe(defaultCurrentUser);
  });

  it("resolves the authenticated Supabase user and centralized primary role", async () => {
    configureSupabase();
    mocks.getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "maya@example.test",
      user_metadata: { full_name: "Maya Chen" }
    });
    mocks.getRolesForUser.mockResolvedValue(["cashier"]);

    expect(await resolveCurrentAuthorizationUser()).toEqual({
      id: "user-1",
      displayName: "Maya Chen",
      role: "cashier"
    });
  });

  it("fails closed when the session or resolved role is missing", async () => {
    configureSupabase();
    mocks.getCurrentUser.mockResolvedValue(null);
    expect(await resolveCurrentAuthorizationUser()).toBeNull();

    mocks.getCurrentUser.mockResolvedValue({
      id: "user-2",
      email: "unknown@example.test",
      user_metadata: {}
    });
    mocks.getRolesForUser.mockResolvedValue([]);
    expect(await resolveCurrentAuthorizationUser()).toBeNull();
  });
});

function configureSupabase() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
}

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

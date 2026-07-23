import { isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useContext: vi.fn()
}));

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useContext: mocks.useContext
}));

import { createApplicationSession } from "@/components/app/application-session";
import {
  SessionProvider,
  useSession
} from "@/components/app/session-provider";

describe("SessionProvider", () => {
  const session = createApplicationSession({
    id: "manager-user",
    displayName: "Morgan",
    role: "restaurant-manager"
  });

  beforeEach(() => mocks.useContext.mockReset());

  it("provides the exact read-only server session across child route transitions", () => {
    const result = SessionProvider({ session, children: "ROUTE-CONTENT" });
    expect(isValidElement(result)).toBe(true);
    expect(result.props.value).toBe(session);
    expect(result.props.children).toBe("ROUTE-CONTENT");
  });

  it("returns the current session", () => {
    mocks.useContext.mockReturnValue(session);
    expect(useSession()).toBe(session);
  });

  it("throws outside SessionProvider", () => {
    mocks.useContext.mockReturnValue(null);
    expect(() => useSession()).toThrow(
      "useSession must be used within SessionProvider"
    );
  });
});

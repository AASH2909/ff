import { describe, expect, it } from "vitest";
import {
  SUPPORTED_ROLES,
  getDefaultRouteForRole
} from "@/lib/auth/authorization";
import {
  DEVELOPER_ROLE_PREVIEW_COOKIE,
  getDeveloperRolePreviewOptions,
  resolveEffectiveRole,
  resolvePreviewNavigation
} from "@/lib/auth/developer-role-preview";

describe("developer role preview", () => {
  it("uses every canonical role as the preview options", () => {
    expect(getDeveloperRolePreviewOptions()).toEqual(SUPPORTED_ROLES);
  });

  it.each(SUPPORTED_ROLES)("accepts canonical preview role %s in development", (role) => {
    expect(resolveEffectiveRole("operations-executive", role, "development")).toEqual({
      authenticatedRole: "operations-executive",
      effectiveRole: role,
      previewRole: role
    });
  });

  it("rejects unknown preview values and restores the authenticated role", () => {
    expect(
      resolveEffectiveRole("cashier", "invented-role", "development")
    ).toEqual({
      authenticatedRole: "cashier",
      effectiveRole: "cashier",
      previewRole: null
    });
    expect(resolveEffectiveRole("cashier", null, "development").effectiveRole).toBe(
      "cashier"
    );
  });

  it("ignores a valid preview cookie in production", () => {
    expect(
      resolveEffectiveRole("cashier", "administrator", "production")
    ).toEqual({
      authenticatedRole: "cashier",
      effectiveRole: "cashier",
      previewRole: null
    });
  });

  it("uses centralized route access and default-route decisions", () => {
    expect(resolvePreviewNavigation("cashier", "/inventory")).toBe("/inventory");
    expect(resolvePreviewNavigation("cashier", "/settings")).toBe(
      getDefaultRouteForRole("cashier")
    );
  });

  it("uses a clearly development-scoped cookie name", () => {
    expect(DEVELOPER_ROLE_PREVIEW_COOKIE).toBe("controlos.dev.preview-role");
  });
});

import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ExecutiveHeaderView } from "@/components/app/executive-header";
import { createApplicationSession } from "@/components/app/application-session";
import {
  defaultExecutiveWorkspace,
  readExecutiveWorkspace,
  updateExecutiveWorkspace,
  writeExecutiveWorkspace
} from "@/components/app/executive-workspace";
import { setActiveLocale } from "@/localization";
import {
  defaultCurrentUser,
  type CurrentUser
} from "@/components/app/current-authorization";
import type { UserRole } from "@/lib/auth/authorization";

describe("ExecutiveHeaderView", () => {
  it("renders executive identity and workspace context", () => {
    const text = collectText(
      ExecutiveHeaderView({
        session: createApplicationSession(defaultCurrentUser)
      })
    );

    expect(text).toContain("Maya Chen");
    expect(text).toContain("Operations Executive");
    expect(text).toContain("Demo Workspace");
    expect(text).toContain("Dinner Shift");
    expect(text).toContain("Monitoring");
  });

  it("reflects profile updates without changing navigation or demo state", () => {
    const updatedUser: CurrentUser = {
      id: "demo-alex-morgan",
      displayName: "Alex Morgan",
      role: "operations-executive"
    };
    expect(collectText(ExecutiveHeaderView({
      session: createApplicationSession(updatedUser)
    }))).toContain(
      "Alex Morgan"
    );
  });

  it("renders localized context and survives persistence refresh", () => {
    const stored = updateExecutiveWorkspace(defaultExecutiveWorkspace, {
      compactMode: true
    });
    let serialized: string | null = null;
    const storage = {
      getItem: vi.fn(() => serialized),
      setItem: vi.fn((_key: string, value: string) => {
        serialized = value;
      })
    };
    writeExecutiveWorkspace(storage, stored);
    const reloaded = readExecutiveWorkspace(storage);

    setActiveLocale("ru");
    const text = collectText(ExecutiveHeaderView({
      session: createApplicationSession(defaultCurrentUser, reloaded)
    }));
    expect(text).toContain("Maya Chen");
    expect(text).toContain("Операционный руководитель");
    expect(text).toContain("Демо-пространство");
    setActiveLocale("en");
  });

  it("renders every localized role label from the centralized current user", () => {
    const expected: Record<UserRole, readonly [string, string]> = {
      "operations-executive": [
        "Operations Executive",
        "Операционный руководитель"
      ],
      "restaurant-manager": [
        "Restaurant Manager",
        "Руководитель ресторана"
      ],
      "kitchen-manager": ["Kitchen Manager", "Руководитель кухни"],
      cashier: ["Cashier", "Кассир"],
      administrator: ["Administrator", "Администратор"]
    };

    for (const [role, [english, russian]] of Object.entries(expected) as [
      UserRole,
      readonly [string, string]
    ][]) {
      const currentUser = {
        id: `demo-${role}`,
        displayName: "Maya Chen",
        role
      };
      setActiveLocale("en");
      expect(
        collectText(
          ExecutiveHeaderView({
            session: createApplicationSession(currentUser)
          })
        )
      ).toContain(english);
      setActiveLocale("ru");
      expect(
        collectText(
          ExecutiveHeaderView({
            session: createApplicationSession(currentUser)
          })
        )
      ).toContain(russian);
    }
    setActiveLocale("en");
  });
});

function collectText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!isValidElement(node)) return "";
  const element = node as ReactElement<{
    children?: ReactNode;
    label?: string;
    value?: string;
  }>;
  const children = Array.isArray(element.props.children)
    ? element.props.children
    : [element.props.children];
  return [
    element.props.label,
    element.props.value,
    ...children.map(collectText)
  ]
    .filter(Boolean)
    .join(" ");
}

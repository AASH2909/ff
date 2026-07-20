import {
  isValidElement,
  type ReactElement,
  type ReactNode
} from "react";
import { describe, expect, it, vi } from "vitest";
import {
  DeveloperRolePreviewView,
  rolePreviewControlClasses
} from "@/components/app/developer-role-preview";
import { SUPPORTED_ROLES } from "@/lib/auth/authorization";
import { setActiveLocale } from "@/localization";

describe("DeveloperRolePreviewView", () => {
  it("does not render when development preview is disabled", () => {
    expect(
      DeveloperRolePreviewView({
        enabled: false,
        role: "cashier",
        previewRole: null,
        onRoleChange: vi.fn(),
        onClear: vi.fn()
      })
    ).toBeNull();
  });

  it("renders every canonical role with accessible development controls", () => {
    setActiveLocale("en");
    const view = DeveloperRolePreviewView({
      enabled: true,
      role: "cashier",
      previewRole: "cashier",
      onRoleChange: vi.fn(),
      onClear: vi.fn()
    });
    const text = collectText(view);

    expect(text).toContain("Developer preview");
    expect(text).toContain("Preview role");
    expect(text).toContain("Use real role");
    for (const role of SUPPORTED_ROLES) expect(findOptionValues(view)).toContain(role);
    expect(findProp(view, "aria-label")).toContain("Preview role");
  });

  it("renders complete English and Russian role labels without truncation classes", () => {
    setActiveLocale("en");
    expect(
      collectText(
        DeveloperRolePreviewView({
          enabled: true,
          role: "operations-executive",
          previewRole: "operations-executive",
          onRoleChange: vi.fn(),
          onClear: vi.fn()
        })
      )
    ).toContain("Operations Executive");

    setActiveLocale("ru");
    const russian = collectText(
      DeveloperRolePreviewView({
        enabled: true,
        role: "operations-executive",
        previewRole: "operations-executive",
        onRoleChange: vi.fn(),
        onClear: vi.fn()
      })
    );
    expect(russian).toContain("Операционный руководитель");
    expect(russian).toContain("Руководитель ресторана");
    expect(rolePreviewControlClasses).toContain("whitespace-normal");
    expect(rolePreviewControlClasses).not.toContain("truncate");
    setActiveLocale("en");
  });
});

function collectText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!isValidElement(node)) return "";
  const element = node as ReactElement<{ children?: ReactNode }>;
  return (Array.isArray(element.props.children)
    ? element.props.children
    : [element.props.children]
  )
    .map(collectText)
    .join(" ");
}

function findOptionValues(node: ReactNode): string[] {
  if (!isValidElement(node)) return [];
  const element = node as ReactElement<{ children?: ReactNode; value?: string }>;
  const own = element.type === "option" && element.props.value
    ? [element.props.value]
    : [];
  const children = Array.isArray(element.props.children)
    ? element.props.children
    : [element.props.children];
  return [...own, ...children.flatMap(findOptionValues)];
}

function findProp(node: ReactNode, name: string): string[] {
  if (!isValidElement(node)) return [];
  const element = node as ReactElement<
    { children?: ReactNode } & Record<string, unknown>
  >;
  const own = typeof element.props[name] === "string"
    ? [element.props[name] as string]
    : [];
  const children = Array.isArray(element.props.children)
    ? element.props.children
    : [element.props.children];
  return [...own, ...children.flatMap((child) => findProp(child, name))];
}

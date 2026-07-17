import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ExecutiveHeaderView } from "@/components/app/executive-header";
import {
  defaultExecutiveWorkspace,
  readExecutiveWorkspace,
  updateExecutiveWorkspace,
  writeExecutiveWorkspace
} from "@/components/app/executive-workspace";
import { setActiveLocale } from "@/localization";

describe("ExecutiveHeaderView", () => {
  it("renders executive identity and workspace context", () => {
    const text = collectText(
      ExecutiveHeaderView({ workspace: defaultExecutiveWorkspace })
    );

    expect(text).toContain("Maya Chen");
    expect(text).toContain("Operations Executive");
    expect(text).toContain("Demo Workspace");
    expect(text).toContain("Dinner Shift");
    expect(text).toContain("Monitoring");
  });

  it("reflects profile updates without changing navigation or demo state", () => {
    const updated = updateExecutiveWorkspace(defaultExecutiveWorkspace, {
      displayName: "Alex Morgan"
    });
    expect(collectText(ExecutiveHeaderView({ workspace: updated }))).toContain(
      "Alex Morgan"
    );
    expect(defaultExecutiveWorkspace.displayName).toBe("Maya Chen");
  });

  it("renders localized context and survives persistence refresh", () => {
    const stored = updateExecutiveWorkspace(defaultExecutiveWorkspace, {
      displayName: "Alex Morgan"
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
    const text = collectText(ExecutiveHeaderView({ workspace: reloaded }));
    expect(text).toContain("Alex Morgan");
    expect(text).toContain("Операционный руководитель");
    expect(text).toContain("Демо-пространство");
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

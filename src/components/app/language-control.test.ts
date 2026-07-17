import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageControlView } from "@/components/app/language-control";
import { setActiveLocale } from "@/localization";

describe("LanguageControlView", () => {
  it("shows the active locale and selects Russian and English", () => {
    const onLocaleChange = vi.fn();
    const view = LanguageControlView({ locale: "en", onLocaleChange });
    const buttons = findButtons(view);
    expect(buttons.map((button) => button.props.children)).toEqual(["English", "Russian"]);
    expect(buttons[0]?.props["aria-pressed"]).toBe(true);
    buttons[1]?.props.onClick?.();
    buttons[0]?.props.onClick?.();
    expect(onLocaleChange).toHaveBeenNthCalledWith(1, "ru");
    expect(onLocaleChange).toHaveBeenNthCalledWith(2, "en");
  });

  it("localizes both language labels in Russian", () => {
    setActiveLocale("ru");
    const view = LanguageControlView({ locale: "ru", onLocaleChange: vi.fn() });
    expect(findButtons(view).map((button) => button.props.children)).toEqual([
      "Английский",
      "Русский"
    ]);
    setActiveLocale("en");
  });
});

function findButtons(node: ReactNode): Array<ReactElement<{ children?: ReactNode; onClick?: () => void; "aria-pressed"?: boolean }>> {
  if (!isValidElement(node)) return [];
  const element = node as ReactElement<{ children?: ReactNode; onClick?: () => void; "aria-pressed"?: boolean }>;
  const own = element.type === "button" ? [element] : [];
  const children = Array.isArray(element.props.children) ? element.props.children : [element.props.children];
  return own.concat(children.flatMap(findButtons));
}

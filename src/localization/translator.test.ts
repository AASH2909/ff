import { describe, expect, it } from "vitest";
import { dictionaries, getDictionary, t, type MessageKey } from "@/localization";
import { createTranslator } from "@/localization/translator";

describe("localization", () => {
  it("looks up typed English messages and interpolates values", () => {
    const key: MessageKey = "pages.kitchen.title";
    expect(t(key)).toBe("Kitchen");
    expect(t("pages.pos.queueRemaining", { count: 2 })).toBe("2 refund items remain to clear.");
  });

  it("loads English and Russian dictionaries", () => {
    expect(getDictionary("en")["nav.dashboard"]).toBe("Dashboard");
    expect(getDictionary("ru")["nav.dashboard"]).toBe("Панель управления");
    expect(Object.keys(getDictionary("ru"))).toEqual(Object.keys(getDictionary("en")));
  });

  it("returns the key when an untrusted runtime key is missing", () => {
    const runtimeTranslator = createTranslator(dictionaries.en);
    expect(runtimeTranslator("missing.key" as MessageKey)).toBe("missing.key");
  });

  it("freezes dictionaries against mutation", () => {
    expect(Object.isFrozen(dictionaries)).toBe(true);
    expect(Object.isFrozen(dictionaries.en)).toBe(true);
    expect(() => {
      (dictionaries.en as Record<string, string>)["nav.dashboard"] = "Changed";
    }).toThrow();
    expect(t("nav.dashboard")).toBe("Dashboard");
  });
});

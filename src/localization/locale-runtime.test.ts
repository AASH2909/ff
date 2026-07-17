import { describe, expect, it, vi } from "vitest";
import { dictionaries, type MessageKey } from "@/localization";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  createLocaleTranslator,
  readPersistedLocale,
  resolveLocale,
  writePersistedLocale
} from "@/localization/locale-runtime";

describe("runtime locale", () => {
  it("defaults unknown locales to English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
    expect(resolveLocale("de")).toBe("en");
    expect(resolveLocale("ru")).toBe("ru");
  });

  it("resolves Russian and safely falls back to English messages", () => {
    expect(createLocaleTranslator("ru")("nav.dashboard")).toBe("Панель управления");
    expect(createLocaleTranslator("unknown")("nav.dashboard")).toBe("Dashboard");
    expect(createLocaleTranslator("ru")("missing.key" as MessageKey)).toBe("");
  });

  it("uses one storage key and rejects invalid persisted values", () => {
    const validStorage = { getItem: vi.fn(() => "ru"), setItem: vi.fn() };
    const invalidStorage = { getItem: vi.fn(() => "uz"), setItem: vi.fn() };
    expect(LOCALE_STORAGE_KEY).toBe("fastflow.locale");
    expect(readPersistedLocale(validStorage)).toBe("ru");
    expect(readPersistedLocale(invalidStorage)).toBe("en");
    writePersistedLocale(validStorage, "en");
    expect(validStorage.setItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, "en");
  });

  it("keeps exact dictionary parity and immutability", () => {
    expect(Object.keys(dictionaries.ru)).toEqual(Object.keys(dictionaries.en));
    expect(Object.isFrozen(dictionaries.en)).toBe(true);
    expect(Object.isFrozen(dictionaries.ru)).toBe(true);
  });
});

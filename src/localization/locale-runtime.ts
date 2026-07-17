import { dictionaries, type Locale, type MessageKey } from "@/localization";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "fastflow.locale";
export const supportedLocales = Object.freeze(["en", "ru"] as const);

export type LocaleStorage = Pick<Storage, "getItem" | "setItem">;

export function resolveLocale(value: unknown): Locale {
  return value === "ru" || value === "en" ? value : DEFAULT_LOCALE;
}

export function createLocaleTranslator(value: unknown) {
  const locale = resolveLocale(value);
  return (key: MessageKey, values?: Record<string, string | number>) => {
    const message = dictionaries[locale][key] ?? dictionaries.en[key];
    if (typeof message !== "string") return "";
    if (!values) return message;
    return Object.entries(values).reduce(
      (result, [name, replacement]) => result.replaceAll(`{${name}}`, String(replacement)),
      message as string
    );
  };
}

export function readPersistedLocale(storage?: LocaleStorage): Locale {
  try {
    return resolveLocale(storage?.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writePersistedLocale(storage: LocaleStorage | undefined, locale: Locale) {
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Browser storage can be unavailable without blocking the UI.
  }
}

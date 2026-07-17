import { en } from "@/localization/dictionaries/en";
import { ru } from "@/localization/dictionaries/ru";
import { deepFreezeDictionary, type TranslationKey } from "@/localization/translator";

export const dictionaries = deepFreezeDictionary({ en, ru });
export type Locale = keyof typeof dictionaries;
export type MessageKey = TranslationKey<typeof en>;
let activeLocale: Locale = "en";

export function setActiveLocale(locale: Locale) {
  activeLocale = locale;
}

export function t(key: MessageKey, values?: Record<string, string | number>) {
  const message = dictionaries[activeLocale][key] ?? dictionaries.en[key];
  if (typeof message !== "string") return "";
  if (!values) return message;
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    message as string
  );
}

export function translateKnownMessage(value: string) {
  const entry = Object.entries(dictionaries.en).find(([, message]) => message === value);
  return entry ? t(entry[0] as MessageKey) : value;
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export { createTranslator } from "@/localization/translator";

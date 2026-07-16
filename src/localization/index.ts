import { en } from "@/localization/dictionaries/en";
import { ru } from "@/localization/dictionaries/ru";
import { createTranslator, deepFreezeDictionary, type TranslationKey } from "@/localization/translator";

export const dictionaries = deepFreezeDictionary({ en, ru });
export type Locale = keyof typeof dictionaries;
export type MessageKey = TranslationKey<typeof en>;
export const t = createTranslator(en);

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export { createTranslator } from "@/localization/translator";

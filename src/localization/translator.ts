export type DictionaryShape<T> = { [K in keyof T]: string };
export type TranslationKey<T extends Record<string, string>> = keyof T & string;

export function deepFreezeDictionary<T extends object>(dictionary: T): Readonly<T> {
  for (const value of Object.values(dictionary)) {
    if (value && typeof value === "object") deepFreezeDictionary(value);
  }
  return Object.freeze(dictionary);
}

export function createTranslator<const T extends Record<string, string>>(dictionary: T) {
  const frozen = deepFreezeDictionary({ ...dictionary });

  return function translate(key: TranslationKey<T>, values?: Record<string, string | number>): string {
    const message: string = frozen[key];
    if (typeof message !== "string") return key;
    if (!values) return message;

    return Object.entries(values).reduce<string>(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      message
    );
  };
}

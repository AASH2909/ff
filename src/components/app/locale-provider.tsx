"use client";

import * as React from "react";
import { setActiveLocale, t, type Locale } from "@/localization";
import {
  DEFAULT_LOCALE,
  readPersistedLocale,
  supportedLocales,
  writePersistedLocale
} from "@/localization/locale-runtime";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  supportedLocales: typeof supportedLocales;
  t: typeof t;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  const setLocale = React.useCallback((nextLocale: Locale) => {
    setActiveLocale(nextLocale);
    setLocaleState(nextLocale);
    writePersistedLocale(typeof window === "undefined" ? undefined : window.localStorage, nextLocale);
  }, []);

  React.useEffect(() => {
    const persisted = readPersistedLocale(window.localStorage);
    setActiveLocale(persisted);
    setLocaleState(persisted);
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = React.useMemo(() => ({ locale, setLocale, supportedLocales, t }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = React.useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}

export function LocaleRenderBoundary({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  return <React.Fragment key={locale}>{children}</React.Fragment>;
}

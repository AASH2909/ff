"use client";

import type { Locale } from "@/localization";
import { useLocale } from "@/components/app/locale-provider";
import { cn } from "@/lib/utils";
import { t } from "@/localization";

export function LanguageControl() {
  const { locale, setLocale } = useLocale();
  return <LanguageControlView locale={locale} onLocaleChange={setLocale} />;
}

export function LanguageControlView({ locale, onLocaleChange }: { locale: Locale; onLocaleChange: (locale: Locale) => void }) {
  return (
    <div className="surface-blur fixed right-3 top-3 z-50 flex max-w-[calc(100vw-1.5rem)] gap-1 rounded-md border p-1 md:bottom-4 md:left-4 md:right-auto md:top-auto" aria-label={t("common.language")}>
      <button type="button" aria-pressed={locale === "en"} onClick={() => onLocaleChange("en")} className={cn("rounded-sm px-2 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", locale === "en" && "bg-primary text-primary-foreground")}>{t("common.languageEnglish")}</button>
      <button type="button" aria-pressed={locale === "ru"} onClick={() => onLocaleChange("ru")} className={cn("rounded-sm px-2 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", locale === "ru" && "bg-primary text-primary-foreground")}>{t("common.languageRussian")}</button>
    </div>
  );
}

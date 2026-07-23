"use client";

import { StatusChip } from "@/components/design-system";
import { t } from "@/localization";

export function OperationalContextBanner({
  detail,
  title,
  tone = "info",
  value
}: {
  detail?: string;
  title: string;
  tone?: "healthy" | "warning" | "critical" | "info";
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/80 p-3 shadow-apple-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 whitespace-normal break-normal text-sm font-semibold text-foreground">
            {value}
          </p>
          {detail ? (
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          ) : null}
        </div>
        <StatusChip tone={tone} className="shrink-0">
          {tone === "healthy"
            ? t("status.healthy")
            : tone === "warning"
              ? t("status.warning")
              : tone === "critical"
                ? t("status.critical")
                : t("status.info")}
        </StatusChip>
      </div>
    </div>
  );
}

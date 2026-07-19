"use client";

import Link from "next/link";
import { Plus, ScanLine } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { OperationalContextBanner, useOperationalDemo } from "@/components/app/operational-demo-state";
import { BottomActionBar, BottomActionGroup, PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui";
import { t } from "@/localization";
import { useCurrentAuthorization } from "@/components/app/current-authorization-provider";

export default function PosPage() {
  const { state, completeAction } = useOperationalDemo();
  const { defaultRoute, hasPermission } = useCurrentAuthorization();
  const canCompleteReview =
    hasPermission("pos:operate") &&
    hasPermission("operational-demo:advance");
  const categories = [t("pages.pos.combos"), t("pages.pos.burgers"), t("pages.pos.sides"), t("pages.pos.drinks")];

  return (
    <>
      <PageHeading
        eyebrow={t("pages.pos.eyebrow")}
        title={t("pages.pos.title")}
        description={t("pages.pos.description")}
        actions={<StatusChip tone={state.shiftStatus === "completed" ? "ready" : "live"}>{state.shiftStatus === "completed" ? t("pages.pos.reviewComplete") : t("pages.pos.shiftOpen")}</StatusChip>}
      />
      <PageSection className="space-y-3 px-4 pb-4 sm:px-6 lg:px-8">
        <OperationalContextBanner
          title={t("pages.pos.currentMission")}
          value={state.currentMission}
          detail={state.helperText}
          tone={state.shiftStatus === "completed" ? "healthy" : "info"}
        />
        <div className="rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{t("pages.pos.openedFrom")} {state.openedFrom}</p>
          <p className="mt-1">{state.posQueueCount === 0 ? t("pages.pos.queueClear") : t("pages.pos.queueActive")}</p>
        </div>
      </PageSection>
      <PageSection className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Button key={category} variant="secondary" className="h-16 justify-start">
              <Plus className="size-4" />
              {category}
            </Button>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.pos.currentOrder")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-surface p-4 text-sm text-muted-foreground">
              {state.posQueueCount === 0
                ? t("pages.pos.noOrder")
                : t("pages.pos.queueRemaining", { count: state.posQueueCount })}
            </div>
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>{t("pages.pos.total")}</span>
              <span>${state.posQueueCount === 0 ? "0.00" : "24.00"}</span>
            </div>
          </CardContent>
        </Card>
      </PageSection>
      <BottomActionBar>
        <BottomActionGroup>
          <Button variant="secondary"><ScanLine className="size-4" /> {t("pages.pos.scan")}</Button>
          {canCompleteReview ? (
            <Button asChild onClick={() => completeAction("complete-refund-review")}>
              <Link href={hasPermission("dashboard:view") ? "/dashboard" : defaultRoute}>{t("pages.pos.finishReview")}</Link>
            </Button>
          ) : null}
        </BottomActionGroup>
      </BottomActionBar>
    </>
  );
}

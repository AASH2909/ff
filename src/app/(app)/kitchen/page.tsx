"use client";

import Link from "next/link";
import { ChefHat, Timer } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { OperationalContextBanner } from "@/components/app/operational-context-banner";
import { useKitchenState } from "@/components/app/application-state-provider";
import { PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/localization";

export default function KitchenPage() {
  const state = useKitchenState();
  const baseLanes = [
    { title: t("pages.kitchen.new"), tone: "live" as const, count: 6 },
    { title: t("pages.kitchen.cooking"), tone: "rush" as const, count: 11 },
    { title: t("pages.kitchen.ready"), tone: "ready" as const, count: 4 }
  ];
  const lanes =
    state.kitchenLoad === "steady"
      ? [
          { title: t("pages.kitchen.ready"), tone: "ready" as const, count: 0 },
          { title: t("pages.kitchen.prep"), tone: "live" as const, count: state.kitchenOrderCount },
          { title: t("pages.kitchen.closed"), tone: "neutral" as const, count: 1 }
        ]
      : baseLanes;

  return (
    <>
      <PageHeading
        eyebrow={t("pages.kitchen.eyebrow")}
        title={t("pages.kitchen.title")}
        description={t("pages.kitchen.description")}
        actions={<StatusChip tone={state.kitchenLoad === "steady" ? "ready" : "rush"}><Timer className="size-3.5" /> {state.kitchenLoad === "steady" ? t("status.steady") : t("status.rush")}</StatusChip>}
      />
      <PageSection className="space-y-3 px-4 pb-4 sm:px-6 lg:px-8">
        <OperationalContextBanner
          title={t("pages.kitchen.currentMission")}
          value={t(state.missionKey)}
          detail={t(state.helperKey)}
          tone={state.inventoryVariance === "healthy" ? "healthy" : "warning"}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/70 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{t("common.openedFrom")} {t(state.openedFromKey)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("pages.kitchen.handoff")}</p>
          </div>
          <Button asChild size="sm">
            <Link href="/inventory">{t("pages.kitchen.continueInventory")}</Link>
          </Button>
        </div>
      </PageSection>
      <PageSection className="grid gap-3 lg:grid-cols-3">
        {lanes.map((lane) => (
          <Card key={lane.title}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{lane.title}</span>
                <StatusChip tone={lane.tone}>{lane.count}</StatusChip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-40 flex-col items-center justify-center rounded-md bg-surface px-4 text-center text-sm text-muted-foreground">
                <ChefHat className="mb-2 size-4" />
                {state.kitchenLoad === "steady"
                  ? t("pages.kitchen.emptySteady")
                  : t("pages.kitchen.emptyRush")}
              </div>
            </CardContent>
          </Card>
        ))}
      </PageSection>
    </>
  );
}

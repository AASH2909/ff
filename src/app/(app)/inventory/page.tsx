"use client";

import Link from "next/link";
import { PackageCheck, TriangleAlert } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { OperationalContextBanner, useOperationalDemo } from "@/components/app/operational-demo-state";
import { MetricTile, PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/localization";
import { useCurrentAuthorization } from "@/components/app/current-authorization-provider";

export default function InventoryPage() {
  const { state, completeAction } = useOperationalDemo();
  const { defaultRoute, hasPermission } = useCurrentAuthorization();
  const canAudit =
    hasPermission("inventory:audit") &&
    hasPermission("operational-demo:advance");
  const canOpenPos = hasPermission("pos:view");

  return (
    <>
      <PageHeading
        eyebrow={t("pages.inventory.eyebrow")}
        title={t("pages.inventory.title")}
        description={t("pages.inventory.description")}
        actions={canAudit ? <Button size="sm" variant="secondary" asChild onClick={() => completeAction("complete-inventory-audit")}><Link href={canOpenPos ? "/pos" : defaultRoute}>{canOpenPos ? t("pages.inventory.openPos") : t("pages.inventory.completeAudit")}</Link></Button> : undefined}
      />
      <PageSection className="space-y-3 px-4 pb-4 sm:px-6 lg:px-8">
        <OperationalContextBanner
          title={t("pages.inventory.currentMission")}
          value={state.currentMission}
          detail={state.helperText}
          tone={state.inventoryVariance === "healthy" ? "healthy" : "warning"}
        />
        <div className="rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{t("pages.inventory.openedFrom")} {state.openedFrom}</p>
          <p className="mt-1">{state.inventoryVariance === "healthy" ? t("pages.inventory.stableNext") : t("pages.inventory.pressureNext")}</p>
        </div>
      </PageSection>
      <PageSection className="grid gap-3 sm:grid-cols-3">
        <MetricTile label={t("pages.inventory.inStock")} value="142" helper={t("pages.inventory.itemsAvailable")} trend={<PackageCheck className="size-5 text-success" />} />
        <MetricTile label={t("pages.inventory.lowStock")} value={state.inventoryVariance === "healthy" ? "4" : "9"} helper={t("pages.inventory.needsReorder")} trend={<TriangleAlert className="size-5 text-warning" />} />
        <MetricTile label={t("pages.inventory.unavailable")} value={state.inventoryVariance === "healthy" ? "2" : "3"} helper={t("pages.inventory.hiddenPos")} trend={<StatusChip tone="blocked">{t("status.blocked")}</StatusChip>} />
      </PageSection>
      <PageSection>
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.inventory.watchlist")}</CardTitle>
          </CardHeader>
          <CardContent className="rounded-md bg-surface p-4 text-sm text-muted-foreground">
            {state.inventoryVariance === "healthy"
              ? t("pages.inventory.emptyHealthy")
              : t("pages.inventory.emptyWarning")}
          </CardContent>
        </Card>
      </PageSection>
    </>
  );
}

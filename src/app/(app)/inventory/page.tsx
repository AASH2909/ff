"use client";

import Link from "next/link";
import { PackageCheck, TriangleAlert } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { OperationalContextBanner, useOperationalDemo } from "@/components/app/operational-demo-state";
import { MetricTile, PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function InventoryPage() {
  const { state, completeAction } = useOperationalDemo();

  return (
    <>
      <PageHeading
        eyebrow="Stock"
        title="Inventory"
        description="Track availability, low stock, and prep-critical ingredients."
        actions={<Button size="sm" variant="secondary" asChild onClick={() => completeAction("complete-inventory-audit")}><Link href="/pos">Open POS review</Link></Button>}
      />
      <PageSection className="space-y-3 px-4 pb-4 sm:px-6 lg:px-8">
        <OperationalContextBanner
          title="Current mission"
          value={state.currentMission}
          detail={state.helperText}
          tone={state.inventoryVariance === "healthy" ? "healthy" : "warning"}
        />
        <div className="rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Opened from: {state.openedFrom}</p>
          <p className="mt-1">The watched ingredients are {state.inventoryVariance === "healthy" ? "stable" : "under pressure"}; the next move is to review the refund queue at POS.</p>
        </div>
      </PageSection>
      <PageSection className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="In stock" value="142" helper="Items available" trend={<PackageCheck className="size-5 text-success" />} />
        <MetricTile label="Low stock" value={state.inventoryVariance === "healthy" ? "4" : "9"} helper="Needs reorder" trend={<TriangleAlert className="size-5 text-warning" />} />
        <MetricTile label="Unavailable" value={state.inventoryVariance === "healthy" ? "2" : "3"} helper="Hidden from POS" trend={<StatusChip tone="blocked">Blocked</StatusChip>} />
      </PageSection>
      <PageSection>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="rounded-md bg-surface p-4 text-sm text-muted-foreground">
            {state.inventoryVariance === "healthy"
              ? "All watched ingredients are healthy. The next move is to review the refund queue at POS."
              : "Watchlist items need immediate attention. The next move is to stabilize the line before the close review."}
          </CardContent>
        </Card>
      </PageSection>
    </>
  );
}

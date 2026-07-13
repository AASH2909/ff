"use client";

import Link from "next/link";
import { ChefHat, Timer } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { OperationalContextBanner, useOperationalDemo } from "@/components/app/operational-demo-state";
import { PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const baseLanes = [
  { title: "New", tone: "live" as const, count: 6 },
  { title: "Cooking", tone: "rush" as const, count: 11 },
  { title: "Ready", tone: "ready" as const, count: 4 }
];

export default function KitchenPage() {
  const { state } = useOperationalDemo();
  const lanes =
    state.kitchenLoad === "steady"
      ? [
          { title: "Ready", tone: "ready" as const, count: 0 },
          { title: "Prep", tone: "live" as const, count: 2 },
          { title: "Closed", tone: "neutral" as const, count: 1 }
        ]
      : baseLanes;

  return (
    <>
      <PageHeading
        eyebrow="Kitchen Display"
        title="Kitchen"
        description="Compact preparation lanes for orders moving from received to ready."
        actions={<StatusChip tone={state.kitchenLoad === "steady" ? "ready" : "rush"}><Timer className="size-3.5" /> {state.kitchenLoad === "steady" ? "Steady" : "Rush"}</StatusChip>}
      />
      <PageSection className="space-y-3 px-4 pb-4 sm:px-6 lg:px-8">
        <OperationalContextBanner
          title="Current mission"
          value={state.currentMission}
          detail={state.helperText}
          tone={state.inventoryVariance === "healthy" ? "healthy" : "warning"}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/70 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Opened from: {state.openedFrom}</p>
            <p className="mt-1 text-sm text-muted-foreground">The next handoff is to inventory and the refund queue.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/inventory">Continue to inventory</Link>
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
                  ? "No active kitchen orders. The next step is to confirm inventory health and clear the refund queue."
                  : "Orders will appear here once the evening rush stabilizes."}
              </div>
            </CardContent>
          </Card>
        ))}
      </PageSection>
    </>
  );
}

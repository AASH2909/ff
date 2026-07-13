"use client";

import Link from "next/link";
import { Plus, ScanLine } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { OperationalContextBanner, useOperationalDemo } from "@/components/app/operational-demo-state";
import { BottomActionBar, BottomActionGroup, PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui";

const categories = ["Combos", "Burgers", "Sides", "Drinks"];

export default function PosPage() {
  const { state, completeAction } = useOperationalDemo();

  return (
    <>
      <PageHeading
        eyebrow="Checkout"
        title="POS"
        description="Fast order entry surface for front counter and cashier workflows."
        actions={<StatusChip tone={state.shiftStatus === "completed" ? "ready" : "live"}>{state.shiftStatus === "completed" ? "Review complete" : "Shift open"}</StatusChip>}
      />
      <PageSection className="space-y-3 px-4 pb-4 sm:px-6 lg:px-8">
        <OperationalContextBanner
          title="Current mission"
          value={state.currentMission}
          detail={state.helperText}
          tone={state.shiftStatus === "completed" ? "healthy" : "info"}
        />
        <div className="rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Opened from: {state.openedFrom}</p>
          <p className="mt-1">The checkout queue is {state.posQueueCount === 0 ? "clear" : "still active"}; the next move is to finish the review and return to the dashboard.</p>
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
            <CardTitle>Current Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-surface p-4 text-sm text-muted-foreground">
              {state.posQueueCount === 0
                ? "No current order. The next step is to finish the refund review and hand off the shift."
                : `Queue items are ready for review. ${state.posQueueCount} refund items remain to clear.`}
            </div>
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>${state.posQueueCount === 0 ? "0.00" : "24.00"}</span>
            </div>
          </CardContent>
        </Card>
      </PageSection>
      <BottomActionBar>
        <BottomActionGroup>
          <Button variant="secondary"><ScanLine className="size-4" /> Scan</Button>
          <Button asChild onClick={() => completeAction("complete-refund-review")}>
            <Link href="/dashboard">Finish review</Link>
          </Button>
        </BottomActionGroup>
      </BottomActionBar>
    </>
  );
}

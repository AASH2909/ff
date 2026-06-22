import { ChefHat, Timer } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { PageSection, StatusChip } from "@/components/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const lanes = [
  { title: "New", tone: "live" as const, count: 6 },
  { title: "Cooking", tone: "rush" as const, count: 11 },
  { title: "Ready", tone: "ready" as const, count: 4 }
];

export default function KitchenPage() {
  return (
    <>
      <PageHeading
        eyebrow="Kitchen Display"
        title="Kitchen"
        description="Compact preparation lanes for orders moving from received to ready."
        actions={<StatusChip tone="rush"><Timer className="size-3.5" /> Rush</StatusChip>}
      />
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
              <div className="flex min-h-40 items-center justify-center rounded-md bg-surface text-sm text-muted-foreground">
                <ChefHat className="mr-2 size-4" />
                Orders will appear here.
              </div>
            </CardContent>
          </Card>
        ))}
      </PageSection>
    </>
  );
}

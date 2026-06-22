import { ClipboardList, PackageCheck, TriangleAlert } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { MetricTile, PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function InventoryPage() {
  return (
    <>
      <PageHeading
        eyebrow="Stock"
        title="Inventory"
        description="Track availability, low stock, and prep-critical ingredients."
        actions={<Button size="sm" variant="secondary"><ClipboardList className="size-4" /> Count</Button>}
      />
      <PageSection className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="In stock" value="142" helper="Items available" trend={<PackageCheck className="size-5 text-success" />} />
        <MetricTile label="Low stock" value="9" helper="Needs reorder" trend={<TriangleAlert className="size-5 text-warning" />} />
        <MetricTile label="Unavailable" value="3" helper="Hidden from POS" trend={<StatusChip tone="blocked">Blocked</StatusChip>} />
      </PageSection>
      <PageSection>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="rounded-md bg-surface p-4 text-sm text-muted-foreground">
            Low-stock ingredient rows will be shown here.
          </CardContent>
        </Card>
      </PageSection>
    </>
  );
}

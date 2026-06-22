import { Plus, ScanLine } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { BottomActionBar, BottomActionGroup, PageSection, StatusChip } from "@/components/design-system";
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui";

const categories = ["Combos", "Burgers", "Sides", "Drinks"];

export default function PosPage() {
  return (
    <>
      <PageHeading
        eyebrow="Checkout"
        title="POS"
        description="Fast order entry surface for front counter and cashier workflows."
        actions={<StatusChip tone="live">Shift open</StatusChip>}
      />
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
              No items added yet.
            </div>
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>$0.00</span>
            </div>
          </CardContent>
        </Card>
      </PageSection>
      <BottomActionBar>
        <BottomActionGroup>
          <Button variant="secondary"><ScanLine className="size-4" /> Scan</Button>
          <Button>Checkout</Button>
        </BottomActionGroup>
      </BottomActionBar>
    </>
  );
}

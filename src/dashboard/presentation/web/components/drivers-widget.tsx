import { MinusCircle, PlusCircle } from "lucide-react";
import type { DashboardInsightDto } from "@/dashboard/application/dtos";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { EmptyState } from "@/components/design-system";
import {
  formatContribution,
  insightVariant,
  titleCase
} from "@/dashboard/presentation/web/utils/dashboard-formatters";

type DriversWidgetProps = {
  title: string;
  type: "positive" | "negative";
  drivers: DashboardInsightDto[];
};

export function DriversWidget({ title, type, drivers }: DriversWidgetProps) {
  const icon = type === "positive" ? <PlusCircle /> : <MinusCircle />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <EmptyState
            icon={icon}
            title="No drivers"
            description="No score drivers were returned for this scope."
            className="min-h-56"
          />
        ) : (
          <div className="space-y-3">
            {drivers.map((driver) => (
              <DriverItem key={driver.id} driver={driver} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DriverItem({ driver }: { driver: DashboardInsightDto }) {
  return (
    <article className="rounded-md border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{driver.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {driver.description}
          </p>
        </div>
        <Badge variant={insightVariant(driver.type)} className="shrink-0">
          {formatContribution(driver.contribution)}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline">{titleCase(driver.type)}</Badge>
        <Badge variant="secondary">{titleCase(driver.severity)}</Badge>
        {driver.domainCode ? <Badge variant="outline">{driver.domainCode}</Badge> : null}
      </div>
    </article>
  );
}

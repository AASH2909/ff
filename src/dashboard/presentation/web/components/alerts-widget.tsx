import { BellRing } from "lucide-react";
import type { DashboardAlertDto } from "@/dashboard/application/dtos";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { EmptyState } from "@/components/design-system";
import {
  formatDateTime,
  severityVariant,
  titleCase
} from "@/dashboard/presentation/web/utils/dashboard-formatters";

type AlertsWidgetProps = {
  alerts: DashboardAlertDto[];
};

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Active Alerts</CardTitle>
          <Badge variant="secondary">{alerts.length} active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <EmptyState
            icon={<BellRing />}
            title="No active alerts"
            description="No active dashboard alerts were returned for this scope."
            className="min-h-64"
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AlertItem({ alert }: { alert: DashboardAlertDto }) {
  return (
    <article className="rounded-md border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{alert.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{alert.message}</p>
        </div>
        <Badge variant={severityVariant(alert.severity)} className="shrink-0">
          {titleCase(alert.severity)}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{titleCase(alert.source)}</Badge>
        {alert.domainCode ? <Badge variant="outline">{alert.domainCode}</Badge> : null}
        <span>{formatDateTime(alert.occurredAt)}</span>
      </div>
    </article>
  );
}

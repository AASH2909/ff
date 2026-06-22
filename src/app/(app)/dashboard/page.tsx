import { Clock, Flame, ReceiptText, TrendingUp } from "lucide-react";
import { PageHeading } from "@/components/app/page-heading";
import { MetricTile, PageSection, StatusChip } from "@/components/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { DashboardStatusTone } from "@/repositories/interfaces/dashboard-repository";
import { createServerRepositories } from "@/repositories/server";

function getMetricIcon(tone: DashboardStatusTone) {
  if (tone === "ready") {
    return <TrendingUp className="size-5 text-success" />;
  }

  if (tone === "rush") {
    return <Flame className="size-5 text-warning" />;
  }

  if (tone === "live") {
    return <StatusChip tone="live">Live</StatusChip>;
  }

  return <Clock className="size-5 text-primary" />;
}

export default async function DashboardPage() {
  const { dashboardRepository } = await createServerRepositories();
  const overview = await dashboardRepository.getOverview();

  return (
    <>
      <PageHeading
        eyebrow="Today"
        title="Dashboard"
        description="Live operating snapshot for orders, speed, kitchen load, and sales."
      />
      <PageSection className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <MetricTile
            key={metric.label}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
            trend={getMetricIcon(metric.tone)}
          />
        ))}
      </PageSection>
      <PageSection>
        <Card>
          <CardHeader>
            <CardTitle>Operations Queue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {overview.queueStatuses.map((status) => (
              <StatusChip key={status.label} tone={status.tone}>
                {status.tone === "live" ? <ReceiptText className="size-3.5" /> : null}
                {status.label}
              </StatusChip>
            ))}
          </CardContent>
        </Card>
      </PageSection>
    </>
  );
}

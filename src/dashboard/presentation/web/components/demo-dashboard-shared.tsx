import { ClipboardCheck, PackageOpen, Users } from "lucide-react";
import { MetricTile, StatusChip } from "@/components/design-system";
import { Badge } from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

type MetricData = (typeof demoDashboardData.metrics)[number];
type SummaryFactData = (typeof demoDashboardData.executiveSummary.facts)[number];
type ScoreFactorData = (typeof demoDashboardData.controlScore.factors)[number];

export function DemoMetricsRow() {
  const { metrics } = demoDashboardData;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {metrics.map((metric) => (
        <MetricTile
          key={metric.label}
          label={metric.label}
          value={metric.value}
          helper={metric.helper}
          trend={<DemoMetricTrend metric={metric} />}
        />
      ))}
    </div>
  );
}

export function DemoSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-surface px-3 py-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function DemoSummaryFact({ fact }: { fact: SummaryFactData }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="text-muted-foreground [&_svg]:size-4">
        <DemoSummaryIcon icon={fact.icon} />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">{fact.label}</p>
      <p className="mt-1 text-sm font-semibold">{fact.value}</p>
    </div>
  );
}

export function DemoScoreFactor({ factor }: { factor: ScoreFactorData }) {
  return (
    <div className="rounded-sm bg-surface p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold uppercase text-muted-foreground">
          {factor.label}
        </p>
        <StatusChip tone={factor.tone} className="h-6 px-2">
          {factor.value}
        </StatusChip>
      </div>
    </div>
  );
}

function DemoMetricTrend({ metric }: { metric: MetricData }) {
  if ("status" in metric && "tone" in metric) {
    return <StatusChip tone={metric.tone}>{metric.status}</StatusChip>;
  }

  if ("badge" in metric && "variant" in metric) {
    return <Badge variant={metric.variant}>{metric.badge}</Badge>;
  }

  return null;
}

function DemoSummaryIcon({ icon }: { icon: SummaryFactData["icon"] }) {
  if (icon === "package") {
    return <PackageOpen aria-hidden="true" />;
  }

  if (icon === "users") {
    return <Users aria-hidden="true" />;
  }

  return <ClipboardCheck aria-hidden="true" />;
}

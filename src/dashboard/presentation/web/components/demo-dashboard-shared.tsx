import { ClipboardCheck, PackageOpen, Users } from "lucide-react";
import { StatusChip } from "@/components/design-system";
import { Badge, Card, CardContent } from "@/components/ui";
import { getDemoDashboardData, type DemoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

type AttentionSignalData = DemoDashboardData["attentionSignals"][number];
type SummaryFactData = DemoDashboardData["executiveSummary"]["facts"][number];
type ScoreFactorData = DemoDashboardData["controlScore"]["factors"][number];

export function DemoMetricsRow() {
  const { attentionSignals } = getDemoDashboardData();

  return (
    <div className="flex min-w-0 gap-3 overflow-x-auto pb-2">
      {attentionSignals.map((signal) => (
        <div key={signal.title} className="min-w-[240px] shrink-0 flex-1">
          <ExecutiveSignal signal={signal} />
        </div>
      ))}
    </div>
  );
}

function ExecutiveSignal({ signal }: { signal: AttentionSignalData }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">{signal.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {signal.sentence}
            </p>
          </div>
          <Badge variant="outline" className="w-fit shrink-0">
            {signal.severity}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function DemoSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-sm bg-surface px-3 py-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function DemoSummaryFact({ fact }: { fact: SummaryFactData }) {
  return (
    <div className="min-w-0 rounded-md border bg-background p-3">
      <div className="text-muted-foreground [&_svg]:size-4">
        <DemoSummaryIcon icon={fact.icon} />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
        {fact.label}
      </p>
      <p className="mt-1 text-sm font-semibold">{fact.value}</p>
    </div>
  );
}

export function DemoScoreFactor({ factor }: { factor: ScoreFactorData }) {
  return (
    <div className="min-w-0 rounded-sm bg-surface p-2">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-semibold uppercase text-muted-foreground">
          {factor.label}
        </p>
        <StatusChip tone={factor.tone} className="h-6 px-2">
          {factor.value}
        </StatusChip>
      </div>
    </div>
  );
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

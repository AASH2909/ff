import { Activity, Gauge } from "lucide-react";
import { useOperationalDemo } from "@/components/app/operational-demo-state";
import { StatusChip } from "@/components/design-system";
import { Card, CardContent, Progress } from "@/components/ui";

export function DemoExecutiveHeroCard() {
  const { state } = useOperationalDemo();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5 lg:p-6">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-stretch">
          <section
            className="min-w-0 rounded-md border bg-background p-5"
            aria-labelledby="demo-executive-hero-title"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Activity className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase text-muted-foreground">Restaurant Health</p>
            </div>
            <h2
              id="demo-executive-hero-title"
              className="mt-3 truncate text-3xl font-semibold tracking-normal sm:text-4xl"
            >
              Harbor & Pine
            </h2>

            <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
              <HeroMetric
                label="Overall Health"
                value={state.inventoryVariance === "healthy" ? "Service steady" : "Service pressure building"}
                highlight
              />
              <HeroMetric label="Risk Level" value={state.inventoryVariance === "healthy" ? "Low" : "Moderate Risk"} />
              <HeroMetric label="Daily Delta" value={state.controlScore >= 70 ? "▲ 8 today" : "▼ 9 since lunch"} />
            </div>
          </section>

          <aside className="min-w-0 rounded-md border bg-surface p-4" aria-label="Control score">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Control Score</p>
                <p className="mt-2 text-5xl font-semibold tracking-normal">{state.controlScore}</p>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-full border bg-background">
                <Gauge className="size-5 text-primary" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex min-w-0 flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">{state.recommendationStage === "completed" ? "Steady" : "At risk"}</span>
                <span className="text-muted-foreground">{state.controlScore} / 100</span>
              </div>
              <Progress value={state.controlScore} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <ScoreMeta label="Daily Delta" value={state.controlScore >= 70 ? "▲ 8 today" : "▼ 9 since lunch"} />
              <ScoreMeta label="Risk Level" value={state.inventoryVariance === "healthy" ? "Low" : "Moderate Risk"} />
              <ScoreMeta label="Last update" value="Now" />
            </div>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}

function HeroMetric({
  highlight = false,
  label,
  value
}: {
  highlight?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-sm bg-surface px-3 py-2">
      <p className="truncate text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      {highlight ? (
        <StatusChip tone="rush" className="mt-2 w-fit max-w-full whitespace-nowrap text-left">
          {value}
        </StatusChip>
      ) : (
        <p className="mt-2 truncate text-sm font-semibold">{value}</p>
      )}
    </div>
  );
}

function ScoreMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-sm bg-background px-3 py-2">
      <p className="truncate text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

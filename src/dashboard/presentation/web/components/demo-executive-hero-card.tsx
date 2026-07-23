import { Activity, Gauge } from "lucide-react";
import { useDashboardState } from "@/components/app/application-state-provider";
import { StatusChip } from "@/components/design-system";
import { Card, CardContent, Progress } from "@/components/ui";
import { t } from "@/localization";

export function DemoExecutiveHeroCard() {
  const state = useDashboardState();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5 lg:p-6">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-stretch">
          <section
            className="min-w-0 rounded-md border bg-background p-5"
            aria-labelledby="demo-executive-hero-title"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Activity className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase text-muted-foreground">{t("dashboard.restaurantHealth")}</p>
            </div>
            <h2
              id="demo-executive-hero-title"
              className="mt-3 truncate text-3xl font-semibold tracking-normal sm:text-4xl"
            >
              Harbor & Pine
            </h2>

            <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))]">
              <HeroMetric
                label={t("dashboard.overallHealth")}
                value={state.inventoryVariance === "healthy" ? t("dashboard.serviceSteady") : t("dashboard.servicePressure")}
                highlight
              />
              <HeroMetric label={t("dashboard.riskLevel")} value={state.inventoryVariance === "healthy" ? t("dashboard.low") : t("dashboard.moderateRisk")} />
               <HeroMetric label={t("dashboard.dailyDelta")} value={state.controlScore >= 70 ? t("dashboard.demo.dailyDeltaImproved", { delta: state.controlScoreDelta }) : t("dashboard.demo.dailyDeltaValue", { delta: 9 })} />
            </div>
          </section>

          <aside className="min-w-0 rounded-md border bg-surface p-4" aria-label={t("dashboard.controlScore")}>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{t("dashboard.controlScore")}</p>
                <p className="mt-2 text-5xl font-semibold tracking-normal">{state.controlScore}</p>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-full border bg-background">
                <Gauge className="size-5 text-primary" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex min-w-0 flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">{state.recommendationStage === "completed" ? t("status.steady") : t("dashboard.atRisk")}</span>
                <span className="text-muted-foreground">{state.controlScore} / 100</span>
              </div>
              <Progress value={state.controlScore} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
               <ScoreMeta label={t("dashboard.dailyDelta")} value={state.controlScore >= 70 ? t("dashboard.demo.dailyDeltaImproved", { delta: state.controlScoreDelta }) : t("dashboard.demo.dailyDeltaValue", { delta: 9 })} />
              <ScoreMeta label={t("dashboard.riskLevel")} value={state.inventoryVariance === "healthy" ? t("dashboard.low") : t("dashboard.moderateRisk")} />
              <ScoreMeta label={t("dashboard.lastUpdate")} value={t("dashboard.now")} />
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
        <StatusChip
          tone="rush"
          dot={false}
          className="mt-2 flex h-auto min-h-8 w-full min-w-0 max-w-full items-start whitespace-normal break-normal py-1 text-left leading-5"
        >
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
          <span className="min-w-0 flex-1 whitespace-normal break-normal">{value}</span>
        </StatusChip>
      ) : (
        <p className="mt-2 whitespace-normal break-normal text-sm font-semibold">{value}</p>
      )}
    </div>
  );
}

function ScoreMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-sm bg-background px-3 py-2">
      <p className="truncate text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-normal break-normal text-sm font-semibold">{value}</p>
    </div>
  );
}

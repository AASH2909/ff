import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getDemoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";
import { t } from "@/localization";

export function DemoIntelligenceJourneyCard() {
  const { intelligenceJourney } = getDemoDashboardData();

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">{t("dashboard.signalChain")}</CardTitle>
            <CardDescription>{t("dashboard.signalChainDescription")}</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit shrink-0">
            {t("dashboard.connected")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ol
          className="flex min-w-0 snap-x gap-3 overflow-x-auto pb-2"
          aria-label={t("dashboard.signalChainDescription")}
        >
          {intelligenceJourney.map((step, index) => (
            <li key={step.label} className="relative w-64 min-w-64 snap-start">
              <article className="flex h-full min-h-36 min-w-0 flex-col rounded-md border bg-background p-3">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {t("dashboard.step")} {index + 1}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold">{step.label}</h3>
                  </div>
                  <Badge variant="outline" className="w-fit shrink-0">
                    {step.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.explanation}
                </p>
              </article>
              {index < intelligenceJourney.length - 1 ? (
                <div
                  className="absolute -right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center bg-card px-1 text-xs font-semibold text-muted-foreground"
                  aria-hidden="true"
                >
                  <span aria-hidden="true">-&gt;</span>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

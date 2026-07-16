import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";
import { t } from "@/localization";

export function DemoTopRisksCard() {
  const { risks } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <CardTitle className="text-base">{t("dashboard.topRisks")}</CardTitle>
          <Badge variant="outline" className="shrink-0">
            {risks.length} {t("dashboard.active")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk) => (
          <article key={risk.title} className="min-w-0 rounded-md border bg-background p-3">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{risk.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {risk.description}
                </p>
              </div>
              <Badge variant="outline" className="w-fit shrink-0">
                {risk.severity}
              </Badge>
            </div>
            <Progress value={risk.progress} className="mt-3" />
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

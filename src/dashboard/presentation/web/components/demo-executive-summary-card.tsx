import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { DemoSummaryFact } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { getDemoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";
import { t } from "@/localization";

export function DemoExecutiveSummaryCard() {
  const { executiveSummary } = getDemoDashboardData();

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{t("dashboard.executiveSummary")}</CardTitle>
            <CardDescription>{executiveSummary.context}</CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit shrink-0">
            {executiveSummary.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {executiveSummary.description}
        </p>
        <div className="space-y-2">
          {executiveSummary.signals.map((signal) => (
            <div key={signal} className="flex min-w-0 items-start gap-2 rounded-md bg-surface p-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <p className="min-w-0 text-sm font-medium">{signal}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {executiveSummary.facts.map((fact) => (
            <DemoSummaryFact key={fact.label} fact={fact} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

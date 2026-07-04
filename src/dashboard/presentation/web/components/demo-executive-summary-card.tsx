import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { DemoSummaryFact } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoExecutiveSummaryCard() {
  const { executiveSummary } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>{executiveSummary.context}</CardDescription>
          </div>
          <Badge variant="secondary">{executiveSummary.badge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{executiveSummary.description}</p>
        <div className="space-y-2">
          {executiveSummary.signals.map((signal) => (
            <div key={signal} className="flex items-start gap-2 rounded-md bg-surface p-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <p className="text-sm font-medium">{signal}</p>
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

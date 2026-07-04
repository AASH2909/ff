import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoTopRisksCard() {
  const { risks } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Top Risks</CardTitle>
          <Badge variant="destructive">{risks.length} active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk) => (
          <article key={risk.title} className="rounded-md border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{risk.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{risk.description}</p>
              </div>
              <Badge variant={risk.variant} className="shrink-0">
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

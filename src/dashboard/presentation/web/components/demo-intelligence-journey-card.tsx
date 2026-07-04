import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoIntelligenceJourneyCard() {
  const { intelligenceJourney } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Intelligence Journey</CardTitle>
            <CardDescription>
              How CONTROL OS connects signals, context, prediction, timeline, decision, and Copilot
              explanation.
            </CardDescription>
          </div>
          <Badge variant="secondary">Connected flow</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ol
          className="grid gap-3 lg:grid-cols-6"
          aria-label="Demo intelligence journey from risk signal to Copilot explanation"
        >
          {intelligenceJourney.map((step, index) => (
            <li key={step.label} className="relative">
              <article className="flex h-full min-h-36 flex-col rounded-md border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold">{step.label}</h3>
                  </div>
                  <Badge variant={step.variant} className="shrink-0">
                    {step.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.explanation}</p>
              </article>
              {index < intelligenceJourney.length - 1 ? (
                <div
                  className="flex items-center justify-center py-1 text-xs font-semibold uppercase text-muted-foreground lg:absolute lg:-right-3 lg:top-1/2 lg:z-10 lg:-translate-y-1/2 lg:bg-card lg:px-1 lg:py-0"
                  aria-hidden="true"
                >
                  <span className="lg:hidden">Next</span>
                  <span className="hidden lg:inline">-&gt;</span>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

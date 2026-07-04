import { ClipboardCheck } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui";
import { DemoSignal } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoDecisionPreviewCard() {
  const { recommendation } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Decision Preview</CardTitle>
          <ClipboardCheck className="size-5 text-success" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border bg-background p-3">
          <Badge variant="success">Recommended</Badge>
          <h3 className="mt-3 text-sm font-semibold">{recommendation.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {recommendation.description}
          </p>
        </div>
        <div className="rounded-md border bg-background p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">Confidence</span>
            <Badge variant="success">{recommendation.confidence}%</Badge>
          </div>
          <Progress value={recommendation.confidence} className="mt-3" />
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-1">
          <DemoSignal label="Expected impact" value={recommendation.expectedImpact} />
          <DemoSignal label="Primary owner" value={recommendation.owner} />
        </div>
      </CardContent>
    </Card>
  );
}

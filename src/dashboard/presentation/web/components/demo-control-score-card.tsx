import { Gauge } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress
} from "@/components/ui";
import { DemoScoreFactor } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoControlScoreCard() {
  const { controlScore } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Control Score</CardTitle>
            <CardDescription>{controlScore.description}</CardDescription>
          </div>
          <Badge variant="warning">{controlScore.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-full border bg-surface">
            <Gauge className="size-8 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-4xl font-semibold tracking-normal">{controlScore.value}</p>
            <p className="text-sm text-muted-foreground">{controlScore.helper}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{controlScore.coverageLabel}</span>
            <span className="text-muted-foreground">{controlScore.coverageValueLabel}</span>
          </div>
          <Progress value={controlScore.numericValue} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {controlScore.factors.map((factor) => (
            <DemoScoreFactor key={factor.label} factor={factor} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

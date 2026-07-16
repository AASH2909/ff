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
import { t } from "@/localization";

export function DemoControlScoreCard() {
  const { controlScore } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">{t("dashboard.controlFactors")}</CardTitle>
            <CardDescription>{controlScore.description}</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit shrink-0">
            {controlScore.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-full border bg-surface">
            <Gauge className="size-8 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-4xl font-semibold tracking-normal">{controlScore.value}</p>
            <p className="text-sm text-muted-foreground">{controlScore.helper}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
            <span className="min-w-0 font-medium">{controlScore.coverageLabel}</span>
            <span className="shrink-0 text-muted-foreground">{controlScore.coverageValueLabel}</span>
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

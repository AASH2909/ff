import { AlertTriangle } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress
} from "@/components/ui";
import { DemoSignal } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoPredictionPreviewCard() {
  const { prediction } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Risk Forecast</CardTitle>
            <CardDescription>{prediction.description}</CardDescription>
          </div>
          <AlertTriangle className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-w-0 rounded-md border bg-background p-3">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 text-sm font-semibold">
              {prediction.probabilityLabel}
            </p>
            <Badge variant="outline" className="w-fit shrink-0">
              {prediction.probabilityDisplay}
            </Badge>
          </div>
          <Progress value={prediction.probability} className="mt-3" />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {prediction.explanation}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {prediction.signals.map((signal) => (
            <DemoSignal key={signal.label} label={signal.label} value={signal.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

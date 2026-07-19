import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { useOperationalDemo } from "@/components/app/operational-demo-state";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui";
import { DemoSignal } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { t } from "@/localization";
import { useCurrentAuthorization } from "@/components/app/current-authorization-provider";

export function DemoDecisionPreviewCard() {
  const { state, completeAction } = useOperationalDemo();
  const { hasPermission } = useCurrentAuthorization();
  const actionCompleted = state.recommendationStage === "completed";
  const canAdvance =
    hasPermission("kitchen:operate") &&
    hasPermission("operational-demo:advance");

  return (
    <Card className="border-primary/50 bg-surface shadow-apple-sm">
      <CardHeader>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-xl">{t("dashboard.nextBestAction")}</CardTitle>
          </div>
          <Badge variant="success" className="w-fit shrink-0">
            {state.recommendationStage === "completed" ? t("dashboard.completed") : t("dashboard.controlScorePoints")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-5 p-5 pt-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0 space-y-5">
          <div className="min-w-0 rounded-md border bg-background p-5">
            <div className="flex min-w-0 items-center gap-2">
              <ClipboardCheck className="size-4 text-success" aria-hidden="true" />
              <h3 className="truncate text-2xl font-semibold tracking-normal">
                {state.recommendationTitle}
              </h3>
            </div>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <DemoSignal label={t("dashboard.owner")} value={t("dashboard.shiftLead")} />
            <DemoSignal label={t("dashboard.confidence")} value="82%" />
          </div>

          <div className="min-w-0 rounded-md border bg-background p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{t("dashboard.whyMatters")}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {state.recommendationDescription}
            </p>
            <Progress value={82} className="mt-3" aria-label={t("dashboard.recommendationConfidence")} />
          </div>
        </div>
        {canAdvance ? (
          <Button
            type="button"
            size="lg"
            className="w-full lg:w-auto"
            asChild
            onClick={() => {
              if (!actionCompleted) completeAction("complete-rebalance");
            }}
          >
            <Link href={actionCompleted ? "/inventory" : "/kitchen"}>{state.recommendationCtaLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

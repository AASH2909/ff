import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import {
  useDashboardState,
  useOperationalActions,
  useOperationalProgress
} from "@/components/app/application-state-provider";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui";
import { DemoSignal } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { t } from "@/localization";
import { useCurrentAuthorization } from "@/components/app/current-authorization-provider";

export function DemoDecisionPreviewCard() {
  const state = useDashboardState();
  const progress = useOperationalProgress();
  const { completeShiftRebalance, resetDemo } = useOperationalActions();
  const { hasPermission } = useCurrentAuthorization();
  const actionCompleted = state.stage !== "shift-rebalance";
  const canAdvance =
    hasPermission("kitchen:operate") &&
    hasPermission("operational-demo:advance");
  const canReset = hasPermission("operational-demo:reset");

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
              <h3 className="text-balance whitespace-normal break-normal text-2xl font-semibold tracking-normal">
                {t(state.recommendationTitleKey)}
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
              {t(state.recommendationDescriptionKey)}
            </p>
            <Progress value={82} className="mt-3" aria-label={t("dashboard.recommendationConfidence")} />
          </div>
        </div>
        {canAdvance || canReset ? (
          <div className="flex w-full flex-col gap-2 lg:w-auto">
            <div
              className="grid grid-cols-3 gap-1"
              aria-label={t("demo.progress")}
            >
              {progress.map((item) => (
                <span
                  key={item.id}
                  className={
                    item.status === "pending"
                      ? "h-1.5 rounded-full bg-muted"
                      : "h-1.5 rounded-full bg-primary"
                  }
                >
                  <span className="sr-only">
                    {item.id}: {item.status}
                  </span>
                </span>
              ))}
            </div>
            {canAdvance ? (
              <Button
                type="button"
                size="lg"
                className="w-full lg:w-auto"
                asChild
                onClick={() => {
                  if (!actionCompleted) completeShiftRebalance();
                }}
              >
                <Link href={state.ctaDestination}>
                  {t(state.recommendationCtaKey)}
                </Link>
              </Button>
            ) : null}
            {canReset ? (
              <Button type="button" variant="secondary" onClick={resetDemo}>
                {t("demo.reset")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

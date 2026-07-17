import { AlertTriangle, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/design-system";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";
import { t } from "@/localization";

export function DashboardLoadingState() {
  return (
    <div className="space-y-4 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="grid gap-3 xl:grid-cols-[1.1fr_1.4fr]">
        <DashboardLoadingCard className="min-h-72" />
        <DashboardLoadingCard className="min-h-72" />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <DashboardLoadingCard />
        <DashboardLoadingCard />
        <DashboardLoadingCard />
      </div>
    </div>
  );
}

export function DashboardScopeEmptyState() {
  return (
    <div className="px-4 pb-8 sm:px-6 lg:px-8">
      <EmptyState
        icon={<BarChart3 />}
        title={t("dashboard.contextRequired")}
        description={t("dashboard.contextRequiredDescription")}
      />
    </div>
  );
}

export function DashboardDataEmptyState() {
  return (
    <EmptyState
      icon={<BarChart3 />}
      title={t("dashboard.noData")}
      description={t("dashboard.noDataDescription")}
      className="min-h-72"
    />
  );
}

export function DashboardErrorState({
  onRetry,
  onViewDemo
}: {
  onRetry: () => void;
  onViewDemo: () => void;
}) {
  return (
    <div className="px-4 pb-8 sm:px-6 lg:px-8">
      <EmptyState
        icon={<AlertTriangle />}
        title={t("dashboard.unableLoad")}
        description={t("dashboard.unableLoadDescription")}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onRetry}>{t("dashboard.retry")}</Button>
            <Button variant="secondary" onClick={onViewDemo}>
              {t("dashboard.openDemo")}
            </Button>
          </div>
        }
      />
    </div>
  );
}

function DashboardLoadingCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="space-y-4 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-44" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

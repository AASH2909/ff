import { AlertTriangle, BarChart3, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/design-system";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";
import type { DashboardLoadError } from "@/dashboard/presentation/web/hooks/use-dashboard-intelligence";

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
        title="Tenant context required"
        description="Set a tenant scope to load executive dashboard intelligence."
      />
    </div>
  );
}

export function DashboardDataEmptyState() {
  return (
    <EmptyState
      icon={<BarChart3 />}
      title="No dashboard data"
      description="Control Score records are not available for the selected scope."
      className="min-h-72"
    />
  );
}

export function DashboardErrorState({
  error,
  onRetry
}: {
  error: DashboardLoadError;
  onRetry: () => void;
}) {
  const icon = error.status === 401 || error.status === 403 ? <ShieldAlert /> : <AlertTriangle />;
  const title =
    error.status === 401
      ? "Session unavailable"
      : error.status === 403
        ? "Access restricted"
        : "Dashboard unavailable";

  return (
    <div className="px-4 pb-8 sm:px-6 lg:px-8">
      <EmptyState
        icon={icon}
        title={title}
        description={error.message}
        action={<Button onClick={onRetry}>Retry</Button>}
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

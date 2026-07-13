import { StatusChip } from "@/components/design-system";
import { Badge } from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoDashboardBanner() {
  const { banner } = demoDashboardData;

  return (
    <section className="rounded-lg border bg-surface p-4" aria-label="Dashboard demo mode">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="live">{banner.status}</StatusChip>
            {banner.badges.map((badge, index) => (
              <Badge key={badge} variant={index === 0 ? "outline" : "secondary"}>
                {badge}
              </Badge>
            ))}
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            {banner.description}
          </p>
        </div>
        <div className="min-w-0 rounded-md border bg-background px-3 py-2 text-sm lg:w-64 lg:shrink-0">
          <p className="font-semibold">{banner.scopeTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {banner.scopeDescription}
          </p>
        </div>
      </div>
    </section>
  );
}

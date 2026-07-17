import { MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getDemoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";
import { t } from "@/localization";

export function DemoRestaurantContextCard() {
  const { restaurantContext } = getDemoDashboardData();

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">{t("dashboard.context")}</CardTitle>
            <CardDescription>{t("dashboard.contextDescription")}</CardDescription>
          </div>
          <MapPin className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {restaurantContext.map((item) => (
          <div key={item.label} className="min-w-0 rounded-md border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

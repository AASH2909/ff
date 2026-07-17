import { CalendarClock } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getDemoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";
import { t } from "@/localization";

export function DemoTimelinePreviewCard() {
  const { timeline } = getDemoDashboardData();

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <CardTitle className="text-base">{t("dashboard.serviceTimeline")}</CardTitle>
          <CalendarClock className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="grid auto-rows-fr gap-3">
        {timeline.map((event) => (
          <article
            key={event.time}
            className="flex min-w-0 flex-col rounded-md border bg-background p-3"
          >
            <h3 className="text-balance text-sm font-semibold">{event.label}</h3>
            <p className="mt-1 text-pretty text-sm leading-6 text-muted-foreground">
              {event.detail}
            </p>
            <div className="mt-auto pt-3">
              <Badge variant="outline" className="w-fit shrink-0">
                {event.time}
              </Badge>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

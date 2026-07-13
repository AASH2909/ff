import { CalendarClock } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoTimelinePreviewCard() {
  const { timeline } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <CardTitle className="text-base">Service Timeline</CardTitle>
          <CalendarClock className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {timeline.map((event) => (
          <div key={event.time} className="min-w-0 rounded-md border bg-background p-3">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-sm font-semibold">{event.label}</p>
              <Badge variant="outline" className="w-fit shrink-0">
                {event.time}
              </Badge>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {event.detail}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

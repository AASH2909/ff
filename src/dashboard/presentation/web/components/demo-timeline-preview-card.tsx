import { CalendarClock } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoTimelinePreviewCard() {
  const { timeline } = demoDashboardData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Timeline Preview</CardTitle>
          <CalendarClock className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {timeline.map((event) => (
          <div key={event.time} className="rounded-md border bg-background p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{event.label}</p>
              <Badge variant="outline">{event.time}</Badge>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

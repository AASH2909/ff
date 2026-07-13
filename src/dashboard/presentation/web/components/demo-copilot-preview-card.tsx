import { BrainCircuit } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress
} from "@/components/ui";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

type CopilotMessageData = (typeof demoDashboardData.copilot.transcript)[number];

export function DemoCopilotPreviewCard() {
  const { copilot } = demoDashboardData;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">Need more context?</CardTitle>
            <CardDescription>{copilot.description}</CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0">
            Control Copilot
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="space-y-3" aria-label="Copilot demo transcript">
          {copilot.transcript.map((message, index) => (
            <CopilotMessage key={`${message.speaker}-${index}`} message={message} />
          ))}
        </section>

        <section className="min-w-0 rounded-md border bg-background p-3">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <BrainCircuit className="size-4 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold">Evidence and confidence</h3>
            </div>
            <Badge variant="outline" className="w-fit shrink-0">
              {copilot.confidence}% confidence
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {copilot.evidence.map((source) => (
              <Badge key={source} variant="outline" className="whitespace-normal text-left">
                {source}
              </Badge>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
              <span className="font-medium">Copilot confidence</span>
              <span className="text-muted-foreground">{copilot.confidence}%</span>
            </div>
            <Progress value={copilot.confidence} />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function CopilotMessage({ message }: { message: CopilotMessageData }) {
  return (
    <article
      className={
        message.surface === "surface"
          ? "rounded-md border bg-surface p-3"
          : "rounded-md border bg-background p-3"
      }
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
        <Badge variant={message.variant} className="w-fit shrink-0">
          {message.speaker}
        </Badge>
        <p
          className={
            message.speaker === "User"
              ? "min-w-0 text-sm font-semibold"
              : "min-w-0 text-sm leading-6 text-muted-foreground"
          }
        >
          {message.message}
        </p>
      </div>
    </article>
  );
}

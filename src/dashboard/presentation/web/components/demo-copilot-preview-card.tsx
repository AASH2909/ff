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
import { DemoSignal } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

type CopilotMessageData = (typeof demoDashboardData.copilot.transcript)[number];

export function DemoCopilotPreviewCard() {
  const { copilot, recommendation } = demoDashboardData;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Copilot Preview</CardTitle>
            <CardDescription>{copilot.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Demo preview
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="space-y-3" aria-label="Copilot demo transcript">
          {copilot.transcript.map((message, index) => (
            <CopilotMessage key={`${message.speaker}-${index}`} message={message} />
          ))}
        </section>

        <section className="rounded-md border bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-4 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold">Evidence used</h3>
            </div>
            <Badge variant="outline">{copilot.evidence.length} sources</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {copilot.evidence.map((source) => (
              <Badge key={source} variant="outline">
                {source}
              </Badge>
            ))}
          </div>
        </section>

        <section className="rounded-md border bg-surface p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Recommended next action
              </p>
              <h3 className="mt-2 text-sm font-semibold">{recommendation.title}</h3>
            </div>
            <Badge variant="success" className="shrink-0">
              Next
            </Badge>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <DemoSignal label="Expected impact" value={recommendation.expectedImpact} />
            <DemoSignal label="Confidence" value={`${copilot.confidence}%`} />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <Badge variant={message.variant} className="w-fit shrink-0">
          {message.speaker}
        </Badge>
        <p
          className={
            message.speaker === "User"
              ? "text-sm font-semibold"
              : "text-sm leading-6 text-muted-foreground"
          }
        >
          {message.message}
        </p>
      </div>
    </article>
  );
}

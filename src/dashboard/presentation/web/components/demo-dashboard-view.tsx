import type { ReactNode } from "react";
import { DemoCopilotPreviewCard } from "@/dashboard/presentation/web/components/demo-copilot-preview-card";
import { DemoMetricsRow } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { DemoDecisionPreviewCard } from "@/dashboard/presentation/web/components/demo-decision-preview-card";
import { DemoExecutiveHeroCard } from "@/dashboard/presentation/web/components/demo-executive-hero-card";
import { DemoIntelligenceJourneyCard } from "@/dashboard/presentation/web/components/demo-intelligence-journey-card";
import { DemoPredictionPreviewCard } from "@/dashboard/presentation/web/components/demo-prediction-preview-card";
import { DemoTimelinePreviewCard } from "@/dashboard/presentation/web/components/demo-timeline-preview-card";
import { DemoTopRisksCard } from "@/dashboard/presentation/web/components/demo-top-risks-card";
import { demoDashboardData } from "@/dashboard/presentation/web/demo/demo-dashboard-data";

export function DemoDashboardView() {
  const { briefingSections } = demoDashboardData;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden px-4 pb-8 sm:px-6 lg:px-8">
      <DemoExecutiveHeroCard />

      <DemoBriefingZone
        id="demo-key-signals-zone"
        title={briefingSections.keySignals.title}
        description={briefingSections.keySignals.description}
      >
        <DemoMetricsRow />
      </DemoBriefingZone>

      <DemoBriefingZone
        id="demo-recommendation-zone"
        title={briefingSections.recommendation.title}
        description={briefingSections.recommendation.description}
      >
        <DemoDecisionPreviewCard />
      </DemoBriefingZone>

      <DemoBriefingZone
        id="demo-evidence-zone"
        title={briefingSections.evidence.title}
        description={briefingSections.evidence.description}
      >
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <DemoTopRisksCard />
          <DemoPredictionPreviewCard />
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <DemoTimelinePreviewCard />
          <DemoIntelligenceJourneyCard />
        </div>
      </DemoBriefingZone>

      <DemoBriefingZone
        id="demo-ai-explanation-zone"
        title={briefingSections.aiExplanation.title}
        description={briefingSections.aiExplanation.description}
      >
        <div className="min-w-0 max-w-4xl">
          <DemoCopilotPreviewCard />
        </div>
      </DemoBriefingZone>
    </div>
  );
}

function DemoBriefingZone({
  children,
  description,
  id,
  title
}: {
  children: ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section className="min-w-0 space-y-3" aria-labelledby={id}>
      <div className="min-w-0 space-y-1">
        <h2 id={id} className="text-base font-semibold tracking-normal sm:text-lg">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

import { DemoControlScoreCard } from "@/dashboard/presentation/web/components/demo-control-score-card";
import { DemoCopilotPreviewCard } from "@/dashboard/presentation/web/components/demo-copilot-preview-card";
import { DemoDashboardBanner } from "@/dashboard/presentation/web/components/demo-dashboard-banner";
import { DemoDecisionPreviewCard } from "@/dashboard/presentation/web/components/demo-decision-preview-card";
import { DemoExecutiveSummaryCard } from "@/dashboard/presentation/web/components/demo-executive-summary-card";
import { DemoMetricsRow } from "@/dashboard/presentation/web/components/demo-dashboard-shared";
import { DemoIntelligenceJourneyCard } from "@/dashboard/presentation/web/components/demo-intelligence-journey-card";
import { DemoPredictionPreviewCard } from "@/dashboard/presentation/web/components/demo-prediction-preview-card";
import { DemoRestaurantContextCard } from "@/dashboard/presentation/web/components/demo-restaurant-context-card";
import { DemoTimelinePreviewCard } from "@/dashboard/presentation/web/components/demo-timeline-preview-card";
import { DemoTopRisksCard } from "@/dashboard/presentation/web/components/demo-top-risks-card";

export function DemoDashboardView() {
  return (
    <div className="space-y-4 px-4 pb-8 sm:px-6 lg:px-8">
      <DemoDashboardBanner />
      <DemoRestaurantContextCard />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <DemoExecutiveSummaryCard />
        <DemoControlScoreCard />
      </div>

      <DemoIntelligenceJourneyCard />
      <DemoMetricsRow />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DemoTopRisksCard />
        <DemoPredictionPreviewCard />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DemoTimelinePreviewCard />
        <DemoDecisionPreviewCard />
        <DemoCopilotPreviewCard />
      </div>
    </div>
  );
}

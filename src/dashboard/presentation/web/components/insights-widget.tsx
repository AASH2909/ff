import { BrainCircuit, ShieldAlert } from "lucide-react";
import type { DashboardInsightsOutputDto } from "@/dashboard/application/dtos";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { EmptyState } from "@/components/design-system";
import {
  formatContribution,
  formatDateTime,
  formatScoreChange,
  insightVariant,
  severityVariant,
  titleCase
} from "@/dashboard/presentation/web/utils/dashboard-formatters";

type InsightsWidgetProps = {
  insights: DashboardInsightsOutputDto;
};

export function InsightsWidget({ insights }: InsightsWidgetProps) {
  const hasInsights =
    insights.explanations.length > 0 ||
    insights.improvedDomains.length > 0 ||
    insights.deterioratedDomains.length > 0 ||
    insights.executiveAttentionRisks.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Insights</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Score change {formatScoreChange(insights.scoreChange)}
            </p>
          </div>
          <Badge variant="secondary">Structured</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasInsights ? (
          <EmptyState
            icon={<BrainCircuit />}
            title="No insights"
            description="No structured explanations were returned for this score."
            className="min-h-64"
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <div className="space-y-3">
              {insights.explanations.slice(0, 6).map((explanation) => (
                <article key={explanation.id} className="rounded-md border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {explanation.metricName ?? explanation.metricCode ?? "Score explanation"}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {explanation.explanation}
                      </p>
                    </div>
                    <Badge variant={severityVariant(explanation.severity)} className="shrink-0">
                      {titleCase(explanation.severity)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant={insightVariant(explanation.driverType)}>
                      {titleCase(explanation.driverType)}
                    </Badge>
                    <Badge variant="outline">{formatContribution(explanation.contribution)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(explanation.createdAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <div className="space-y-3">
              <DomainChangePanel
                title="Improved Domains"
                emptyLabel="No improved domains"
                changes={insights.improvedDomains}
              />
              <DomainChangePanel
                title="Deteriorated Domains"
                emptyLabel="No deteriorated domains"
                changes={insights.deterioratedDomains}
              />
              <RiskPanel risks={insights.executiveAttentionRisks} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DomainChangePanel({
  title,
  emptyLabel,
  changes
}: {
  title: string;
  emptyLabel: string;
  changes: DashboardInsightsOutputDto["improvedDomains"];
}) {
  return (
    <section className="rounded-md border bg-surface p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {changes.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {changes.map((change) => (
            <div
              key={`${change.domainCode}-${change.trend}`}
              className="flex items-center justify-between gap-3 rounded-sm bg-background p-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{change.domainName}</p>
                <p className="text-xs text-muted-foreground">
                  {change.previousScore} to {change.currentScore}
                </p>
              </div>
              <Badge variant={change.trend === "up" ? "success" : "warning"}>
                {formatScoreChange(change.scoreChange)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RiskPanel({ risks }: { risks: DashboardInsightsOutputDto["executiveAttentionRisks"] }) {
  return (
    <section className="rounded-md border bg-surface p-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
        <h3 className="text-sm font-semibold">Executive Risks</h3>
      </div>
      {risks.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No executive risks returned.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {risks.map((risk) => (
            <div key={risk.id} className="rounded-sm bg-background p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{risk.title}</p>
                <Badge variant={severityVariant(risk.severity)}>{titleCase(risk.severity)}</Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{risk.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

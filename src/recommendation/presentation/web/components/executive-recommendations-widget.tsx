"use client";

import { Lightbulb, RefreshCw } from "lucide-react";
import type { RecommendationDto } from "@/recommendation/application/dtos";
import type { RecommendationClientScope } from "@/recommendation/presentation/web/api/recommendation-api-client";
import { useExecutiveRecommendations } from "@/recommendation/presentation/web/hooks/use-executive-recommendations";
import { EmptyState } from "@/components/design-system";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import type { BadgeProps } from "@/components/ui";

type ExecutiveRecommendationsWidgetProps = {
  scope: RecommendationClientScope;
};

export function ExecutiveRecommendationsWidget({ scope }: ExecutiveRecommendationsWidgetProps) {
  const { state, data, error, refresh } = useExecutiveRecommendations({
    ...scope,
    limit: scope.limit ?? 8
  });

  const recommendations = data?.all.recommendations ?? [];
  const highPriority = data?.highPriority.recommendations ?? [];
  const criticalRecommendations = highPriority.filter(
    (recommendation) => recommendation.priority === "CRITICAL"
  );
  const recentRecommendations = [...recommendations]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Executive Recommendations</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Deterministic actions from dashboard intelligence.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={state === "loading" || !scope.tenantId}
          >
            <RefreshCw className={state === "loading" ? "animate-spin" : undefined} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {state === "idle" ? (
          <EmptyState
            icon={<Lightbulb />}
            title="Tenant scope required"
            description="Set a tenant scope to load recommendations."
            className="min-h-64"
          />
        ) : null}
        {state === "loading" ? <RecommendationLoading /> : null}
        {state === "error" && error ? (
          <EmptyState
            icon={<Lightbulb />}
            title="Recommendations unavailable"
            description={error.message}
            action={<Button onClick={refresh}>Retry</Button>}
            className="min-h-64"
          />
        ) : null}
        {state === "success" ? (
          recommendations.length === 0 ? (
            <EmptyState
              icon={<Lightbulb />}
              title="No recommendations"
              description="No deterministic recommendation rules matched the current dashboard data."
              className="min-h-64"
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              <RecommendationGroup
                title="Top Recommendations"
                recommendations={recommendations.slice(0, 3)}
              />
              <RecommendationGroup
                title="Critical Recommendations"
                recommendations={criticalRecommendations.slice(0, 3)}
                emptyLabel="No critical recommendations"
              />
              <RecommendationGroup
                title="Recent Recommendations"
                recommendations={recentRecommendations}
              />
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}

function RecommendationGroup({
  title,
  recommendations,
  emptyLabel = "No recommendations"
}: {
  title: string;
  recommendations: RecommendationDto[];
  emptyLabel?: string;
}) {
  return (
    <section className="rounded-md border bg-surface p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {recommendations.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {recommendations.map((recommendation) => (
            <RecommendationItem key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecommendationItem({ recommendation }: { recommendation: RecommendationDto }) {
  return (
    <article className="rounded-sm bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="line-clamp-2 text-sm font-semibold">{recommendation.title}</h4>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {recommendation.description}
          </p>
        </div>
        <Badge variant={priorityVariant(recommendation.priority)} className="shrink-0">
          {recommendation.priority}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline">{recommendation.category}</Badge>
        <Badge variant="secondary">{formatConfidence(recommendation.confidence)}</Badge>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {recommendation.recommendedAction}
      </p>
    </article>
  );
}

function RecommendationLoading() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-md border bg-surface p-3">
          <Skeleton className="h-4 w-32" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function priorityVariant(priority: RecommendationDto["priority"]): BadgeProps["variant"] {
  if (priority === "CRITICAL") {
    return "destructive";
  }

  if (priority === "HIGH") {
    return "warning";
  }

  if (priority === "MEDIUM") {
    return "accent";
  }

  return "secondary";
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}% confidence`;
}

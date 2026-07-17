import { LineChart } from "lucide-react";
import type { ScoreTrendPointDto } from "@/dashboard/application/dtos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { EmptyState } from "@/components/design-system";
import { formatDate, formatScore, titleCase } from "@/dashboard/presentation/web/utils/dashboard-formatters";
import { t } from "@/localization";

type ScoreTrendWidgetProps = {
  points: ScoreTrendPointDto[];
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const CHART_PADDING = 24;

export function ScoreTrendWidget({ points }: ScoreTrendWidgetProps) {
  const sortedPoints = [...points].sort(
    (first, second) =>
      new Date(first.calculatedAt).getTime() - new Date(second.calculatedAt).getTime()
  );

  return (
    <Card className="min-h-[22rem]">
      <CardHeader>
        <CardTitle>{t("dashboard.scoreTrend")}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedPoints.length === 0 ? (
          <EmptyState
            icon={<LineChart />}
            title={t("dashboard.noHistory")}
            description={t("dashboard.noHistoryDescription")}
            className="min-h-64"
          />
        ) : (
          <div className="overflow-hidden rounded-md border bg-surface p-3">
            <svg
              role="img"
              aria-label={t("dashboard.scoreHistory")}
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-64 w-full"
              preserveAspectRatio="none"
            >
              <ScoreGrid />
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={toPolylinePoints(sortedPoints)}
                className="text-primary"
              />
              {sortedPoints.map((point, index) => {
                const coordinate = toCoordinate(point.score, index, sortedPoints.length);

                return (
                  <circle
                    key={point.controlScoreId}
                    cx={coordinate.x}
                    cy={coordinate.y}
                    r="5"
                    className="fill-card stroke-primary"
                    strokeWidth="3"
                  />
                );
              })}
            </svg>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              {sortedPoints.slice(-3).map((point) => (
                <div key={point.controlScoreId} className="rounded-sm bg-background p-2">
                  <p className="font-semibold text-foreground">{formatScore(point.score)}</p>
                  <p className="mt-0.5">{formatDate(point.calculatedAt)}</p>
                  <p className="mt-0.5">{titleCase(point.direction)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreGrid() {
  const rows = [0, 25, 50, 75, 100];

  return (
    <g aria-hidden="true">
      {rows.map((value) => {
        const y = toY(value);

        return (
          <line
            key={value}
            x1={CHART_PADDING}
            x2={CHART_WIDTH - CHART_PADDING}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        );
      })}
    </g>
  );
}

function toPolylinePoints(points: ScoreTrendPointDto[]) {
  return points
    .map((point, index) => {
      const coordinate = toCoordinate(point.score, index, points.length);
      return `${coordinate.x},${coordinate.y}`;
    })
    .join(" ");
}

function toCoordinate(score: number, index: number, total: number) {
  const availableWidth = CHART_WIDTH - CHART_PADDING * 2;
  const x =
    total <= 1
      ? CHART_WIDTH / 2
      : CHART_PADDING + (availableWidth / Math.max(total - 1, 1)) * index;

  return {
    x,
    y: toY(score)
  };
}

function toY(score: number) {
  const bounded = Math.min(Math.max(score, 0), 100);
  const availableHeight = CHART_HEIGHT - CHART_PADDING * 2;

  return CHART_PADDING + availableHeight - (bounded / 100) * availableHeight;
}

import { Activity, CalendarClock, TrendingDown, TrendingUp } from "lucide-react";
import type { ControlScoreDto, DashboardOverviewDto } from "@/dashboard/application/dtos";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  formatDateTime,
  formatScore,
  formatScoreChange,
  titleCase,
  trendLabel
} from "@/dashboard/presentation/web/utils/dashboard-formatters";

type OverviewCardProps = {
  overview: DashboardOverviewDto;
  latest: ControlScoreDto;
};

export function OverviewCard({ overview, latest }: OverviewCardProps) {
  const current = overview.currentControlScore;
  const latestTrend = overview.trend[0];

  return (
    <Card className="min-h-[22rem]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Control Score</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {current.businessUnitName ?? current.businessUnitId}
            </p>
          </div>
          <Badge variant="outline">{titleCase(latest.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[13rem_1fr]">
        <div className="flex items-center justify-center">
          <ScoreGauge score={current.score} />
        </div>
        <div className="grid content-center gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <ScoreFact
            label="Previous"
            value={current.previousScore === null ? "None" : formatScore(current.previousScore)}
            helper="Prior calculation"
            icon={<Activity className="size-4" />}
          />
          <ScoreFact
            label="Change"
            value={formatScoreChange(current.scoreChange)}
            helper={trendLabel(latestTrend)}
            icon={current.scoreChange !== null && current.scoreChange < 0 ? <TrendingDown /> : <TrendingUp />}
          />
          <ScoreFact
            label="Last calculated"
            value={formatDateTime(overview.lastCalculationTime)}
            helper={`${formatDateTime(latest.calculatedAt)} latest record`}
            icon={<CalendarClock className="size-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  return (
    <div className="relative grid size-52 place-items-center">
      <svg viewBox="0 0 120 120" className="size-52 -rotate-90" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-secondary"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-5xl font-semibold tracking-normal">{formatScore(score)}</p>
        <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">of 100</p>
      </div>
    </div>
  );
}

function ScoreFact({
  label,
  value,
  helper,
  icon
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        <div className="text-muted-foreground [&_svg]:size-4">{icon}</div>
      </div>
      <p className="mt-2 text-lg font-semibold tracking-normal">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

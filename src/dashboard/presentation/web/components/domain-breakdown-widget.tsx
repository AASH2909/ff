import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type { DomainScoreDto } from "@/dashboard/application/dtos";
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui";
import {
  formatContribution,
  formatPercent,
  formatScore,
  formatScoreChange,
  titleCase
} from "@/dashboard/presentation/web/utils/dashboard-formatters";
import { t } from "@/localization";

type DomainBreakdownWidgetProps = {
  domains: DomainScoreDto[];
};

export function DomainBreakdownWidget({ domains }: DomainBreakdownWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{t("dashboard.domainBreakdown")}</CardTitle>
          <Badge variant="secondary">{domains.length} domains</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {domains.map((domain) => (
          <DomainCard key={domain.domainCode} domain={domain} />
        ))}
      </CardContent>
    </Card>
  );
}

function DomainCard({ domain }: { domain: DomainScoreDto }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{domain.domainName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Rank {domain.ranking}</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {formatScore(domain.score)}
        </Badge>
      </div>
      <Progress value={domain.score} className="mt-4" />
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <DomainMetric label={t("dashboard.weight")} value={formatPercent(domain.weight)} />
        <DomainMetric label={t("dashboard.contribution")} value={formatContribution(domain.contribution)} />
        <DomainMetric
          label={t("dashboard.trend")}
          value={formatScoreChange(domain.scoreChange)}
          icon={<TrendIcon trend={domain.trend} />}
        />
      </div>
    </div>
  );
}

function DomainMetric({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-sm bg-surface px-2 py-2">
      <p className="truncate text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-1 font-semibold">
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: DomainScoreDto["trend"] }) {
  if (trend === "up") {
    return <ArrowUp className="size-3.5 text-success" aria-label={titleCase(trend)} />;
  }

  if (trend === "down") {
    return <ArrowDown className="size-3.5 text-destructive" aria-label={titleCase(trend)} />;
  }

  return <ArrowRight className="size-3.5 text-muted-foreground" aria-label={titleCase(trend)} />;
}

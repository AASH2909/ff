import * as React from "react";
import { cn } from "@/lib/utils";

type MetricTileProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  helper?: string;
  trend?: React.ReactNode;
};

function MetricTile({ className, label, value, helper, trend, ...props }: MetricTileProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card p-4 text-card-foreground shadow-apple-sm", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {trend ? <div className="shrink-0">{trend}</div> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

export { MetricTile };

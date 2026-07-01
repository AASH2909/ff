import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const normalizedValue = max <= 0 ? 0 : Math.min(Math.max(value, 0), max);
    const width = `${(normalizedValue / max) * 100}%`;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={normalizedValue}
        className={cn("h-2 overflow-hidden rounded-sm bg-secondary", className)}
        {...props}
      >
        <div className="h-full rounded-sm bg-primary transition-all duration-300" style={{ width }} />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };

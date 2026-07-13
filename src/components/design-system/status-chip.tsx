import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusChipVariants = cva(
  "inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-xs font-semibold tracking-normal",
  {
    variants: {
      tone: {
        neutral: "border-border bg-secondary text-secondary-foreground",
        info: "border-primary/20 bg-primary/10 text-primary",
        healthy: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/15 text-warning-foreground",
        critical: "border-destructive/20 bg-destructive/10 text-destructive",
        live: "border-primary/20 bg-primary/10 text-primary",
        ready: "border-success/20 bg-success/10 text-success",
        rush: "border-warning/30 bg-warning/15 text-warning-foreground",
        blocked: "border-destructive/20 bg-destructive/10 text-destructive"
      }
    },
    defaultVariants: {
      tone: "neutral"
    }
  }
);

type StatusChipProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof statusChipVariants> & {
    dot?: boolean;
  };

function StatusChip({ className, tone, dot = true, children, ...props }: StatusChipProps) {
  return (
    <div className={cn(statusChipVariants({ tone }), className)} {...props}>
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </div>
  );
}

export { StatusChip, statusChipVariants };

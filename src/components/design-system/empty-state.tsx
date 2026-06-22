import * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

function EmptyState({ className, icon, title, description, action, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed bg-surface px-4 py-8 text-center",
        className
      )}
      {...props}
    >
      {icon ? <div className="mb-3 text-muted-foreground [&_svg]:size-6">{icon}</div> : null}
      <h2 className="max-w-64 text-base font-semibold tracking-normal">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-72 text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export { EmptyState };

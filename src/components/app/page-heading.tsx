import * as React from "react";
import { cn } from "@/lib/utils";

type PageHeadingProps = React.HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

function PageHeading({ className, eyebrow, title, description, actions, ...props }: PageHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-3 px-4 pb-3 pt-5 sm:px-6 lg:px-8", className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase text-muted-foreground">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

export { PageHeading };

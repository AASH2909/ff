import * as React from "react";
import { cn } from "@/lib/utils";

type AppFrameProps = React.HTMLAttributes<HTMLDivElement>;

function AppFrame({ className, ...props }: AppFrameProps) {
  return (
    <div
      className={cn("min-h-dvh bg-background text-foreground", className)}
      {...props}
    />
  );
}

type MobileViewportProps = React.HTMLAttributes<HTMLDivElement>;

function MobileViewport({ className, ...props }: MobileViewportProps) {
  return (
    <div
      className={cn("mx-auto min-h-dvh w-full max-w-md bg-background", className)}
      {...props}
    />
  );
}

type AppHeaderProps = React.HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
};

function AppHeader({ className, eyebrow, title, actions, children, ...props }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "surface-blur sticky top-0 z-30 border-b px-4 py-3",
        className
      )}
      {...props}
    >
      <div className="flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="truncate text-xs font-semibold uppercase text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="truncate text-lg font-semibold tracking-normal">{title}</h1>
          {children}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

type PageSectionProps = React.HTMLAttributes<HTMLElement>;

function PageSection({ className, ...props }: PageSectionProps) {
  return <section className={cn("px-4 py-3", className)} {...props} />;
}

export { AppFrame, AppHeader, MobileViewport, PageSection };

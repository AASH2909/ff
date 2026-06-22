import * as React from "react";
import { cn } from "@/lib/utils";

type BottomActionBarProps = React.HTMLAttributes<HTMLDivElement>;

function BottomActionBar({ className, ...props }: BottomActionBarProps) {
  return (
    <div
      className={cn(
        "surface-blur safe-bottom sticky bottom-20 z-30 border-t px-4 pt-3 md:bottom-0",
        className
      )}
      {...props}
    />
  );
}

type BottomActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

function BottomActionGroup({ className, ...props }: BottomActionGroupProps) {
  return <div className={cn("grid grid-cols-2 gap-2", className)} {...props} />;
}

export { BottomActionBar, BottomActionGroup };

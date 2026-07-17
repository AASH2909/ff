import * as React from "react";
import { AppBottomNavigation, AppSidebarNavigation } from "@/components/app/app-navigation";
import { AppFrame } from "@/components/design-system";

type AppShellProps = {
  children: React.ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
    <AppFrame>
      <AppSidebarNavigation />
      <div className="min-h-dvh pb-24 md:pl-64 md:pb-0">{children}</div>
      <AppBottomNavigation />
    </AppFrame>
  );
}

export { AppShell };

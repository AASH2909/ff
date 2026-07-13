import * as React from "react";
import { AppBottomNavigation, AppSidebarNavigation } from "@/components/app/app-navigation";
import { OperationalDemoProvider } from "@/components/app/operational-demo-state";
import { AppFrame } from "@/components/design-system";

type AppShellProps = {
  children: React.ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
    <OperationalDemoProvider>
      <AppFrame>
        <AppSidebarNavigation />
        <div className="min-h-dvh pb-24 md:pl-64 md:pb-0">{children}</div>
        <AppBottomNavigation />
      </AppFrame>
    </OperationalDemoProvider>
  );
}

export { AppShell };

import * as React from "react";
import { AppBottomNavigation, AppSidebarNavigation } from "@/components/app/app-navigation";
import { AppFrame } from "@/components/design-system";
import { ExecutiveHeader } from "@/components/app/executive-header";

type AppShellProps = {
  children: React.ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
    <AppFrame>
      <AppSidebarNavigation />
      <div className="min-h-dvh pb-24 md:pl-64 md:pb-0">
        <ExecutiveHeader />
        {children}
      </div>
      <AppBottomNavigation />
    </AppFrame>
  );
}

export { AppShell };

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChefHat, ClipboardList, LayoutDashboard, Settings, ShoppingCart } from "lucide-react";
import { useOperationalDemo } from "@/components/app/operational-demo-state";
import { useCurrentAuthorization } from "@/components/app/current-authorization-provider";
import { useSession } from "@/components/app/session-provider";
import {
  createAuthorizedNavigation,
  isNavigationItemActive
} from "@/components/app/authorized-navigation";
import { cn } from "@/lib/utils";
import { t } from "@/localization";
import type { NavigationId } from "@/lib/auth/authorization";

const iconByNavigationId = {
  dashboard: LayoutDashboard,
  pos: ShoppingCart,
  kitchen: ChefHat,
  inventory: ClipboardList,
  settings: Settings
} as const satisfies Record<NavigationId, typeof LayoutDashboard>;

function AppBottomNavigation() {
  const pathname = usePathname();
  const { state } = useOperationalDemo();
  const { currentUser } = useSession();
  const navigationItems = createAuthorizedNavigation(currentUser.effectiveRole, state);

  return (
    <nav className="surface-blur safe-bottom fixed inset-x-0 bottom-0 z-40 border-t px-2 pt-2 md:hidden">
      <div className="grid grid-flow-col auto-cols-fr gap-1">
        {navigationItems.map((item) => {
          const Icon = iconByNavigationId[item.id];
          const active = isNavigationItemActive(pathname, item.path);

          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "tap-target relative flex flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold text-muted-foreground transition-colors",
                active && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="max-w-full truncate">{t(item.labelKey)}</span>
              {item.badgeCount > 0 ? (
                <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {item.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AppSidebarNavigation() {
  const pathname = usePathname();
  const { state } = useOperationalDemo();
  const { currentUser } = useSession();
  const { defaultRoute } = useCurrentAuthorization();
  const navigationItems = createAuthorizedNavigation(currentUser.effectiveRole, state);

  return (
    <aside className="surface-blur fixed inset-y-0 left-0 z-40 hidden w-64 border-r p-4 md:block">
      <Link href={defaultRoute} className="flex h-12 items-center gap-3 rounded-md px-2">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BarChart3 className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">FastFlow</p>
          <p className="truncate text-xs text-muted-foreground">{t("nav.operations")}</p>
        </div>
      </Link>

      <nav className="mt-6 space-y-1">
        {navigationItems.map((item) => {
          const Icon = iconByNavigationId[item.id];
          const active = isNavigationItemActive(pathname, item.path);

          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "flex h-11 items-center justify-between gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                active && "bg-primary/10 text-primary"
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{t(item.labelKey)}</span>
              </span>
              {item.badgeCount > 0 ? (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {item.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { AppBottomNavigation, AppSidebarNavigation };

"use client";

import { BriefcaseBusiness, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { DeveloperRolePreview } from "@/components/app/developer-role-preview";
import { useSession } from "@/components/app/session-provider";
import type { ApplicationSession } from "@/components/app/application-session";
import { StatusChip } from "@/components/design-system";
import { getRoleLabelKey } from "@/lib/auth/authorization";
import { t, type MessageKey } from "@/localization";

const workspaceLabelKeys = {
  "demo-workspace": "executive.workspace.demo"
} as const satisfies Record<ApplicationSession["workspace"], MessageKey>;
const restaurantLabelKeys = {
  "harbor-and-pine": "executive.restaurant.harborPine"
} as const satisfies Record<ApplicationSession["restaurant"], MessageKey>;
const locationLabelKeys = {
  downtown: "executive.location.downtown"
} as const satisfies Record<ApplicationSession["location"], MessageKey>;
const shiftLabelKeys = {
  dinner: "executive.shift.dinner"
} as const satisfies Record<ApplicationSession["shift"], MessageKey>;
const modeLabelKeys = {
  monitoring: "executive.mode.monitoring"
} as const satisfies Record<ApplicationSession["monitoringStatus"], MessageKey>;

export function ExecutiveHeader() {
  const session = useSession();
  return (
    <ExecutiveHeaderView
      session={session}
      developerTools={<DeveloperRolePreview />}
    />
  );
}

export function ExecutiveHeaderView({
  session,
  developerTools
}: {
  session: ApplicationSession;
  developerTools?: ReactNode;
}) {
  return (
    <header className="border-b bg-background/95 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3 pr-32 md:pr-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{session.currentUser.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t(getRoleLabelKey(session.currentUser.effectiveRole))}
            </p>
          </div>
          {developerTools}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-2 text-xs sm:flex sm:flex-wrap sm:items-center">
          <ContextItem
            label={t("executive.workspace")}
            value={t(workspaceLabelKeys[session.workspace])}
          />
          <ContextItem
            label={t("executive.restaurant")}
            value={t(restaurantLabelKeys[session.restaurant])}
          />
          <ContextItem
            label={t("executive.location")}
            value={t(locationLabelKeys[session.location])}
            icon={<MapPin className="size-3" aria-hidden="true" />}
          />
          <ContextItem
            label={t("executive.shift")}
            value={t(shiftLabelKeys[session.shift])}
          />
          <StatusChip tone="healthy" className="h-auto min-h-7 w-fit max-w-full whitespace-normal">
            {t(modeLabelKeys[session.monitoringStatus])}
          </StatusChip>
        </div>
      </div>
    </header>
  );
}

function ContextItem({
  icon,
  label,
  value
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex min-w-0 items-center gap-1 font-semibold">
        {icon}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

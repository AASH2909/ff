"use client";

import { BriefcaseBusiness, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { useExecutiveWorkspace } from "@/components/app/executive-workspace-provider";
import type { ExecutiveWorkspace } from "@/components/app/executive-workspace";
import { useCurrentAuthorization } from "@/components/app/current-authorization-provider";
import {
  defaultCurrentUser,
  type CurrentUser
} from "@/components/app/current-authorization";
import { StatusChip } from "@/components/design-system";
import { getRoleLabelKey } from "@/lib/auth/authorization";
import { t, type MessageKey } from "@/localization";

const workspaceLabelKeys = {
  "demo-workspace": "executive.workspace.demo"
} as const satisfies Record<ExecutiveWorkspace["workspace"], MessageKey>;
const restaurantLabelKeys = {
  "harbor-and-pine": "executive.restaurant.harborPine"
} as const satisfies Record<ExecutiveWorkspace["restaurant"], MessageKey>;
const locationLabelKeys = {
  downtown: "executive.location.downtown"
} as const satisfies Record<ExecutiveWorkspace["location"], MessageKey>;
const shiftLabelKeys = {
  dinner: "executive.shift.dinner"
} as const satisfies Record<ExecutiveWorkspace["activeShift"], MessageKey>;
const modeLabelKeys = {
  monitoring: "executive.mode.monitoring"
} as const satisfies Record<ExecutiveWorkspace["operationalMode"], MessageKey>;

export function ExecutiveHeader() {
  const { workspace } = useExecutiveWorkspace();
  const { currentUser } = useCurrentAuthorization();
  return (
    <ExecutiveHeaderView workspace={workspace} currentUser={currentUser} />
  );
}

export function ExecutiveHeaderView({
  workspace,
  currentUser = defaultCurrentUser
}: {
  workspace: ExecutiveWorkspace;
  currentUser?: CurrentUser;
}) {
  return (
    <header className="border-b bg-background/95 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3 pr-32 md:pr-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentUser.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t(getRoleLabelKey(currentUser.role))}
            </p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-2 text-xs sm:flex sm:flex-wrap sm:items-center">
          <ContextItem
            label={t("executive.workspace")}
            value={t(workspaceLabelKeys[workspace.workspace])}
          />
          <ContextItem
            label={t("executive.restaurant")}
            value={t(restaurantLabelKeys[workspace.restaurant])}
          />
          <ContextItem
            label={t("executive.location")}
            value={t(locationLabelKeys[workspace.location])}
            icon={<MapPin className="size-3" aria-hidden="true" />}
          />
          <ContextItem
            label={t("executive.shift")}
            value={t(shiftLabelKeys[workspace.activeShift])}
          />
          <StatusChip tone="healthy" className="h-auto min-h-7 w-fit max-w-full whitespace-normal">
            {t(modeLabelKeys[workspace.operationalMode])}
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

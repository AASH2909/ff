"use client";

import { BriefcaseBusiness, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { useExecutiveWorkspace } from "@/components/app/executive-workspace-provider";
import type { ExecutiveWorkspace } from "@/components/app/executive-workspace";
import { StatusChip } from "@/components/design-system";
import { t } from "@/localization";

export function ExecutiveHeader() {
  const { workspace } = useExecutiveWorkspace();
  return <ExecutiveHeaderView workspace={workspace} />;
}

export function ExecutiveHeaderView({
  workspace
}: {
  workspace: ExecutiveWorkspace;
}) {
  return (
    <header className="border-b bg-background/95 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3 pr-32 md:pr-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{workspace.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t("executive.role.operations")}
            </p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-2 text-xs sm:flex sm:flex-wrap sm:items-center">
          <ContextItem
            label={t("executive.workspace")}
            value={t("executive.workspace.demo")}
          />
          <ContextItem
            label={t("executive.restaurant")}
            value={t("executive.restaurant.harborPine")}
          />
          <ContextItem
            label={t("executive.location")}
            value={t("executive.location.downtown")}
            icon={<MapPin className="size-3" aria-hidden="true" />}
          />
          <ContextItem
            label={t("executive.shift")}
            value={t("executive.shift.dinner")}
          />
          <StatusChip tone="healthy" className="h-auto min-h-7 w-fit max-w-full whitespace-normal">
            {t("executive.mode.monitoring")}
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

"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCurrentAuthorization } from "@/components/app/current-authorization-provider";
import {
  getRoleLabelKey,
  isUserRole,
  type UserRole
} from "@/lib/auth/authorization";
import {
  createDeveloperRolePreviewCookie,
  getDeveloperRolePreviewOptions,
  isDeveloperRolePreviewEnabled,
  resolvePreviewNavigation
} from "@/lib/auth/developer-role-preview";
import { t } from "@/localization";

export const rolePreviewControlClasses =
  "flex min-w-0 max-w-full flex-wrap items-end gap-2 whitespace-normal break-normal rounded-md border border-dashed border-primary/30 bg-primary/5 px-2.5 py-2 text-xs";

export function DeveloperRolePreview() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useCurrentAuthorization();
  const authenticatedRole = currentUser.authenticatedRole ?? currentUser.role;

  function applyRole(role: UserRole | null) {
    const effectiveRole = role ?? authenticatedRole;
    document.cookie = createDeveloperRolePreviewCookie(role);
    const destination = resolvePreviewNavigation(effectiveRole, pathname);
    if (destination !== pathname) router.replace(destination);
    router.refresh();
  }

  return (
    <DeveloperRolePreviewView
      enabled={isDeveloperRolePreviewEnabled()}
      role={currentUser.role}
      previewRole={currentUser.previewRole ?? null}
      onRoleChange={applyRole}
      onClear={() => applyRole(null)}
    />
  );
}

export function DeveloperRolePreviewView({
  enabled,
  role,
  previewRole,
  onRoleChange,
  onClear
}: {
  enabled: boolean;
  role: UserRole;
  previewRole: UserRole | null;
  onRoleChange: (role: UserRole) => void;
  onClear: () => void;
}) {
  if (!enabled) return null;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    if (isUserRole(event.target.value)) onRoleChange(event.target.value);
  }

  return (
    <div className={rolePreviewControlClasses}>
      <div className="min-w-0 max-w-full">
        <p className="font-semibold text-primary">
          {t("developerPreview.title")}
        </p>
        <label
          className="mt-1 block font-medium text-muted-foreground"
          htmlFor="developer-role-preview"
        >
          {t("developerPreview.role")}
        </label>
      </div>
      <select
        id="developer-role-preview"
        aria-label={t("developerPreview.role")}
        className="h-9 min-w-0 max-w-full rounded-md border bg-background px-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={previewRole ?? role}
        onChange={handleChange}
      >
        {getDeveloperRolePreviewOptions().map((option) => (
          <option key={option} value={option}>
            {t(getRoleLabelKey(option))}
          </option>
        ))}
      </select>
      {previewRole ? (
        <button
          type="button"
          className="min-h-9 max-w-full whitespace-normal break-normal rounded-md border bg-background px-2.5 py-1.5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onClear}
        >
          {t("developerPreview.useRealRole")}
        </button>
      ) : null}
    </div>
  );
}

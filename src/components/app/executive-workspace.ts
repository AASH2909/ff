import type { Locale } from "@/localization";

export const EXECUTIVE_WORKSPACE_STORAGE_KEY = "fastflow.executive-workspace";

export type ExecutiveWorkspace = Readonly<{
  workspace: "demo-workspace";
  restaurant: "harbor-and-pine";
  location: "downtown";
  activeShift: "dinner";
  operationalMode: "monitoring";
  preferredDashboardScope: "demo" | "restaurant";
  preferredLocale: Locale;
  compactMode: boolean;
  notificationsEnabled: boolean;
}>;

export type ExecutiveWorkspaceStorage = Pick<Storage, "getItem" | "setItem">;

export const defaultExecutiveWorkspace: ExecutiveWorkspace = Object.freeze({
  workspace: "demo-workspace",
  restaurant: "harbor-and-pine",
  location: "downtown",
  activeShift: "dinner",
  operationalMode: "monitoring",
  preferredDashboardScope: "demo",
  preferredLocale: "en",
  compactMode: false,
  notificationsEnabled: true
});

export function updateExecutiveWorkspace(
  current: ExecutiveWorkspace,
  update: Partial<ExecutiveWorkspace>
): ExecutiveWorkspace {
  const candidate = { ...current, ...update };
  return isExecutiveWorkspace(candidate) ? Object.freeze(candidate) : current;
}

export function readExecutiveWorkspace(
  storage?: ExecutiveWorkspaceStorage
): ExecutiveWorkspace {
  try {
    const rawValue = storage?.getItem(EXECUTIVE_WORKSPACE_STORAGE_KEY);
    if (!rawValue) return defaultExecutiveWorkspace;
    const candidate: unknown = JSON.parse(rawValue);
    return isExecutiveWorkspace(candidate)
      ? Object.freeze(toExecutiveWorkspace(candidate))
      : defaultExecutiveWorkspace;
  } catch {
    return defaultExecutiveWorkspace;
  }
}

function toExecutiveWorkspace(
  candidate: ExecutiveWorkspace
): ExecutiveWorkspace {
  return {
    workspace: candidate.workspace,
    restaurant: candidate.restaurant,
    location: candidate.location,
    activeShift: candidate.activeShift,
    operationalMode: candidate.operationalMode,
    preferredDashboardScope: candidate.preferredDashboardScope,
    preferredLocale: candidate.preferredLocale,
    compactMode: candidate.compactMode,
    notificationsEnabled: candidate.notificationsEnabled
  };
}

export function writeExecutiveWorkspace(
  storage: ExecutiveWorkspaceStorage | undefined,
  workspace: ExecutiveWorkspace
) {
  try {
    storage?.setItem(EXECUTIVE_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // Personalization must not block the application when storage is unavailable.
  }
}

function isExecutiveWorkspace(value: unknown): value is ExecutiveWorkspace {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  return (
    candidate.workspace === "demo-workspace" &&
    candidate.restaurant === "harbor-and-pine" &&
    candidate.location === "downtown" &&
    candidate.activeShift === "dinner" &&
    candidate.operationalMode === "monitoring" &&
    (candidate.preferredDashboardScope === "demo" ||
      candidate.preferredDashboardScope === "restaurant") &&
    (candidate.preferredLocale === "en" || candidate.preferredLocale === "ru") &&
    typeof candidate.compactMode === "boolean" &&
    typeof candidate.notificationsEnabled === "boolean"
  );
}

"use client";

import * as React from "react";
import { useSession } from "@/components/app/session-provider";
import {
  getDefaultRouteForRole,
  getNavigationForRole,
  hasAnyPermission,
  hasPermission,
  type Permission
} from "@/lib/auth/authorization";

type CurrentAuthorizationContextValue = {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: readonly Permission[]) => boolean;
  navigation: ReturnType<typeof getNavigationForRole>;
  defaultRoute: ReturnType<typeof getDefaultRouteForRole>;
};

const CurrentAuthorizationContext =
  React.createContext<CurrentAuthorizationContextValue | null>(null);

export function CurrentAuthorizationProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useSession();
  const role = currentUser.effectiveRole;
  const value = React.useMemo<CurrentAuthorizationContextValue>(
    () => ({
      hasPermission: (permission) =>
        hasPermission(role, permission),
      hasAnyPermission: (permissions) =>
        hasAnyPermission(role, permissions),
      navigation: getNavigationForRole(role),
      defaultRoute: getDefaultRouteForRole(role)
    }),
    [role]
  );

  return (
    <CurrentAuthorizationContext.Provider value={value}>
      {children}
    </CurrentAuthorizationContext.Provider>
  );
}

export function useCurrentAuthorization() {
  const value = React.useContext(CurrentAuthorizationContext);
  if (!value) {
    throw new Error(
      "useCurrentAuthorization must be used within CurrentAuthorizationProvider"
    );
  }
  return value;
}

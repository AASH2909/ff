"use client";

import * as React from "react";
import {
  defaultCurrentUser,
  type CurrentUser
} from "@/components/app/current-authorization";
import {
  getDefaultRouteForRole,
  getNavigationForRole,
  hasAnyPermission,
  hasPermission,
  type Permission
} from "@/lib/auth/authorization";

type CurrentAuthorizationContextValue = {
  currentUser: CurrentUser;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: readonly Permission[]) => boolean;
  navigation: ReturnType<typeof getNavigationForRole>;
  defaultRoute: ReturnType<typeof getDefaultRouteForRole>;
};

const CurrentAuthorizationContext =
  React.createContext<CurrentAuthorizationContextValue | null>(null);

export function CurrentAuthorizationProvider({
  children,
  currentUser = defaultCurrentUser
}: {
  children: React.ReactNode;
  currentUser?: CurrentUser;
}) {
  const value = React.useMemo<CurrentAuthorizationContextValue>(
    () => ({
      currentUser,
      hasPermission: (permission) =>
        hasPermission(currentUser.role, permission),
      hasAnyPermission: (permissions) =>
        hasAnyPermission(currentUser.role, permissions),
      navigation: getNavigationForRole(currentUser.role),
      defaultRoute: getDefaultRouteForRole(currentUser.role)
    }),
    [currentUser]
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

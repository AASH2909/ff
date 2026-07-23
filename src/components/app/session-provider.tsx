"use client";

import * as React from "react";
import type { ApplicationSession } from "@/components/app/application-session";

const SessionContext = React.createContext<ApplicationSession | null>(null);

export function SessionProvider({
  children,
  session
}: {
  children: React.ReactNode;
  session: ApplicationSession;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = React.useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return session;
}

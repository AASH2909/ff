import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { CurrentAuthorizationProvider } from "@/components/app/current-authorization-provider";
import { SessionProvider } from "@/components/app/session-provider";
import { resolveApplicationSession } from "@/lib/auth/application-session-server";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const session = await resolveApplicationSession();
  if (!session) redirect("/unauthorized");

  return (
    <SessionProvider session={session}>
      <CurrentAuthorizationProvider>
        <AppShell>{children}</AppShell>
      </CurrentAuthorizationProvider>
    </SessionProvider>
  );
}

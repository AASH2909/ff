import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { CurrentAuthorizationProvider } from "@/components/app/current-authorization-provider";
import { resolveCurrentAuthorizationUser } from "@/lib/auth/current-user-server";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const currentUser = await resolveCurrentAuthorizationUser();
  if (!currentUser) redirect("/unauthorized");

  return (
    <CurrentAuthorizationProvider currentUser={currentUser}>
      <AppShell>{children}</AppShell>
    </CurrentAuthorizationProvider>
  );
}

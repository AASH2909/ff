import { createApplicationSession } from "@/components/app/application-session";
import { defaultExecutiveWorkspace } from "@/components/app/executive-workspace";
import { resolveCurrentAuthorizationUser } from "@/lib/auth/current-user-server";

export async function resolveApplicationSession() {
  const currentUser = await resolveCurrentAuthorizationUser();
  return currentUser
    ? createApplicationSession(currentUser, defaultExecutiveWorkspace)
    : null;
}

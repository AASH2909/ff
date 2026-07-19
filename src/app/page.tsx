import { redirect } from "next/navigation";
import { getDefaultRouteForRole } from "@/lib/auth/authorization";
import { resolveCurrentAuthorizationUser } from "@/lib/auth/current-user-server";

export default async function Home() {
  const currentUser = await resolveCurrentAuthorizationUser();
  redirect(
    currentUser ? getDefaultRouteForRole(currentUser.role) : "/login"
  );
}

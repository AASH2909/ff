import { SupabaseAuthRepository } from "@/repositories/supabase/supabase-auth-repository";
import { SupabaseDashboardRepository } from "@/repositories/supabase/supabase-dashboard-repository";
import { SupabaseUserRoleRepository } from "@/repositories/supabase/supabase-user-role-repository";
import { createClient } from "@/lib/supabase/server";
import type { AuthRepository } from "@/repositories/interfaces/auth-repository";
import type { DashboardRepository } from "@/repositories/interfaces/dashboard-repository";
import type { UserRoleRepository } from "@/repositories/interfaces/user-role-repository";

export type ServerRepositories = {
  authRepository: AuthRepository;
  dashboardRepository: DashboardRepository;
  userRoleRepository: UserRoleRepository;
};

export async function createServerRepositories(): Promise<ServerRepositories> {
  const supabase = await createClient();

  return {
    authRepository: new SupabaseAuthRepository(supabase),
    dashboardRepository: new SupabaseDashboardRepository(supabase),
    userRoleRepository: new SupabaseUserRoleRepository(supabase)
  };
}

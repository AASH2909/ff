import { slugToRole, type Role } from "@/lib/auth/roles";
import type { UserRoleRepository } from "@/repositories/interfaces/user-role-repository";
import type { AppSupabaseClient } from "@/lib/supabase/types";

export class SupabaseUserRoleRepository implements UserRoleRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async getRolesForUser(userId: string): Promise<Role[]> {
    const { data: assignments, error: assignmentsError } = await this.supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId);

    if (assignmentsError || !assignments || assignments.length === 0) {
      return [];
    }

    const roleIds = assignments.map((assignment) => assignment.role_id);

    const { data: roles, error: rolesError } = await this.supabase
      .from("roles")
      .select("slug")
      .in("id", roleIds);

    if (rolesError || !roles) {
      return [];
    }

    return roles.flatMap((role) => {
      const appRole = slugToRole(role.slug);
      return appRole ? [appRole] : [];
    });
  }
}

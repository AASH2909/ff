import type { Role } from "@/lib/auth/roles";

export interface UserRoleRepository {
  getRolesForUser(userId: string): Promise<Role[]>;
}

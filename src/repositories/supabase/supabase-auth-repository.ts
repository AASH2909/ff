import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AuthRepository } from "@/repositories/interfaces/auth-repository";
import type { Database } from "@/types/database";

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error
    } = await this.supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  }

  async exchangeCodeForSession(code: string): Promise<void> {
    const { error } = await this.supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }
  }
}

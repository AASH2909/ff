import type { User } from "@supabase/supabase-js";

export interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  exchangeCodeForSession(code: string): Promise<void>;
}

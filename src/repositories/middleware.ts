import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import { SupabaseAuthRepository } from "@/repositories/supabase/supabase-auth-repository";
import { SupabaseUserRoleRepository } from "@/repositories/supabase/supabase-user-role-repository";
import type { AuthRepository } from "@/repositories/interfaces/auth-repository";
import type { UserRoleRepository } from "@/repositories/interfaces/user-role-repository";
import type { Database } from "@/types/database";

type MiddlewareRepositories = {
  authRepository: AuthRepository;
  userRoleRepository: UserRoleRepository;
};

type MiddlewareRepositoriesResult = {
  readonly response: NextResponse;
  repositories: MiddlewareRepositories | null;
};

export function createMiddlewareRepositories(request: NextRequest): MiddlewareRepositoriesResult {
  let response = NextResponse.next({
    request
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      response,
      repositories: null
    };
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  }) as unknown as AppSupabaseClient;

  return {
    get response() {
      return response;
    },
    repositories: {
      authRepository: new SupabaseAuthRepository(supabase),
      userRoleRepository: new SupabaseUserRoleRepository(supabase)
    }
  };
}

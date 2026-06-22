# Repositories

Repository interfaces live in `src/repositories/interfaces`.

Supabase-backed implementations live in `src/repositories/supabase`.

React components and route handlers should consume repositories through factories:

- `createServerRepositories()` for Server Components and route handlers.
- `createMiddlewareRepositories()` for middleware because middleware has custom cookie handling.

Keep `supabase.from()` and `supabase.auth.*` calls inside repository implementation classes only.

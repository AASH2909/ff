# Supabase Migrations

Apply migrations with the Supabase CLI:

```bash
supabase db push
```

Or run a local reset during early development:

```bash
supabase db reset
```

## Schema

- `public.users`: application profile table linked one-to-one with `auth.users`.
- `public.roles`: normalized role catalogue with stable `slug` values.
- `public.user_roles`: many-to-many assignments between users and roles.

RLS is enabled on all tables. The baseline policies allow authenticated users to read and update their own profile, read role definitions, and read their own role assignments.

## Roles

Seeded roles:

- `OWNER`
- `ADMIN`
- `CASHIER`
- `COOK`

Database role slugs are lowercase: `owner`, `admin`, `cashier`, `cook`.

New auth users receive a profile automatically, but they do not receive a role automatically. Assign the first owner from a trusted SQL context:

```sql
insert into public.user_roles (user_id, role_id)
select '<auth-user-id>'::uuid, roles.id
from public.roles
where roles.slug = 'owner'
on conflict (user_id, role_id) do nothing;
```

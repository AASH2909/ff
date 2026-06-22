# FF Next.js Foundation

Next.js 15 foundation with TypeScript, Tailwind CSS, App Router, PWA support, mobile-first defaults, and shadcn/ui configuration.

## Installation Commands

Install Node.js 20.11 or newer first, then run:

```bash
npm install
```

If starting from an empty directory instead of this scaffold, the equivalent setup flow is:

```bash
npx create-next-app@15 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install @ducanh2912/next-pwa @radix-ui/react-slot class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
npm install @supabase/ssr @supabase/supabase-js
npx shadcn@latest init
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Folder Structure

```text
.
+-- public/
|   +-- icons/
|   |   +-- icon.svg
|   +-- manifest.webmanifest
+-- src/
|   +-- app/
|   |   +-- globals.css
|   |   +-- layout.tsx
|   |   +-- page.tsx
|   +-- components/
|   |   +-- design-system/
|   |   +-- ui/
|   +-- hooks/
|   +-- lib/
|   |   +-- utils.ts
|   +-- types/
+-- components.json
+-- next.config.ts
+-- package.json
+-- postcss.config.mjs
+-- tailwind.config.ts
+-- tsconfig.json
```

## Notes

- App Router is under `src/app`.
- shadcn/ui is configured through `components.json`; add components with `npx shadcn@latest add <component>`.
- PWA generation is wired through `@ducanh2912/next-pwa` and disabled during development.
- Supabase auth helpers live under `src/lib/supabase` and route authorization lives under `src/lib/auth`.
- Supabase auth callback is available at `/auth/callback`.
- Reusable UI primitives live under `src/components/ui`; product compositions live under `src/components/design-system`.
- App shell routes are `/dashboard`, `/pos`, `/kitchen`, `/inventory`, and `/settings`.
- Application use cases live under `src/application/use-cases`.
- No product features have been built yet.

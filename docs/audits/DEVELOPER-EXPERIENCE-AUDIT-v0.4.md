# Developer Experience Audit v0.4

## Purpose

This document records the start of the RFC-026 Developer Experience phase.

## Sprint 1 Scope

RFC-026 Sprint 1 adds a minimal CI quality gate for CONTROL OS.

The CI workflow runs on:

- Pushes to `master`
- Pull requests targeting `master`

## Sprint 1 Checks

The initial CI gate validates:

- `pnpm lint`
- `pnpm build`

These checks match the current project scripts and keep the sprint focused on build and lint reliability.

## Deferred Work

In Sprint 1, automated tests were intentionally deferred to a later RFC-026 sprint.

No test framework, Husky hooks, database changes, or product code changes were introduced in Sprint 1.

## Sprint 2 Scope

RFC-026 Sprint 2 adds the Vitest testing foundation.

The current test scope is TypeScript unit tests for deterministic domain and service behavior.

The testing foundation includes:

- Root `vitest.config.ts`
- First unit test at `src/timeline/domain/value-objects/timeline-severity.test.ts`

The first test covers timeline severity constants, type guard behavior, normalization, and invalid input errors.

The CI quality gate now validates:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Deferred Testing Scope

UI component tests and end-to-end tests are intentionally deferred to later sprints.

React Testing Library and browser-based E2E tooling are not introduced in Sprint 2.

The current testing scope remains unit tests only.

## Sprint 3 Scope

RFC-026 Sprint 3 adds lightweight local pre-commit quality gates.

The local pre-commit hook runs:

- `pnpm lint-staged`

For staged TypeScript and TSX files, lint-staged runs:

- `pnpm lint`
- `pnpm test`

The pre-commit gate is intentionally lightweight and does not run the production build.

CI remains the full quality gate and continues to run:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Build validation is intentionally deferred to CI instead of running on every local commit.

## Sprint 4 Scope

RFC-026 Sprint 4 adds test coverage visibility to the Vitest foundation.

Coverage is generated with the Vitest V8 coverage provider and reports:

- Text summary in the terminal
- LCOV output in `coverage/lcov.info`
- HTML report in `coverage/`

The CI quality gate now validates:

- `pnpm lint`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm build`

Coverage is reported but not enforced with strict thresholds yet.

Coverage thresholds are deferred until CONTROL OS has broader unit coverage across domain and service modules.

## Sprint 5 Scope

RFC-026 Sprint 5 modernizes linting by migrating from deprecated `next lint` to the ESLint CLI.

The lint entry point is now:

- `pnpm lint`

which runs:

- `eslint .`

The project now uses a root `eslint.config.mjs` flat config for ESLint 9 compatibility with Next.js recommended rules.

RFC-026 now provides:

- CI quality gate
- TypeScript unit testing with Vitest
- Coverage visibility
- Local pre-commit gates with Husky and lint-staged
- Modern ESLint CLI linting

The next phase after RFC-026 can return to product work, including the planned AI provider integration path.

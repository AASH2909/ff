# DDD Audit v0.3

## Purpose

This document records the DDD boundary decisions made during Platform Audit v0.3.

## Current Bounded Contexts

CONTROL OS currently contains the following bounded contexts:

- Dashboard
- Recommendation
- AI Summary
- Analytics Context
- Notification
- Predictive
- Timeline
- Decision
- Copilot
- Core POS / Inventory / Shift / Payment

## Core Foundation Layer

The current folders:

- `src/domain`
- `src/application`
- `src/repositories`

represent the early Core POS foundation layer.

They contain the original transactional domain around:

- Orders
- Payments
- Products
- Inventory
- Shifts

These folders should not be moved during this audit.

A future dedicated refactor may move them to:

- `src/core/domain`
- `src/core/application`
- `src/core/repositories`

## Dashboard Read Model Classification

Dashboard domain objects such as:

- `DashboardOverview`
- `DashboardAlert`
- `DashboardInsight`
- `ControlScoreSnapshot`
- `DomainScoreSnapshot`
- `ScoreTrendPoint`

are currently treated as dashboard read models / analytics projections.

They are not considered transactional aggregates.

## Copilot Metadata Classification

`CopilotMetadata` should be reviewed in a future targeted refactor.

Decision rule:

- If it has identity and lifecycle, keep it as an entity.
- If it only decorates sessions, messages, answers, or snapshots, move it to value objects.

No refactor is performed during this audit.

## Future Refactor Candidates

- Move `src/domain` to `src/core/domain`
- Move `src/application` to `src/core/application`
- Move `src/repositories` to `src/core/repositories`
- Normalize the Fraud module structure
- Normalize the Audit module structure

## Decision

No production code changes are required for this audit step.

The current DDD structure is approved, with future refactor candidates documented.

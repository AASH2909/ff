# ADR-004: Executive Timeline

## Status

Accepted

## Context

CONTROL OS needs an executive-facing way to explain why the platform reached its current operational state. Raw events, audit records, predictions, incidents, recommendations and score outputs are useful, but executives need a causal sequence that connects them into a business explanation.

## Decision

Executive Timeline is a causal explanation layer. It stores timeline entries and links that explain how known platform outputs relate to each other, such as operational facts, causes, effects, recommendations and predictions.

Timeline may be fed by:

- Analytics Context
- Predictive Analytics
- Event Bus events

Timeline must not be directly coupled to:

- Dashboard
- Recommendation
- Notification
- AI Summary
- Fraud
- Audit

Those modules can influence Timeline only through approved upstream outputs, primarily Analytics Context, Predictive Analytics or future event contracts.

## Rationale

Executive Timeline is not the Audit Log. Audit records are compliance-grade facts about who did what, when and to which resource. Timeline is not evidence storage and must not duplicate audit responsibilities.

Executive Timeline is not the Event Bus. The Event Bus transports domain events between modules. Timeline does not replace event delivery or event storage; it creates human-readable causal explanations from existing outputs.

Timeline exists because executive users need to understand cause and effect, not only current metrics. It answers questions like: what changed, what caused it, what followed, and what the platform predicts next.

## Consequences

Timeline must remain deterministic, explainable and read-model oriented. It must not introduce AI, ML, score calculation, recommendation generation or notification generation.

This layer becomes important for future Decision Simulator and AI Copilot work because both need a trusted causal context instead of querying every operational module directly.

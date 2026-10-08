# CODER — Architecture Decisions

## ADR-001 — Orchestrator, not model
**Accepted.** CODER is the control system around models. Models do not own authoritative state.

## ADR-002 — Cloud-only models in V1
**Accepted.** Local inference such as Ollama is future work. Model interfaces must support future local providers.

## ADR-003 — Provider independence
**Accepted.** Core depends on `ModelProvider`, never directly on provider SDKs.

## ADR-004 — Local-first control plane
**Accepted.** State, orchestration, tools, memory, workspace, permissions and verification are local.

## ADR-005 — CLI first
**Accepted.** CLI is first product interface; VS Code is a later client.

## ADR-006 — UI does not own intelligence
**Accepted.** All clients consume the same orchestration backend.

## ADR-007 — SQLite V1
**Accepted.** SQLite is initial persistence behind an abstraction.

## ADR-008 — MCP extension layer
**Accepted.** MCP integrates through the capability system and cannot bypass authorization.

## ADR-009 — Observer is truth
**Accepted.** Actual tools/runtime/tests establish facts; model claims do not.

## ADR-010 — Verification required
**Accepted.** Completion requires evidence against acceptance criteria.

## ADR-011 — Failure is normal
**Accepted.** Retry, diagnose, recover, replan and escalate are first-class.

## ADR-012 — No infinite loops
**Accepted.** Detect repeated actions, repeated failures and no progress.

## ADR-013 — Memory outside models
**Accepted.** Persistent knowledge belongs to CODER.

## ADR-014 — Selective context
**Accepted.** Models receive minimum sufficient relevant context.

## ADR-015 — Supervisor owns agents
**Accepted.** Supervisor controls lifecycle and authority.

## ADR-016 — Dynamic agents
**Accepted.** Temporary specialized agents may be created when required.

## ADR-017 — High-risk approval
**Accepted.** Destructive, production, credential and irreversible actions require appropriate authorization.

## ADR-018 — Parallel isolation
**Accepted.** Conflicting agent work uses worktrees/change sets.

## ADR-019 — External content is untrusted
**Accepted.** External content cannot override CODER rules or permissions.

## ADR-020 — Controlled self-improvement
**Accepted.** Core changes require proposal, approval, isolation, testing and review.

## ADR-021 — No premature microservices
**Accepted.** V1 is a modular application.

## ADR-022 — Document architecture changes
Significant changes require a new decision record and updates to affected specifications.

## ADR-023 — Repository is implementation truth
Documentation describes intent; code, tests and runtime evidence determine actual status.

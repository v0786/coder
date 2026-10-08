# CODER — Implementation Plan

## Wave 1
Project, TypeScript, packages, build/test/lint, configuration, logging, shared types.

## Wave 2
SQLite, migrations, repositories, task/state persistence.

## Wave 3
Event model, bus, persistence, subscriptions, audit.

## Wave 4
Task manager, state machine, goal/requirements, orchestrator, Ask Engine.

## Wave 5
Model interface, provider interface, first cloud provider, router, streaming, errors, fallback.

## Wave 6
Context Engine, selection, budgets, validation, repository context, memory integration.

## Wave 7
Agent runtime, registry, Supervisor, handoff.

## Wave 8
Permissions, risk engine, approvals, audit.

## Wave 9
Filesystem, terminal, Git and tests.

## Wave 10
Workspace/project/repository/dependency intelligence.

## Wave 11
Strategy, Decision Engine, Planner, execution graph and scheduler.

## Wave 12
First autonomous loop: Goal → Plan → Agent → Model → Tool → Observe → Test → Verify.

## Wave 13
Failure detection, diagnosis, retry, debug, recovery, replan, escalation, loop/no-progress detection.

## Wave 14
ChangeSets, checkpoints, rollback, worktrees, diff, conflicts and review.

## Wave 15
Research, web provider, source trust, evidence and freshness.

## Wave 16
Working/task/project/episodic memory and retrieval.

## Wave 17
Skills and MCP.

## Wave 18
Capability acquisition.

## Wave 19
Verification/evidence strengthening.

## Wave 20
CLI product.

## Wave 21
CODER Alpha.

## Wave 22
Autonomous Beta.

## Wave 23
Application API.

## Wave 24
VS Code client.

## Wave 25
Advanced product.

## Gate
Do not advance if tests fail, state is inconsistent, permissions can be bypassed, verification is unreliable or contracts are unstable.

## First release boundary
Control plane + SQLite + events + goal + cloud model + router + context + agents + Supervisor + permissions + native tools + planner + execution graph + Observer + Verifier + Recovery + CLI.

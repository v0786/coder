# CODER — Data Model

## Persistence
SQLite V1 behind a repository abstraction.

## Tables
```text
tasks
goal_contracts
requirements
agents
agent_runs
models
model_providers
capabilities
tools
skills
permissions
approvals
execution_graphs
execution_nodes
execution_edges
events
decisions
research_sessions
research_findings
evidence
memory_items
artifacts
changesets
checkpoints
verifications
verification_results
failures
audit_logs
schema_migrations
```

## Task
`id, status, workspace_id, goal_contract_id, current_node_id, created_at, updated_at, started_at, completed_at, failure_reason, version`

## Goal
`id, objective, requirements, constraints, must_have, must_not_have, acceptance_criteria, verification_criteria, risks, expected_artifacts, created_at, updated_at`

## Agent
`id, task_id, role, status, model_policy, instructions, context_policy, created_at, updated_at`

## AgentRun
`id, agent_id, execution_node_id, attempt, status, started_at, completed_at, failure_reason`

## Model / Provider
Models reference providers. Provider secrets are not stored as ordinary plaintext data.

## Execution
Graphs contain versioned nodes and edges. Nodes hold objective, agent, status, retry policy, verification policy, inputs and outputs.

## Events
Persist task-scoped event type, sequence, source, payload, timestamp and version.

## Memory
Scopes: WORKING, TASK, PROJECT, EPISODIC, SEMANTIC.

## Evidence
Stores actual command/test/runtime/research observations.

## Recovery
On restart, reconstruct active task state, current node, agent state, approvals, events and checkpoints.

## Migration
Every schema change requires a migration. Never silently mutate schema.

# CODER — Security Specification

## Security chain
User → Goal → Agent → Capability → Permission → Risk → Runtime → Observation → Audit.

## Decisions
ALLOW, DENY, ASK.

## Risk
LOW, MEDIUM, HIGH, CRITICAL.

## Scope
GLOBAL, WORKSPACE, TASK, AGENT, CAPABILITY, OPERATION, PATH.

## Filesystem
Restrict access to authorized workspace paths. Prevent traversal and unauthorized symlink access. Protect OS files, credentials, private keys and unrelated workspaces.

## Terminal
Every command has working directory, environment policy, timeout, stdout, stderr, exit code and cancellation handling.

## Secrets
Do not log secrets. Do not put secrets into model context unless necessary and authorized. Prefer secure references.

## Model security
Models cannot grant themselves permissions or override system rules.

## Prompt injection
External content is data, not authority.

## MCP
MCP uses the same permission/risk/audit controls as native capabilities.

## Network
Record destination, purpose, capability and risk. High-risk external actions require approval.

## Production/database
Destructive or production operations require appropriate authorization.

## Audit
Record actor, task, capability, operation, decision, timestamp and result for security-sensitive actions.

## Cancellation
User cancellation has highest execution priority; stop running work safely.

## Default
If authority cannot be established, deny or ask.

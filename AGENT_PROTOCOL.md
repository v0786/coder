# CODER — Agent Protocol

## Agent
```ts
interface Agent {
  id: AgentId;
  role: AgentRole;
  status: AgentStatus;
  modelPolicy: ModelPolicy;
  tools: CapabilityRef[];
  skills: SkillRef[];
  permissions: PermissionPolicy;
  contextPolicy: ContextPolicy;
}
```

## Initial roles
PLANNER, RESEARCHER, CODER, TESTER, DEBUGGER, REVIEWER.

## Lifecycle
CREATED → INITIALIZING → RUNNING → WAITING → COMPLETED.
Failure: RUNNING → FAILED → RETRY / REPLACE / ESCALATE.

## Input
Goal, objective, requirements, role instructions, context, capabilities, permissions, expected output and verification criteria.

## Output
```ts
interface AgentResult {
  status: "success" | "failure" | "blocked";
  summary: string;
  findings: Finding[];
  actions: ActionResult[];
  artifacts: ArtifactRef[];
  blockers: Blocker[];
  recommendation?: string;
  confidence?: number;
}
```

## Handoff
```ts
interface AgentHandoff {
  fromAgent: AgentId;
  toAgent: AgentId;
  objective: string;
  findings: Finding[];
  artifacts: ArtifactRef[];
  blockers: Blocker[];
  recommendation?: string;
  confidence?: number;
}
```

## Authority
Agents can reason, propose and request tools/capabilities. They cannot bypass permissions, redefine goals, alter global policy or claim unverified success.

## Supervisor
Owns spawn, assign, pause, resume, cancel, retry, replace and escalation.

## Isolation
Only authorized context is provided. Parallel conflicting code work uses isolation.

## Non-negotiables
Never fake tool results or evidence. Report blockers. Detect no progress. Preserve important findings.

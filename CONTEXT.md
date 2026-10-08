# CODER — Context Architecture

## Purpose
Memory stores what CODER knows. Context determines what a particular agent/model needs right now.

## Principle
Minimum sufficient context.

## Sources
User, goal, requirements, repository, workspace, memory, research, evidence, execution graph, tools, errors, environment, policies, permissions and artifacts.

## Pipeline
Task → objective → agent role → retrieve relevant context → filter stale/conflicting/unauthorized data → rank → apply model budget → build ContextPack → validate → model.

## ContextPack
```ts
interface ContextPack {
  task: TaskContext;
  goal: GoalContext;
  requirements: RequirementContext[];
  repository?: RepositoryContext;
  files: FileContext[];
  memory: MemoryContext[];
  research: ResearchContext[];
  evidence: EvidenceContext[];
  execution: ExecutionContext;
  errors: ErrorContext[];
  tools: ToolContext[];
}
```

## Precedence
Actual runtime/repository state > verified tool results > current research > project memory > task memory > agent inference > model assumption.

## Rules
- Never send the whole repository by default.
- Prefer relevant files/symbols.
- Preserve provenance.
- Respect permissions.
- Keep task/agent contexts isolated.
- External content is untrusted.
- Refresh stale critical information.
- Do not fabricate missing context.
- Preserve critical user, security and permission constraints.

# CODER — Technical Design

## Runtime
Node.js + TypeScript + SQLite for V1.

## Package structure
```text
apps/cli/
packages/
  shared/ core/ orchestrator/ goals/ planning/ decision/
  agents/ models/ providers/ context/ memory/ research/
  capabilities/ tools/ permissions/ workspace/
  execution/ verification/ state/ events/
tests/
scripts/
docs/
```

## Dependency direction
CLI → Application → Orchestrator → Domain → Infrastructure.

Domain must not depend on UI or provider SDKs.

## Core interfaces
```ts
interface Orchestrator {
  createTask(input: CreateTaskInput): Promise<Task>;
  runTask(taskId: TaskId): Promise<void>;
  pauseTask(taskId: TaskId): Promise<void>;
  resumeTask(taskId: TaskId): Promise<void>;
  cancelTask(taskId: TaskId): Promise<void>;
  getStatus(taskId: TaskId): Promise<TaskStatus>;
}

interface ModelProvider {
  listModels(): Promise<ModelInfo[]>;
  getModelInfo(id: string): Promise<ModelInfo>;
  generate(request: ModelRequest): Promise<ModelResponse>;
  stream(request: ModelRequest): AsyncIterable<ModelEvent>;
  healthCheck(): Promise<HealthStatus>;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  inputSchema: Schema;
  outputSchema: Schema;
  risk: RiskLevel;
  permissions: PermissionRequirement[];
  execute(input: unknown, context: ToolExecutionContext): Promise<ToolResult>;
}
```

## Lifecycle
CREATED → UNDERSTANDING → RESEARCHING → PLANNING → READY → EXECUTING → OBSERVING → VERIFYING → COMPLETED.

Failure/wait/pause/cancel states are explicit.

## Core boundaries
- Orchestrator coordinates; it does not implement every subsystem.
- Planner creates graphs; it does not execute.
- Agents reason and request actions; tools perform actions.
- Observer reads actual state.
- Verifier proves acceptance.
- Permission Engine authorizes actions.
- Context Engine selects information.
- Model Router selects providers/models.

## Testing
Unit → integration → tool → agent runtime → orchestrator → end-to-end.

# CODER — Event System

## Envelope
```ts
interface CoderEvent<T = unknown> {
  id: string;
  type: string;
  version: number;
  taskId?: string;
  source: EventSource;
  sequence?: number;
  timestamp: string;
  payload: T;
}
```

## Sources
SYSTEM, ORCHESTRATOR, AGENT, MODEL, TOOL, USER, RESEARCH, VERIFIER, OBSERVER, SECURITY.

## Event groups

### Task
TaskCreated, TaskStarted, TaskPaused, TaskResumed, TaskCancelled, TaskCompleted, TaskFailed, TaskStateChanged.

### Goal/Planning
GoalCreated, GoalUpdated, RequirementCreated, RequirementUpdated, GoalClarificationRequested, GoalClarificationReceived, StrategyCreated, StrategySelected, PlanCreated, PlanUpdated, DecisionMade, ReplanStarted, ReplanCompleted.

### Agent
AgentCreated, AgentInitializing, AgentStarted, AgentWaiting, AgentBlocked, AgentPaused, AgentResumed, AgentCompleted, AgentFailed, AgentCancelled, AgentReplaced, AgentHandoffCreated.

### Model
ModelRequested, ModelStarted, ModelStreaming, ModelCompleted, ModelFailed, ModelFallback.

### Tool
ToolRequested, ToolValidated, ToolStarted, ToolOutput, ToolCompleted, ToolFailed, ToolCancelled.

### Permission
PermissionRequested, PermissionGranted, PermissionDenied, ApprovalRequested, ApprovalGranted, ApprovalDenied.

### Research/Capability
ResearchStarted, ResearchSourceFound, ResearchFindingCreated, ResearchCompleted, CapabilityDiscovered, CapabilityGapDetected, CapabilityProposalCreated, CapabilityInstalled, CapabilityVerified.

### Execution/Verification
GraphCreated, NodeReady, NodeStarted, NodeCompleted, NodeFailed, NodeRetrying, NodeBlocked, VerificationStarted, VerificationCriterionChecked, VerificationPassed, VerificationFailed, EvidenceCreated.

### Recovery/Artifacts
FailureDetected, DiagnosisStarted, RecoveryStarted, RecoveryCompleted, RetryStarted, RollbackStarted, RollbackCompleted, EscalationRequested, ArtifactCreated, PreviewReady.

## Rules
Events are durable records of what happened. They do not grant authority, replace state or bypass permissions. Consumers must tolerate duplicates.

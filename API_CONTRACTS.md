# CODER — API Contracts

## Boundary
CLI, VS Code and future clients communicate with the same application API and orchestrator.

## Tasks
```text
POST   /tasks
GET    /tasks
GET    /tasks/:id
POST   /tasks/:id/run
POST   /tasks/:id/pause
POST   /tasks/:id/resume
POST   /tasks/:id/cancel
```

## Agents
```text
GET /tasks/:id/agents
GET /agents/:id
```

## Execution
```text
GET /tasks/:id/graph
GET /tasks/:id/execution
```

## Events
```text
GET /tasks/:id/events
```
Future streaming may use SSE/WebSocket.

## Approvals
```text
GET  /tasks/:id/approvals
POST /approvals/:id/approve
POST /approvals/:id/deny
```

## Artifacts
```text
GET /tasks/:id/artifacts
GET /artifacts/:id
```

## Research
```text
GET  /tasks/:id/research
POST /tasks/:id/research
```

## Capabilities
```text
GET /capabilities
GET /capabilities/:id
POST /capabilities/:id/verify
```

## Models
```text
GET /models
GET /models/:id
GET /providers
```

## Error
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task does not exist.",
    "requestId": "..."
  }
}
```

## Rules
Validate input, authorize actions, return structured errors, never bypass the orchestrator, and never let clients directly mutate domain state.

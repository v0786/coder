# CODER — Architecture

## System
```text
USER
 ↓
CLI / VS Code / Future Clients
 ↓
ORCHESTRATOR
 ├─ Goal / Requirements
 ├─ Decision / Strategy
 ├─ State / Events
 ├─ Knowledge / Research / Evidence
 ├─ Capability / Permissions
 ├─ Model Router
 ├─ Planner / Execution Graph
 ├─ Agent Supervisor
 ├─ Workspace / Tools
 └─ Observer / Verifier / Recovery
```

## Core model
**Model** = inference engine.  
**Agent** = role + model + instructions + context + memory + tools + skills + permissions + lifecycle.  
**Orchestrator** = lifecycle/control authority.  
**Tool** = atomic real-world action.  
**Skill** = reusable workflow.  
**MCP** = external capability extension.  
**Observer** = actual state.  
**Verifier** = proof of completion.

## Key decisions
- V1 models are cloud-only.
- Core never depends directly on a provider SDK.
- SQLite is initial persistence behind an abstraction.
- CLI is first client.
- UI never owns orchestration intelligence.
- Parallel agents use worktree/change-set isolation where needed.
- All actions pass through capabilities, permissions and risk.
- Completion requires evidence.
- State survives restart.
- Self-modification requires explicit controlled workflow.

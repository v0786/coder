# CODER — Product Requirements Document

## Vision
CODER is a goal-to-execution autonomous software engineering orchestrator. The user specifies WHAT should be achieved; CODER determines HOW.

## Product principles
1. Goal first.
2. Models are intelligence providers, not system controllers.
3. Local-first control plane.
4. Cloud-only model inference in V1.
5. Provider independence.
6. Real tools for real actions.
7. Observer over model claims.
8. Verification requires evidence.
9. Failure, recovery and replanning are first-class.
10. Persistent state and resumability.
11. Permissions are mandatory.
12. Context is selective.
13. MCP is an extension layer.
14. CLI first; VS Code later.

## Major systems
Goal/Requirements, Knowledge/Research/Evidence, Capability Engine, Model Router, Agent Supervisor, Context, Memory, Strategy/Decision, Planner, Execution Graph, Tools, Permissions, Workspace, Observer, Progress, Testing, Verifier, Debugger, Recovery, Escalation, Change Management, Artifacts, Audit and Clients.

## Canonical loop
Understand → Goal Contract → Knowledge/Capability Check → Research/Acquire → Strategy → Decision → Plan → Execution Graph → Agents → Execute → Observe → Test → Verify → Evidence → Preview → Done. Failure leads to diagnosis, recovery, replan or escalation.

## V1 success
CODER can accept a real software engineering goal and coordinate research, planning, implementation, testing, verification, recovery and reporting without requiring the user to manually orchestrate each step.

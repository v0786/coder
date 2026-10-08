# CODER — Product Design Direction

## Current direction
CLI first. Future VS Code/desktop client. Same orchestration backend for every interface.

CODER is a command center, not a chatbot.

## UX model
WHAT → HOW → PROGRESS → EVIDENCE → RESULT

## CLI
```bash
coder "Build an appointment dashboard"
coder status
coder tasks
coder inspect
coder agents
coder graph
coder research
coder capabilities
coder models
coder logs
coder artifacts
coder permissions
coder approve
coder deny
coder pause
coder resume
coder cancel
coder replay
coder preview
```

Modes:
`--autonomous`, `--supervised`, `--safe`, `--dry-run`, `--research-only`.

Default task view:
- goal
- status
- current action
- agent
- progress
- important events
- verification
- result

## Future VS Code
Left: CODER navigation. Center: editor/preview. Right: live orchestration panel.

Panels: Tasks, Agents, Graph, Activity, Research, Capabilities, Models, Approvals, Verification, Diff, Artifacts, Preview.

## Not locked yet
Colors, fonts, icon system, final layout, animations, logo, branding and theme.

## Principle
Build the intelligence once. Present it through multiple interfaces.

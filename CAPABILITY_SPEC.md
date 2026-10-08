# CODER — Capability Specification

## Types
TOOL, SKILL, MCP, MODEL, RUNTIME, BROWSER, API, LIBRARY.

## Contract
```ts
interface Capability {
  id: string;
  name: string;
  type: CapabilityType;
  version?: string;
  description: string;
  inputSchema: Schema;
  outputSchema: Schema;
  permissions: PermissionRequirement[];
  risk: RiskLevel;
  status: CapabilityStatus;
}
```

## Initial native tools
read_file, write_file, edit_file, list_directory, search_files, terminal, git_status, git_diff, git_log, run_tests.

## Execution
Request → validation → permission → risk → runtime → observation → result.

## Skills
Skills are reusable higher-level workflows composed from capabilities.

## MCP
MCP Server → adapter → capability registry → permission engine → tool runtime.

MCP cannot bypass native authorization.

## Capability gap
Goal → capability analysis → gap → compose existing capabilities if possible → research alternatives → proposal → approval → acquire → verify → register.

## Acquisition
May involve package, library, MCP, skill, runtime or cloud service.

## Verification
Installation is not proof. Load, health-check and test the capability before registering it as available.

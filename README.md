# CODER - Autonomous Software Engineering System

CODER is an autonomous software engineering system designed to build, manage, and evolve software projects with minimal human intervention. This repository contains the Phase 1 foundation of CODER, establishing a clean, production-oriented TypeScript foundation without implementing autonomous agents, planning, model inference, MCP, skills, browser automation, memory, or the autonomous execution loop yet.

## Architecture Boundaries

CODER follows clean architecture principles with clear boundaries between components:

- `apps/cli` - CLI application foundation (never owns orchestration intelligence)
- `packages/core` - Core functionality and utilities
- `packages/models` - Model interfaces (provider-independent)
- `packages/agents` - Agent interfaces (without implementation)
- `packages/tools` - Tool interfaces
- `packages/workspace` - Workspace management
- `packages/state` - State management
- `packages/config` - Configuration system
- `packages/shared` - Shared types and utilities
- `tests` - Testing infrastructure
- `scripts` - Development and build scripts
- `data` - Data storage (configurable directory)
- `docs` - Documentation

## Development Commands

```bash
# Start development server
npm run dev

# Build production version
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Run formatting
npm run format

# Check formatting
npm run format:check

# Run type checking
npm run type-check

# Clean build artifacts
npm run clean

# Run CODER doctor command
npm run doctor
```

## Current Phase 1 Scope

Phase 1 establishes the foundation of CODER with the following components:

- Git-based modular monolith repository structure
- TypeScript configuration with strict type safety
- ESLint and Prettier with project-wide rules
- Configuration subsystem capable of loading environment variables
- Structured logging foundation with multiple levels and metadata support
- Common typed error hierarchy with categories for different error types
- Testing infrastructure with unit, integration, and fixture directories
- CLI application foundation with `coder doctor` command
- Documentation files (.gitignore, .env.example, LICENSE, CHANGELOG.md)

## Model Inference Providers

In CODER, models are inference providers. The orchestration intelligence remains inside CODER, allowing future phases to add Ollama, model routing, agents, tools, planning, state, memory, MCP, security, and the autonomous execution engine without restructuring the foundation.

## Future Phases

Future phases will build upon this foundation to implement:

- Ollama communication (Phase 2)
- Model routing and inference
- Autonomous agents and planning
- MCP and skills support
- Browser automation and memory
- The autonomous execution loop

## Contribution

Contributions are welcome! Please submit pull requests with clear descriptions of your changes.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

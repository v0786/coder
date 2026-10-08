// Base error class
export class CODERError extends Error {
    name;
    code;
    details;
    constructor(name, code, message, details) {
        super(message);
        this.name = name;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
// Configuration errors
export class ConfigurationError extends CODERError {
    constructor(message, details) {
        super('ConfigurationError', 'CONFIG_ERROR', message, details);
    }
}
// Provider errors
export class ProviderError extends CODERError {
    constructor(message, details) {
        super('ProviderError', 'PROVIDER_ERROR', message, details);
    }
}
// Model errors
export class ModelError extends CODERError {
    constructor(message, details) {
        super('ModelError', 'MODEL_ERROR', message, details);
    }
}
// Agent errors
export class AgentError extends CODERError {
    constructor(message, details) {
        super('AgentError', 'AGENT_ERROR', message, details);
    }
}
// Tool errors
export class ToolError extends CODERError {
    constructor(message, details) {
        super('ToolError', 'TOOL_ERROR', message, details);
    }
}
// Workspace errors
export class WorkspaceError extends CODERError {
    constructor(message, details) {
        super('WorkspaceError', 'WORKSPACE_ERROR', message, details);
    }
}
// Planning errors
export class PlanningError extends CODERError {
    constructor(message, details) {
        super('PlanningError', 'PLANNING_ERROR', message, details);
    }
}
// Execution errors
export class ExecutionError extends CODERError {
    constructor(message, details) {
        super('ExecutionError', 'EXECUTION_ERROR', message, details);
    }
}
// Verification errors
export class VerificationError extends CODERError {
    constructor(message, details) {
        super('VerificationError', 'VERIFICATION_ERROR', message, details);
    }
}
// Permission errors
export class PermissionError extends CODERError {
    constructor(message, details) {
        super('PermissionError', 'PERMISSION_ERROR', message, details);
    }
}
// Helper function to create error instances
export const createError = (type, message, details) => {
    switch (type) {
        case 'ConfigurationError':
            return new ConfigurationError(message, details);
        case 'ProviderError':
            return new ProviderError(message, details);
        case 'ModelError':
            return new ModelError(message, details);
        case 'AgentError':
            return new AgentError(message, details);
        case 'ToolError':
            return new ToolError(message, details);
        case 'WorkspaceError':
            return new WorkspaceError(message, details);
        case 'PlanningError':
            return new PlanningError(message, details);
        case 'ExecutionError':
            return new ExecutionError(message, details);
        case 'VerificationError':
            return new VerificationError(message, details);
        case 'PermissionError':
            return new PermissionError(message, details);
        default:
            return new ConfigurationError('Unknown error type: ' + type, details);
    }
};
// Helper function to log errors
export const logError = (logger, error, details) => {
    if (error instanceof CODERError) {
        logger.error(error.message, {
            error_code: error.code,
            error_name: error.name,
            ...details,
        });
    }
    else {
        logger.error(error.message, {
            error_code: 'UNKNOWN_ERROR',
            error_name: error.name,
            ...details,
        });
    }
};
//# sourceMappingURL=index.js.map
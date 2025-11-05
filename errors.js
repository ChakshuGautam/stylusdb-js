/**
 * Custom error classes for StylusDB
 * Provides specific error types for better error handling and debugging
 */

/**
 * Base error class for all StylusDB errors
 */
class StylusDBError extends Error {
    constructor(message, code) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Database related errors
 */
class DatabaseError extends StylusDBError {
    constructor(message, operation) {
        super(message, 'DB_ERROR');
        this.operation = operation;
    }
}

/**
 * Raft consensus related errors
 */
class RaftError extends StylusDBError {
    constructor(message, state) {
        super(message, 'RAFT_ERROR');
        this.state = state;
    }
}

/**
 * Network communication errors
 */
class NetworkError extends StylusDBError {
    constructor(message, address) {
        super(message, 'NETWORK_ERROR');
        this.address = address;
    }
}

/**
 * Configuration errors
 */
class ConfigurationError extends StylusDBError {
    constructor(message, configKey) {
        super(message, 'CONFIG_ERROR');
        this.configKey = configKey;
    }
}

/**
 * Validation errors
 */
class ValidationError extends StylusDBError {
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR');
        this.field = field;
    }
}

/**
 * Timeout errors
 */
class TimeoutError extends StylusDBError {
    constructor(message, operation, timeout) {
        super(message, 'TIMEOUT_ERROR');
        this.operation = operation;
        this.timeout = timeout;
    }
}

/**
 * Error handler utility functions
 */
class ErrorHandler {
    /**
     * Checks if an error is operational (expected) vs programming error
     */
    static isOperationalError(error) {
        if (error instanceof StylusDBError) {
            return true;
        }
        return false;
    }

    /**
     * Formats error for logging
     */
    static formatError(error) {
        return {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack,
            ...error,
        };
    }

    /**
     * Handles promise rejection
     */
    static handleRejection(reason, promise) {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Application specific logging, throwing an error, or other logic here
    }

    /**
     * Handles uncaught exception
     */
    static handleException(error) {
        console.error('Uncaught Exception:', error);
        // Graceful shutdown recommended for uncaught exceptions
    }
}

module.exports = {
    StylusDBError,
    DatabaseError,
    RaftError,
    NetworkError,
    ConfigurationError,
    ValidationError,
    TimeoutError,
    ErrorHandler,
};

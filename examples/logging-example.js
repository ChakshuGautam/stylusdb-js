/**
 * Example demonstrating the new logging and error handling system
 */

const logger = require('../logger');
const { DatabaseError, NetworkError, ErrorHandler } = require('../errors');

// Create module-specific logger
const moduleLogger = logger.createModuleLogger('example');

// Example 1: Basic logging
function demonstrateLogging() {
    logger.info('Application starting...');
    logger.debug('Debug information', { user: 'admin', action: 'login' });
    logger.warn('This is a warning');
    logger.error('This is an error', { errorCode: 'ERR001' });

    moduleLogger.info('Module-specific log message');
}

// Example 2: Error handling
function demonstrateErrorHandling() {
    try {
        // Simulated database operation
        throw new DatabaseError('Failed to connect to database', 'connect');
    } catch (error) {
        if (ErrorHandler.isOperationalError(error)) {
            logger.error('Operational error occurred', ErrorHandler.formatError(error));
            // Handle gracefully
        } else {
            logger.error('Programming error', error);
            // Might need to restart
        }
    }
}

// Example 3: Async error handling
async function demonstrateAsyncErrors() {
    try {
        // Simulated network operation
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new NetworkError('Connection timeout', 'tcp://localhost:8080'));
            }, 100);
        });
    } catch (error) {
        logger.error('Network operation failed', {
            error: error.message,
            address: error.address,
        });
    }
}

// Run examples
if (require.main === module) {
    logger.info('=== Logging Examples ===');
    demonstrateLogging();
    demonstrateErrorHandling();
    demonstrateAsyncErrors();
}

module.exports = {
    demonstrateLogging,
    demonstrateErrorHandling,
    demonstrateAsyncErrors,
};

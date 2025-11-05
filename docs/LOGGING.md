# Logging Guide

## Overview

StylusDB uses [Winston](https://github.com/winstonjs/winston) for structured logging. This provides consistent, configurable logging across the application.

## Usage

### Basic Logging

```javascript
const logger = require('./logger');

logger.info('Server started successfully', { port: 8080 });
logger.debug('Processing request', { requestId: '123' });
logger.warn('High memory usage detected', { usage: '85%' });
logger.error('Failed to connect to database', { error: err.message });
```

### Module-specific Logging

Create a child logger for your module:

```javascript
const logger = require('./logger');
const moduleLogger = logger.createModuleLogger('raft');

moduleLogger.info('Raft leader elected', { leaderId: 'node-1' });
```

### Log Levels

- **error**: Error events that might still allow the application to continue
- **warn**: Warning messages for potentially harmful situations
- **info**: Informational messages highlighting application progress
- **http**: HTTP request logging
- **verbose**: Verbose informational messages
- **debug**: Detailed debug information
- **silly**: Very detailed debug information

### Configuration

Control logging via environment variables:

```bash
# Set log level (default: info)
LOG_LEVEL=debug node index.js

# Set environment (affects console output)
NODE_ENV=production node index.js
```

## Error Handling

### Using Custom Error Classes

```javascript
const { DatabaseError, NetworkError } = require('./errors');

// Throw specific error types
throw new DatabaseError('Connection failed', 'connect');
throw new NetworkError('Timeout', 'tcp://localhost:8080');
```

### Error Handler Utilities

```javascript
const { ErrorHandler } = require('./errors');

try {
    // Some operation
} catch (error) {
    if (ErrorHandler.isOperationalError(error)) {
        // Expected error - handle gracefully
        logger.warn('Operational error', ErrorHandler.formatError(error));
    } else {
        // Programming error - might need restart
        logger.error('Programming error', error);
        process.exit(1);
    }
}
```

## Log Files

Logs are written to the `logs/` directory:

- `combined.log`: All logs
- `error.log`: Error-level logs only
- `exceptions.log`: Uncaught exceptions
- `rejections.log`: Unhandled promise rejections

Files are automatically rotated when they reach 5MB, keeping up to 5 files.

## Best Practices

### 1. Use Appropriate Log Levels

```javascript
// Good
logger.info('User logged in', { userId: user.id });
logger.error('Database connection failed', { error: err.message });

// Bad
logger.info('Error occurred'); // Should be error level
logger.error('User clicked button'); // Should be debug level
```

### 2. Include Context

```javascript
// Good
logger.error('Failed to save record', {
    operation: 'save',
    collection: 'users',
    recordId: id,
    error: err.message
});

// Bad
logger.error('Save failed');
```

### 3. Don't Log Sensitive Data

```javascript
// Good
logger.info('User authenticated', { userId: user.id });

// Bad
logger.info('User authenticated', { password: user.password });
```

### 4. Use Structured Logging

```javascript
// Good
logger.info('Request processed', {
    method: 'GET',
    path: '/api/users',
    statusCode: 200,
    duration: 45
});

// Bad
logger.info('GET /api/users returned 200 in 45ms');
```

### 5. Handle Async Errors

```javascript
async function fetchData() {
    try {
        const data = await database.query();
        logger.info('Data fetched successfully', { count: data.length });
        return data;
    } catch (error) {
        logger.error('Failed to fetch data', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}
```

## Examples

See `examples/logging-example.js` for complete working examples.

## Performance Considerations

- Use appropriate log levels in production (info or warn)
- Avoid logging in tight loops
- Use debug/silly levels sparingly
- Consider async logging for high-throughput scenarios

## Troubleshooting

### Logs not appearing

Check your LOG_LEVEL environment variable:
```bash
export LOG_LEVEL=debug
```

### Too much disk space

Adjust maxsize and maxFiles in `logger.js`:
```javascript
maxsize: 5242880,  // 5MB
maxFiles: 5,       // Keep 5 files
```

### Performance impact

Consider:
- Increasing log level (info instead of debug)
- Reducing metadata in logs
- Using async transports

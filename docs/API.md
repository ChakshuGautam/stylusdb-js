# StylusDB API Documentation

## Internal API

Currently, StylusDB uses an internal Axon-based messaging protocol. HTTP API is planned for a future release.

### Message Protocol

#### SET Operation
```javascript
sock.send('SET', { key: 'mykey', value: 'myvalue' }, function(response) {
    console.log(response); // acknowledgment
});
```

#### GET Operation
```javascript
sock.send('GET', { key: 'mykey' }, function(response) {
    console.log(response); // value
});
```

### Configuration API

```javascript
const config = require('./config');

// Get configuration value
const port = config.get('server.port');
const logLevel = config.get('logging.level', 'info');

// Set configuration value (runtime)
config.set('logging.level', 'debug');

// Get all configuration
const allConfig = config.toJSON();
```

### Logger API

```javascript
const logger = require('./logger');

// Basic logging
logger.info('Message', { metadata: 'value' });
logger.warn('Warning message');
logger.error('Error occurred', { error: err });

// Module-specific logger
const moduleLogger = logger.createModuleLogger('mymodule');
moduleLogger.debug('Debug info');
```

### Error Handling API

```javascript
const { DatabaseError, NetworkError, ErrorHandler } = require('./errors');

// Throw custom errors
throw new DatabaseError('Connection failed', 'connect');
throw new NetworkError('Timeout', 'tcp://localhost:8080');

// Check error type
if (ErrorHandler.isOperationalError(error)) {
    // Handle gracefully
}

// Format error for logging
const formatted = ErrorHandler.formatError(error);
```

## Planned HTTP API

Coming in PR10. Will include:

### Endpoints

**POST /api/set**
```json
{
    "key": "mykey",
    "value": "myvalue"
}
```

**GET /api/get/:key**
```json
{
    "key": "mykey",
    "value": "myvalue"
}
```

**GET /api/cluster/status**
```json
{
    "leader": "tcp://0.0.0.0:8081",
    "state": "leader",
    "term": 5,
    "nodes": [...]
}
```

**GET /health**
```json
{
    "status": "healthy",
    "uptime": 12345
}
```

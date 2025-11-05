# TypeScript Support

## Overview

StylusDB provides TypeScript type definitions for better development experience with IDE autocomplete and type checking.

## Installation

The type definitions are included in the package:

```bash
npm install stylusdb
```

## Usage in TypeScript Projects

```typescript
import { StylusDBClient, Config, Logger } from 'stylusdb';

const client = new StylusDBClient({
    baseURL: 'http://localhost:3000',
    timeout: 5000
});

async function example() {
    await client.set('key', 'value');
    const value = await client.get('key');
    console.log(value); // TypeScript knows this is a string
}
```

## Usage in JavaScript Projects with JSDoc

You can get TypeScript benefits in JavaScript files using JSDoc:

```javascript
/**
 * @typedef {import('stylusdb').StylusDBClient} StylusDBClient
 */

/**
 * Initialize client
 * @returns {StylusDBClient}
 */
function createClient() {
    const StylusDBClient = require('stylusdb').StylusDBClient;
    return new StylusDBClient({ baseURL: 'http://localhost:3000' });
}

/**
 * Fetch a value
 * @param {StylusDBClient} client
 * @param {string} key
 * @returns {Promise<string>}
 */
async function getValue(client, key) {
    return await client.get(key);
}
```

## Type Checking JavaScript

Enable type checking in your JavaScript project:

```json
// jsconfig.json
{
    "compilerOptions": {
        "checkJs": true,
        "target": "ES2021",
        "module": "commonjs"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
}
```

Run type checking:
```bash
npm run typecheck
```

## Available Types

### Client
- `StylusDBClient` - HTTP client for StylusDB
- `ClientOptions` - Client configuration options

### Database
- `LMDBManager` - Database manager class

### Errors
- `StylusDBError` - Base error class
- `DatabaseError` - Database operation errors
- `RaftError` - Consensus errors
- `NetworkError` - Network errors
- `ConfigurationError` - Config errors
- `ValidationError` - Validation errors
- `TimeoutError` - Timeout errors

### Configuration
- `Config` - Configuration interface

### Monitoring
- `Monitoring` - Monitoring interface
- `HealthCheck` - Health check interface

### Logging
- `Logger` - Logger interface

## Benefits

1. **IDE Autocomplete:** Get suggestions for methods and properties
2. **Type Safety:** Catch type errors before runtime
3. **Documentation:** Types serve as inline documentation
4. **Refactoring:** Safely refactor code with confidence
5. **Error Prevention:** Prevent common mistakes

## Migration to TypeScript

If you want to migrate the project to TypeScript:

1. Rename `.js` files to `.ts`
2. Update `tsconfig.json` to enable strict mode
3. Fix type errors
4. Remove JSDoc type annotations
5. Update build scripts

See the TypeScript handbook for more information:
https://www.typescriptlang.org/docs/handbook/intro.html

## Contributing Type Definitions

When adding new features:
1. Update `types.d.ts` with new types
2. Run `npm run typecheck` to verify
3. Update this documentation
4. Add JSDoc comments for better intellisense

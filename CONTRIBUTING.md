# Contributing to StylusDB

Thank you for your interest in contributing to StylusDB!

## Development Setup

### Prerequisites
- Node.js 16.x (specified in `.nvmrc`)
- npm 7.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ChakshuGautam/stylusdb-js.git
cd stylusdb-js
```

2. Use the correct Node version:
```bash
nvm use
```

3. Install dependencies:
```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Running the Application

Start a 4-node cluster (open 4 terminals):

```bash
# Terminal 1
npm start -- --port 8081

# Terminal 2
npm start -- --port 8082

# Terminal 3
npm start -- --port 8083

# Terminal 4
npm start -- --port 8084
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass
4. Update documentation if needed
5. Submit a pull request

## Code Style

- We use ESLint and Prettier for code formatting
- Follow existing code conventions
- Write meaningful commit messages

## Questions?

Open an issue on GitHub or reach out to the maintainers.

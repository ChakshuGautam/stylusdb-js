# Quick Start Guide

## For Reviewers

### View All PRs

Visit the GitHub repository and you'll see 12 new pull requests:
- PR1 through PR12, each building on the previous one

### Test a Specific PR

```bash
# Clone the repo
git clone https://github.com/ChakshuGautam/stylusdb-js.git
cd stylusdb-js

# Checkout PR (example: PR5)
git fetch origin
git checkout claude/pr05-logging-011CUpB35UjTaSDFupdJFCWP

# Install and test
npm install
npm test
npm run lint
```

### GitHub CI

Every PR automatically runs:
- ✅ Tests on Node 16.x, 18.x, 20.x
- ✅ Linting checks
- ✅ Format verification
- ✅ Security audit

## For Users

### Quick Deploy with Docker

```bash
# Clone and start 4-node cluster
git clone https://github.com/ChakshuGautam/stylusdb-js.git
cd stylusdb-js
git checkout claude/pr09-docker-011CUpB35UjTaSDFupdJFCWP

docker-compose up -d
```

### Use the HTTP API

```javascript
const { StylusDBClient } = require('stylusdb');

const client = new StylusDBClient({
    baseURL: 'http://localhost:3000'
});

async function example() {
    await client.set('hello', 'world');
    const value = await client.get('hello');
    console.log(value); // 'world'
}
```

### View Metrics

```bash
# Prometheus metrics
curl http://localhost:3000/metrics

# Health check
curl http://localhost:3000/health
```

## Development

### Setup

```bash
git clone https://github.com/ChakshuGautam/stylusdb-js.git
cd stylusdb-js
nvm use  # Uses Node 16
npm install
```

### Run Locally

```bash
# Start a node
npm start -- --port 8081

# In another terminal
npm start -- --port 8082
```

### Run Tests

```bash
npm test
npm run test:coverage
```

### Code Quality

```bash
npm run lint
npm run format
npm run typecheck
```

## What Changed?

See `CHANGELOG.md` for detailed changes.

**TL;DR:** The codebase went from a basic prototype to a production-ready system with:
- Automated testing & CI/CD
- Fixed critical bugs
- Modern code quality tools
- Professional logging & monitoring
- Docker deployment
- HTTP API
- Complete documentation
- TypeScript support

## Need Help?

- 📖 Read `/docs/*.md` for detailed guides
- 🐛 Report issues on GitHub
- 💬 Check examples in `/examples/`
- 📝 Review `/CONTRIBUTING.md`


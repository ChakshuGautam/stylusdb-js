# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD pipeline with multi-version Node.js testing
- Testing infrastructure with Mocha, Chai, and NYC for code coverage
- ESLint and Prettier for code quality and formatting
- Husky pre-commit hooks with lint-staged
- Dependabot configuration for automated dependency updates
- Security policy (SECURITY.md)
- Contributing guidelines (CONTRIBUTING.md)
- EditorConfig for consistent editor settings
- Graceful shutdown handling

### Changed
- Updated dependencies to latest compatible versions:
  - diagnostics: 1.1.x → 2.0.2
  - encoding-down: 6.3.0 → 7.1.0
  - eventemitter3: 4.0.7 → 5.0.1
  - node-lmdb: 0.10.0 → 0.10.1
- Improved package.json with proper description and engine requirements
- Enhanced CI workflow with mandatory linting and formatting checks

### Fixed
- Critical LMDB transaction management bug causing memory leaks
- Undefined variable error in CLI command parser
- Data structure mismatch in proxy SET operation
- Removed infinite test loop running in production

### Security
- Added npm audit scripts for security scanning
- Configured Dependabot for automated security updates
- Added SECURITY.md with vulnerability reporting process

## [1.0.0] - Initial Release

### Added
- Basic Raft consensus implementation
- LMDB-based key-value storage
- Multi-node cluster support
- Axon-based message passing
- Basic REPL interface
- LevelDB logging support

---

[Unreleased]: https://github.com/ChakshuGautam/stylusdb-js/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ChakshuGautam/stylusdb-js/releases/tag/v1.0.0

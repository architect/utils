# Technology Stack

## Runtime & Dependencies
- **Node.js**: Minimum version 16+
- **Core Dependencies**:
  - `@aws-lite/client`: AWS SDK alternative for lightweight AWS operations
  - `chalk`: Terminal string styling for colored output
  - `glob`: File pattern matching
  - `run-series`/`run-waterfall`: Control flow utilities

## Build System & Tooling
- **Package Manager**: npm
- **Linting**: ESLint with `@architect/eslint-config`
- **Testing**: Tape test runner with `tap-arc` formatter
- **Cross-platform**: `cross-env` for environment variable handling

## Common Commands
```bash
# Run all tests with linting
npm test

# Run tests without linting
npm run test:nolint

# Run only unit tests
npm run test:unit

# Run updater-specific tests
npm run test:unit:updater

# Lint and auto-fix code
npm run lint

# Create release candidate
npm run rc
```

## Code Style
- Uses `@architect/eslint-config` for consistent formatting
- CommonJS module system (`require`/`module.exports`)
- Functional programming patterns with minimal classes
- Environment-aware code (respects `ARC_QUIET`, `CI` env vars)

## Testing Approach
- Tape-based unit testing
- Mock AWS credentials and services using `proxyquire` and `sinon`
- Separate test suites for different utility modules
- Cross-platform testing considerations
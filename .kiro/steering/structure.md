# Project Structure

## Root Level Organization
- **`index.js`**: Main entry point that exports all utility functions
- **Individual utility folders**: Each utility has its own folder (e.g., `banner/`, `updater/`)
- **`test/`**: Comprehensive test suite mirroring source structure
- **Configuration files**: ESLint, npm, and Git configuration at root

## Utility Module Pattern
Each utility follows a consistent structure:
```
utility-name/
├── index.js          # Main implementation
├── lib.js            # Supporting library code (if needed)
├── methods.js        # Method definitions (if applicable)
```

## Test Organization
```
test/
├── utility-name/
│   └── index-test.js     # Tests for each utility
├── mock/                 # Mock data and fixtures
│   ├── fingerprint/      # Mock files for fingerprint tests
│   └── project/          # Mock project configurations
└── utils-test.js         # Integration tests for main exports
```

## Key Conventions
- **Single responsibility**: Each utility folder contains one focused feature
- **Consistent exports**: All utilities exported through main `index.js`
- **Test mirroring**: Test structure mirrors source structure exactly
- **Mock isolation**: Test mocks organized by utility in `test/mock/`
- **Cross-platform support**: Path handling utilities for Windows compatibility

## Module Dependencies
- Utilities can depend on each other (e.g., `banner` uses `chars`)
- Shared dependencies managed at package level
- No circular dependencies between utility modules
- Environment variables respected across all utilities (`ARC_QUIET`, `CI`)

## File Naming
- Kebab-case for folder names (`get-lambda-name/`)
- Standard `index.js` for main module exports
- Test files end with `-test.js`
- Mock files clearly labeled with `mock-` prefix where applicable
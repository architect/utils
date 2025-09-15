# Requirements Document

## Introduction

The current README for `@architect/utils` is outdated and incomplete. It only documents 5 utilities (banner, getLambdaName, pathToUnix, toLogicalID, updater) but the actual codebase exports 9 utilities. The missing utilities are: chars, checkCreds, deepFrozenCopy, and fingerprint. Additionally, some existing documentation may need updates to reflect current API signatures and behavior.

## Requirements

### Requirement 1

**User Story:** As a developer using @architect/utils, I want comprehensive API documentation so that I can understand and use all available utilities.

#### Acceptance Criteria

1. WHEN I read the README THEN I SHALL see documentation for all 9 exported utilities
2. WHEN I view each utility's documentation THEN I SHALL see accurate parameter descriptions and return values
3. WHEN I look at the API section THEN I SHALL see utilities organized in a logical order

### Requirement 2

**User Story:** As a developer integrating @architect/utils, I want accurate installation and usage examples so that I can quickly get started.

#### Acceptance Criteria

1. WHEN I read the installation section THEN I SHALL see the correct npm install command
2. WHEN I view usage examples THEN I SHALL see practical code snippets for key utilities
3. WHEN I check the package information THEN I SHALL see current version and license details

### Requirement 3

**User Story:** As a contributor to the Architect ecosystem, I want clear documentation structure so that I can understand the package's role and capabilities.

#### Acceptance Criteria

1. WHEN I read the README THEN I SHALL see a clear description of the package's purpose
2. WHEN I view the API documentation THEN I SHALL see consistent formatting and structure
3. WHEN I look at utility descriptions THEN I SHALL understand their specific use cases within Architect

### Requirement 4

**User Story:** As a developer working with missing utilities, I want documentation for chars, checkCreds, deepFrozenCopy, and fingerprint so that I can use them effectively.

#### Acceptance Criteria

1. WHEN I look for chars utility THEN I SHALL see documentation explaining platform-appropriate CLI characters
2. WHEN I need checkCreds utility THEN I SHALL see documentation for AWS credential validation
3. WHEN I want to use deepFrozenCopy THEN I SHALL see documentation for deep object copying functionality
4. WHEN I need fingerprint utility THEN I SHALL see documentation for static asset fingerprinting

### Requirement 5

**User Story:** As a developer reading documentation, I want accurate and up-to-date parameter information so that I can use the APIs correctly.

#### Acceptance Criteria

1. WHEN I read banner utility docs THEN I SHALL see all current parameter options including any new ones
2. WHEN I view updater utility docs THEN I SHALL see all available methods and their current signatures
3. WHEN I check any utility documentation THEN I SHALL see accurate parameter types and requirements
4. WHEN I look at environment variable documentation THEN I SHALL see all currently supported env vars
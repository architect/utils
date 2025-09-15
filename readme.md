# `@architect/utils` [![GitHub CI status](https://github.com/architect/utils/workflows/Node%20CI/badge.svg)](https://github.com/architect/utils/actions?query=workflow%3A%22Node+CI%22)
<!-- [![codecov](https://codecov.io/gh/architect/utils/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/utils) -->

[@architect/utils][npm] is a collection of common utility functions for the [@architect][arc] framework ecosystem. It provides essential tools for AWS Lambda development, CLI operations, infrastructure management, AWS credential validation, and static asset fingerprinting for serverless applications.

## Installation

    npm i @architect/utils

# API

## `utils.banner(params)`

Responsible for printing the standard banner, displaying environment information including app name, AWS region, profile, version, and current working directory.

**Parameters:**
- `params` (object, optional): Configuration object with the following properties:
  - `inventory` (object, required): Inventory object from `@architect/inventory`
  - `cwd` (string): Current working directory (defaults to `process.cwd()`)
  - `disableBanner` (boolean): Skip printing the banner entirely
  - `version` (string): Package version string to display (defaults to '–')
  - `quiet` (boolean): Disable banner printing

**Returns:** `undefined`

**Example:**
```js
let utils = require('@architect/utils')
let inventory = require('@architect/inventory')

utils.banner({
  inventory,
  version: 'Architect 1.2.3'
})
```

**Environment Variables:**
- `ARC_QUIET` - if truthy, disables printing
- `QUIET` - if truthy, disables printing
- `AWS_REGION` - fallback AWS region if not configured in inventory
- `AWS_PROFILE` - fallback AWS profile if not configured in inventory
- `AWS_ACCESS_KEY_ID` - if set, shows "Set via environment" for profile

## `utils.chars`

Returns platform-appropriate CLI characters for terminal UI printing. Provides different character sets for Windows and Unix-like systems to ensure proper display across platforms.

**Parameters:** None (this is an object, not a function)

**Returns:** Object with the following properties:
- `buzz` (string): Progress indicator character ('⌁' on Unix, '~' on Windows)
- `start` (string): Start indicator character ('⚬' on Unix, '○' on Windows)
- `done` (string): Completion indicator character ('✓' on Unix, '√' on Windows)
- `warn` (string): Warning indicator character ('⚠️' on Unix, '!' on Windows)
- `err` (string): Error indicator character ('×' on Unix, 'x' on Windows)

**Example:**
```js
let utils = require('@architect/utils')
console.log(`${utils.chars.done} Task completed successfully`)
console.log(`${utils.chars.warn} Warning message`)
```

**Related utilities:** Used by `utils.banner()` and `utils.updater()` for consistent CLI character display

## `utils.checkCreds(params, callback)`

Performs basic AWS credential validation by attempting to initialize an AWS client. Used to verify that valid AWS credentials are available before proceeding with AWS operations.

**Parameters:**
- `params` (object, required): Configuration object with the following properties:
  - `inventory` (object, required): Inventory object from `@architect/inventory`
- `callback` (function, optional): Node.js-style callback function `(err) => {}`

**Returns:** Promise if no callback provided, otherwise `undefined`

**Example:**
```js
let utils = require('@architect/utils')
let inventory = require('@architect/inventory')

// With callback
utils.checkCreds({ inventory }, (err) => {
  if (err) console.log('Invalid AWS credentials')
  else console.log('AWS credentials are valid')
})

// With promise
try {
  await utils.checkCreds({ inventory })
  console.log('AWS credentials are valid')
} catch (err) {
  console.log('Invalid AWS credentials')
}
```

## `utils.deepFrozenCopy(obj)`

Creates a deep copy of an object and recursively freezes all nested objects, making the entire structure immutable. Approximately 2x faster than JSON-based deep copying while also providing immutability.

**Parameters:**
- `obj` (any): The object to copy and freeze

**Returns:** Deep frozen copy of the input object

**Example:**
```js
let utils = require('@architect/utils')

let original = { 
  config: { debug: true },
  items: [1, 2, { nested: 'value' }]
}

let frozenCopy = utils.deepFrozenCopy(original)
// frozenCopy is completely immutable
// frozenCopy.config.debug = false // This would throw an error
```

## `utils.fingerprint(params, callback)`

Generates static asset fingerprinting for cache-busting by creating a `static.json` manifest file that maps original filenames to fingerprinted versions with content hashes.

**Parameters:**
- `params` (object, required): Configuration object with the following properties:
  - `inventory` (object, required): Inventory object from `@architect/inventory`
  - `fingerprint` (boolean): Enable fingerprinting (defaults to `inventory.inv.static.fingerprint`)
  - `ignore` (array): Array of file patterns to ignore (defaults to `inventory.inv.static.ignore`)
  - `update` (function): Updater function for progress reporting
- `callback` (function, required): Node.js-style callback function `(err, manifest) => {}`

**Returns:** `undefined`

**Example:**
```js
let utils = require('@architect/utils')
let inventory = require('@architect/inventory')

utils.fingerprint({ 
  inventory,
  fingerprint: true 
}, (err, manifest) => {
  if (err) throw err
  console.log('Generated fingerprint manifest:', manifest)
  // manifest = { 'app.js': 'app-a1b2c3d4e5.js', ... }
})
```

**Environment Variables:**
- Uses inventory configuration for static asset settings

**Related utilities:** Uses `utils.pathToUnix()` internally for cross-platform path handling

## `utils.getLambdaName(fn)`

Converts an Architect route path into a valid AWS Lambda function name by applying character substitutions that comply with Lambda naming requirements (up to 64 characters, letters, numbers, hyphens, and underscores only).

**Parameters:**
- `fn` (string): The Architect route path (e.g., '/api/users/:id')

**Returns:** Valid AWS Lambda function name (string)

**Example:**
```js
let utils = require('@architect/utils')

utils.getLambdaName('/') // Returns: '-index'
utils.getLambdaName('/api/users') // Returns: '-api-users'
utils.getLambdaName('/api/users/:id') // Returns: '-api-users-000id'
utils.getLambdaName('/api/v1.0/users') // Returns: '-api-v1_0-users'
```

**Character Conversion Rules:**
- `/` (root) becomes `-index`
- `-` becomes `_`
- `.` becomes `_`
- `/` becomes `-`
- `\` becomes `-`
- `:` becomes `000`
- `*` becomes `catchall`

**Related utilities:** Works with `utils.toLogicalID()` for CloudFormation resource naming

## `utils.pathToUnix(pathString)`

Converts any file path to Unix-style format with forward slashes as separators. Essential for cross-platform compatibility, especially when running on Windows where backslashes are the default path separator.

**Parameters:**
- `pathString` (string): The file path to convert

**Returns:** Unix-style path string with forward slashes

**Example:**
```js
let utils = require('@architect/utils')

utils.pathToUnix('C:\\Users\\dev\\project') // Returns: 'C:/Users/dev/project'
utils.pathToUnix('/unix/path/already') // Returns: '/unix/path/already'
utils.pathToUnix('relative\\windows\\path') // Returns: 'relative/windows/path'
```

**Related utilities:** Used internally by `utils.fingerprint()` for cross-platform static asset handling

## `utils.toLogicalID(str)`

Converts dash-case strings into PascalCase format suitable for CloudFormation logical IDs. Handles special cases and ensures the output meets CloudFormation naming requirements.

**Parameters:**
- `str` (string): The string to convert to PascalCase

**Returns:** PascalCase string suitable for CloudFormation logical IDs

**Example:**
```js
let utils = require('@architect/utils')

utils.toLogicalID('my-api-function') // Returns: 'MyApiFunction'
utils.toLogicalID('user_profile') // Returns: 'UserProfile'
utils.toLogicalID('get') // Returns: 'GetIndex' (special case)
utils.toLogicalID('api-v1.0') // Returns: 'ApiV10'
```

**Related utilities:** Complements `utils.getLambdaName()` for AWS resource naming conventions

## `utils.updater(name, params)`

Creates a standardized progress indicator and logging utility with multiple output methods. Automatically respects Architect's global printing status and environment variables for consistent CLI experience.

**Parameters:**
- `name` (string, required): Label for the updater (e.g., 'Deploy', 'Build')
- `params` (object, optional): Configuration object with the following properties:
  - `quiet` (boolean): Manually override global printing status
  - `logLevel` (string): Set log level ('normal', 'verbose', 'debug')

**Returns:** Updater object with the following methods:
- `status(message, ...details)` - prints an affirmative status update
- `start(message)` - starts an animated progress indicator (aliases: `update`)
- `done(message)` - ends current progress indicator with an update (aliases: `stop`)
- `cancel()` - cancels current progress indicator without an update
- `err(error)` - pretty prints an error (aliases: `error`, `fail`)
- `warn(message)` - prints a warning (aliases: `warning`)
- `raw(message)` - logs a message as-is while respecting quiet mode
- `get()` - returns current updater state
- `reset()` - resets updater state (aliases: `clear`)
- `verbose` - verbose logging methods
- `debug` - debug logging methods

**Example:**
```js
let utils = require('@architect/utils')

let update = utils.updater('Deploy')
update.start('Deploying application...')
// ... deployment logic ...
update.done('Application deployed successfully')

// With error handling
try {
  // ... some operation ...
} catch (err) {
  update.err(err)
}
```

**Environment Variables:**
- `ARC_QUIET` - if truthy, disables printing
- `QUIET` - if truthy, disables printing  
- `CI` - if truthy, disables certain terminal progress animations

**Related utilities:** Uses `utils.chars` for consistent terminal character display



[arc]: https://github.com/architect
[npm]: https://www.npmjs.com/package/@architect/utils

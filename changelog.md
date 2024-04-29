# Architect Utils changelog

---

## [4.0.5 - 4.0.6] 2024-04-29

### Changed

- Updated dependencies
- Updated `package.json` `engines.node` property to reflect changes from v4

---

## [4.0.4] 2024-03-25

### Changed

- Updated dependencies

---

## [4.0.3] 2024-02-09

### Fixed

- Fixed `MaxListenersExceededWarning` if npm or another package manager resolves many different versions of Utils on the filesystem

---

## [4.0.2] 2024-02-06

### Changed

- Updated `aws-lite`

---

## [4.0.0 - 4.0.1] 2024-02-01

### Added

- Added `checkCreds` method for manually performing basic AWS credential checks


### Changed

- Initializing the Architect banner is significantly faster, as it no longer has any interactions with `aws-sdk`
- Breaking change: banner initialization no longer has any direct responsibility for credential checking
  - Related: banner initialization no longer mutates `AWS_PROFILE`, or uses `ARC_AWS_CREDS` as a signal to other modules about credential loading
  - Modules relying on the banner for credential-related operations must review the changes and refactor accordingly
- Banner initialization no longer utilizes `disableRegion` or `disableProfile` params when printing
- Transitioned from `aws-sdk` to [`aws-lite`](https://aws-lite.org)
- Added Node.js 20.x to test matrix
- Breaking change: removed support for Node.js 14.x (now EOL, and no longer available to created in AWS Lambda)

---

## [3.1.7 - 3.1.9] 2023-04-22

### Changed

- Updated dependencies

---

## [3.1.6] 2023-04-06

### Fixed

- Fixed static asset fingerprinting in Windows

---

## [3.1.3 - 3.1.5] 2023-03-09

### Changed

- Updated deps

---

## [3.1.2] 2022-09-07

### Changed

- Updated deps


### Fixed

- Fix `toLogicalID` to ensures the passed value is coerced to a string

---

## [3.1.1] 2022-04-19

### Fixed

- Guard against invalid credentials file without default profile; thanks @stuartlangridge!

---

## [3.1.0] 2022-01-23

### Added

- Added `deepFrozenCopy` method


### Changed

- Stop publishing to the GitHub Package registry
- Updated deps


### Fixed

- Ensure multi-line error messages passed to `updater.error` do not double print

---

## [3.0.4] 2021-10-12

### Changed

- Updated deps

---

## [3.0.3] 2021-09-18

### Added

- Added `quiet` param to `banner` (instead of relying solely on `ARC_QUIET` or `QUIET` env vars)


### Changed

- Updated dependencies

---

## [3.0.0 - 3.0.2] 2021-07-22

### Added

- Breaking change: removed support for Node.js 10.x (now EOL, and no longer available to created in AWS Lambda) and Node.js 12.x
- Removed support for Architect 5 (and lower)
- Updated dependencies

---

## [2.1.3] 2021-06-21

### Changed

- Updated dependencies

---

## [2.1.2] 2021-06-16

### Added

- Accept `cwd` param in `banner` instead of solely relying on `process.cwd()`

---

## [2.1.1] 2021-06-14

### Fixed

- Fixed `updater` truncated color escape sequence, return correct log data in `updater.start()`

---

## [2.1.0] 2021-05-13

### Added

- Added log levels to `updater`:
  - Pass it a `logLevel` param with one of `normal` (default), `verbose`, or `debug`
  - `verbose` outputs logs at its level and `normal`; `debug` outputs logs at all levels
  - The `quiet` boolean flag still suppresses writing to `stdout`, but all relevant log data is still collected by the updater log buffer (see `get()` + `reset()` below)
- Added `updater.get()`, which returns the captured log buffer
- Added `updater.reset()` (and `updater.clear()` alias) to clear the captured log buffer

---

## [2.0.5] 2021-03-05

### Changed

- `getLambdaName` now sanitizes backslash characters to hyphens

---

## [2.0.4] 2021-01-05

### Added

- Add `updater.raw()`, a console.log passthrough that respects Architect quietude


### Changed

- Updated `updater` tests

---

## [2.0.3] 2020-12-19

### Fixed

- Fixed fingerprinter when called on an app that doesn't have `inv.static`


### Changed

- Updated deps

---

## [2.0.2] 2020-12-04

### Changed

- Updated deps

---

## [2.0.1] 2020-12-01

### Changed

- Fingerprint no longer generates a static folder (and exits early) if not found

---

## [2.0.0] 2020-11-20

### Changed

- Refactored `fingerprint` and `banner` to require an Inventory object
- Removed methods that are now the responsibility of Inventory:
  - `fingerprint.config`
  - `getLayers`
  - `getRuntime`
  - `inventory`
  - `read`
  - `readArc`
  - `validate`
- Removed methods no longer in active use by any Architect projects:
  - `initEnv`
  - `portInUse`

---

## [1.5.14] 2020-11-05

### Added

- `updater` errors now include stack traces


### Changed

- `updater` errors can no longer be quieted – errors are important!

---

## [1.5.13] 2020-10-10

### Fixed

- Updated `fingerprint` glob path to be *nix normalized

---

## [1.5.12] 2020-09-30

### Added

- Add `@http` `*` catchall syntax support to `getLambdaName`

---

## [1.5.11] 2020-08-06

### Fixed

- Fixed issue where `updater` might not get the latest state of `ARC_QUIET` during a long-lived process

---

## [1.5.10] 2020-07-26

### Fixed

- Fixed issue where `updater` might occasionally interfere with certain test reporter outputs

---

## [1.5.9] 2020-06-10

### Fixed

- Fix exit condition of fingerprinter when no files are found

---

## [1.5.8] 2020-06-04

### Added

- Adds support for `@static fingerprint external`


### Changed

- Removed `mkdirp` in favor of Node.js >= 10.x `mkdir` recursive


### Fixed

- Fixes `@static fingerprint ignore` with more recent versions of Architect Parser

---

## [1.5.6 - 1.5.7] 2020-05-17

### Added

- Adds `dotnetcore3.1` support for Lambda, fixes #794
- Instead of the scary red x, `updater.warn` now uses a warning character

---

## [1.5.5] 2020-05-04

### Added

- Adds `ruby2.7` support for Lambda, fixes #794

---

## [1.5.4] 2020-04-22

### Fixed

- Should now restore cursor more reliably when a user quits any workflow that's using `updater`

---

## [1.5.3] 2020-04-07

### Fixed

- Inventory correctly reports custom websocket routes, thanks @mawdesley!

---

## [1.5.1 - 1.5.2] 2020-03-22

### Changed

- Updated dependencies

---

## [1.5.0] 2020-03-10

### Changed

- Replaced `readArc` method with `@architect/parser.readArc`, returns a default Architect project if one is not found in the root of the working directory

---

## [1.4.7] 2020-02-05

### Fixed

- Fixed AWS credential instantiation to ensure that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env vars are backfilled with dummy values in scenarios where valid credentials are not required

---

## [1.4.6] 2020-02-04

### Added

- Added support for `deno` in `getRuntime` method


### Changed

- Updated dependencies

---

## [1.4.5] 2020-01-31

### Added

- Adds better support for quiet mode in `banner` + `updater` with `ARC_QUIET` and legacy `QUIET` env vars


### Changed

- Updated `getRuntime` default runtime to `nodejs12.x` (however, this code path is likely inactive)

---

## [1.4.3 - 1.4.4] 2020-01-03

### Fixed

- Handle credentials in the canonical way while still allowing `profile` and `region` overrides in arc config; thanks @defionscode!

### Changed

- Revert dependency

---

## [1.4.2] 2019-12-26

### Added

- Allow local cred file to be overriden by env vars by specifying `ARC_AWS_CREDS=env`

---

## [1.4.0 - 1.4.1] 2019-12-23

### Added

- AWS credentials can now be loaded via env vars (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
  - Thus, Architect no longer requires a `~/.aws/credentials` file to run
  - Also added AWS session token support via setting `AWS_SESSION_TOKEN` env var
  - Fixes #26; thanks @ryan-roemer!


### Fixed

- Credentials are now properly backfilled with dummy values for banner callers setting `needsValidCreds`, ensuring that certain Architect operations (such as local Sandbox usage) won't crash without a valid `~/aws.credentials` file present

---

## [1.3.10] 2019-12-12

### Changed

- Adds better backwards compatibility support in `inventory` for legacy `src/ws/ws-*` paths

---

## [1.3.9] 2019-11-19

### Added

- Added support for new Lambda runtimes! `nodejs12.x`, `python3.8`, and `java11`


### Changed

- `init` is now its own standalone project! It can be found at [`@architect/create`](https://github.com/architect/create)
- As such, init is now retired and removed from `utils`
- Updated dependencies


### Fixed

- Fixed printing of unnecessary ANSI escape characters in CI environments (`CI` env, or not TTY output)

---

## [1.3.8] 2019-09-29

### Fixed

- Fixes correct inventory paths for `src/ws/*`, which should in turn fix WebSocket function hydration

---

## [1.3.7] 2019-09-22

### Added

- Added support for `@static folder` to `fingerprint`


### Changed

- Updated dependencies

---

## [1.3.5 - 1.3.6] 2019-09-11

### Added

- `updater` now accepts params object, including `{quiet: true}`, which completely disables console printing
- `updater.status` can now be passed a null first param, which only outputs a multi-line supporting status update


## Fixed

- Better isolation of `updater` methods that require TTY, so as to prevent potential boogs


### Changed

- `updater.status` cancels progress

---

## [1.3.4] 2019-09-08

### Added

- `updater` methods now returns whatever they're printing (should you need to capture status)
- Added tests for `updater`


### Changed

- `updater` now always hides the cursor during updating
- Internal changes to `updater` printer API

---

## [1.3.3] 2019-08-28

### Changed

- Updates boilerplate init templates for functions and static assets

---

## [1.3.2] 2019-08-18

### Changed

- Internal change to `update.done()`

---

## [1.3.1] 2019-08-17

### Added

- Added `@views` pragma to inventory
- Added optional `updater.done()` confirmation message
- Calling banner in Arc 5 sets `deprecated` env var

---

## [1.3.0] 2019-08-15

### Added

- Adds `updater()`: an Arc-standardized console status updater and animated progress indicator
- Adds credential initialization fallback routine to `initAWS()`

### Changed

- Massively prettifies the boilerplate static site created by `init()`

---

## [1.2.7] 2019-08-13

### Added

- Added ability to directly access Arc and AWS initializer utils (`initArc()`, `initAWS()`)
- Added AWS credential loader to AWS initializer


### Changed

- `populate-*` utils are now now `init-*`

---

## [1.2.6] 2019-08-12

### Added

- Adds `glob` to satisfy previously inferred dependency

---

## [1.2.5] 2019-08-12

### Changed

- Remove `QUIET` env var as predicate for disabling banner

---

## [1.2.4] 2019-08-10

### Added

- Adds util to normalize local file paths in Windows
- Adds issue / PR templates

---

## [1.2.3] 2019-07-23

### Added

- Adds lib of Windows-compatible special chars set to de-munge printing on Windows machines

---

## [1.2.0-2] 2019-07-15

### Added

- Static asset fingerprint util (and related tests)
  - Responsible for managing `public/static.json`
  - Returns static asset manifest when called
  - Also has `fingerprint.config()` API available for returning `@static fingerprint` and `@static ignore` config

---

## [1.0.13, 1.0.14, 1.0.15, 1.0.16, 1.1.0]

// Needs backfilling!

---

## [1.0.12] 2019-06-17

### Changed

- Tiny console log copy edit

---

## [1.0.10-11] 2019-06-13

### Added

- Adds `populate-arc` module, which loads basic required Architect project config
- Adds `populate-aws` module, which fixes missing (optional) AWS env vars in banner


### Changed

- Disabling banner is now `disableBanner`
- Banner AWS region / profile can now be disabled with `disableRegion` and `disableProfile`
- Common banner logger added in preparation for additional banner customization

---

## [1.0.9] 2019-06-12

### Added
- Option to disable banner printing with `banner({disabled:true})`


### Changed

- Moving towards passing parameters (to things like the banner) instead of using env vars

---

## [1.0.5-8] 2019-06-11

### Added

- Added shared banner printer


### Changed

- Reverted tidying of subfolder structure in service of making requiring a little nicer

---

## [1.0.4] 2019-05-29

### Fixes

- Updates readArc to error if Architect manifest isn't found

---

## [1.0.3] 2019-05-29

### Added

- This here library! Broken out of `@architect/architect`, we will now be maintaining `utils` as a standalone module, and reincorporating it back into future versions of Architect.

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

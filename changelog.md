# Architect Utils changelog

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

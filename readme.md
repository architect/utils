# `@architect/utils` [![GitHub CI status](https://github.com/architect/utils/workflows/Node%20CI/badge.svg)](https://github.com/architect/utils/actions?query=workflow%3A%22Node+CI%22)
<!-- [![codecov](https://codecov.io/gh/architect/utils/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/utils) -->

[@architect/utils][npm] are common utilities for the [@architect][arc] suite of projects.

## Installation

    npm i @architect/utils

# API

## `utils.banner(params)`

Responsible for printing the standard banner, and loading the basic environment variables and necessary AWS credentials necessary to run Architect.

`params` are required with the following available properties:

- `inventory` (required): Inventory object from `@architect/inventory`
- `disableBanner` (boolean): skip printing the banner and Architect's AWS environment bootstrapping routines
- `disableRegion` (boolean): don't print the AWS region (useful in public CI scenarios, for example)
- `disableProfile` (boolean): don't print the AWS profile (also useful in public CI scenarios)
- `version` (string): the package version string to print out (e.g. `Architect 1.2.3`)
- `quiet` (boolean): disable banner printing


## `utils.getLambdaName(fn)`

Returns a valid AWS Lambda function name based on its URL (route).


## `utils.pathToUnix(pathString)`

Converts any path to a Unix style path, with `/` as the seperator. This works around Windows issues where `/` is assumed across other parts of Architect.


## `utils.toLogicalID(str)`

Converts `str` into PascalCase for CloudFormation use.


## `utils.updater(name, params)`

`name` (a string) is required; `params` may include the boolean option `quiet` to manually override Architect's global printing status.

Returns a function to be reused for standardized logging updates with the following methods:

- `status` - prints an affirmative status update
  - optional: arbitrary number of supporting info on new lines with each additional param
- `start` - starts an animated progress indicator
  - aliases: `update`
- `done` - ends current progress indicator with an update
  - aliases: `stop`
- `cancel` - cancels current progress indicator without an update
- `err` - pretty prints an error
  - aliases: `error` and `fail`
- `warn` - cancels current progress indicator and prints a warning
  - aliases: `warn`
- `raw` - just logs a message as-is (while respecting quiet)

Automatically respects Architect's global printing status, and also respects the following env vars:

- `ARC_QUIET` - if truthy, disables printing
- `CI` - if truthy, disables certain terminal progress animations



[arc]: https://github.com/architect
[npm]: https://www.npmjs.com/package/@architect/utils

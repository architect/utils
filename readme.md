# `@architect/utils` [![GitHub CI status](https://github.com/architect/utils/workflows/Node%20CI/badge.svg)](https://github.com/architect/utils/actions?query=workflow%3A%22Node+CI%22)
<!-- [![codecov](https://codecov.io/gh/architect/utils/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/utils) -->

[@architect/utils][npm] are common utilities for the [@architect][arc] suite of projects.

## Installation

    npm i @architect/utils

# API

## `utils.banner(params)`

Reads a project's the Architect manifest and prints out: app name, AWS region, AWS profile, version, and current working directory, in addition to loading basic environment variables and necessary AWS credentials.

`params` is an object which can provide the following properties to customize this behaviour:

- `disableRegion`: don't print the AWS region
- `disableProfile`: don't print the AWS profile
- `version`: the version to print out


## `utils.getLambdaName(fn)`

Returns a valid AWS Lambda function name based on its URL (route).


## `utils.getLayers(arc)`

Returns Lambda layers defined in an Architect project manifest. `arc` is an object returned by the [`@architect/parser`][parser], parsed from an Architect project manifest file.


## `utils.getRuntime(arc)`

Returns the Lambda runtime defined in an Architect project manifest. `arc` is an object returned by the [`@architect/parser`][parser], parsed from an Architect project manifest file.


## `utils.getRuntime.allowed(runtime)`

Takes a `runtime` string and returns the same string if it' iss' a runtime allowed in Architect. Otherwise, returns a default runtime which Architect will use (currently `nodejs10.x`).


## `utils.initEnv(callback)`

Populates the runtime environment with variables from a `.arc-env` if present. Details about this functionality can be found in the [@architect/env][env] project (pending resolution of architect/env#2).


## `utils.inventory(arc)`

Returns an object containing:

1. An AWS inventory via the properties: `restapis`, `websocketapis`, `lambdas`,
   `types`, `iamroles`, `snstopics`, `sqstopics`, `s3buckets`, `cwerules` and
   `tables`
2. A list of `localPaths` mapping inventory code (where applicable) to paths on
   the local filesystem

The returned object is based on the provided `arc`, which is an object returned by the [`@architect/parser`][parser], parsed from an Architect project manifest file. (If no `arc` object is passed, it will attempt to parse one itself.)


## `utils.pathToUnix(pathString)`

Converts any path to a Unix style path, with `/` as the seperator. This works around Windows issues where `/` is assumed across other parts of Architect.


## `utils.portInUse(port, callback)`

Tests that the port specified by `port` is available to be used. If an error is raised attempting to listen on the specified port, `callback` will be invoked with an error argument. If it is available, `callback` will be invoked with no arguments.


## `utils.readArc(params={})`

Returns an object containing the following properties:

1. `raw`: the raw string contents of the arc project file
2. `arc`: the parsed (via [@architect/parser][parser]) contents of the Architect project manifest

The project file is attempted to be parsed, in order, from `.arc`, `app.arc`, `arc.yaml`, and `arc.json`.


## `utils.toLogicalID(str)`

Converts `str` into PascalCase.


## `utils.validate(arc, raw, callback)`

Validates a parsed arc file. Parameters to this function are:

- `arc`: an object returned by the [`@architect/parser`][parser], parsed from an Architect project manifest file
- `raw`: the raw Architect project manifest file text
- `callback`: will be invoked with an error as its first argument if validation fails; otherwise will invoke passing null as the first argument and the parsed `arc` object as the second argument


[arc]: https://github.com/architect
[npm]: https://www.npmjs.com/package/@architect/utils
[env]: https://github.com/architect/env
[parser]: https://www.npmjs.com/package/@architect/parser

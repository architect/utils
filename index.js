let banner = require('./banner')
let chalk = require('./chalk')
let series = require('./run-series')
let parallel = require('./run-parallel')
let waterfall = require('./run-waterfall')
let minimist = require('./minimist')
let lambdaRuntimes = require('./lambda-runtimes')
let chars = require('./chars')
let checkCreds = require('./check-creds')
let deepFrozenCopy = require('./deep-frozen-copy')
let fingerprint = require('./fingerprint')
let getLambdaName = require('./get-lambda-name')
let pathToUnix = require('./path-to-unix')
let toLogicalID = require('./to-logical-id')
let updater = require('./updater')
let pathSort = require('./path-sort')
let glob = require('./glob')
let hashid = require('./hashid')

module.exports = {
  banner,         // Prints banner
  chalk,          // Vendored chalk
  series,         // Returns the classic async.series
  parallel,       // Returns the classic async.parallel
  waterfall,      // Returns the classic async.waterfall
  minimist,       // Vendored minimist
  lambdaRuntimes, // Helper for listing all supported Lambda runtimes
  chars,          // Returns platform appropriate characters for CLI UI printing
  checkCreds,     // Performs basic AWS credential check
  deepFrozenCopy, // Fast deep frozen object copy
  fingerprint,    // Generates public/static.json for `@static fingerprint true`
  getLambdaName,  // Get Lambda name from Arc path
  pathToUnix,     // Normalize to `/` seperated paths for Windows-specific calls
  toLogicalID,    // Converts dash casing into Pascal casing for CloudFormation
  updater,        // Standard Arc status updater and progress indicator
  pathSort,       // Sort paths
  glob,           // Glob paths
  hashid,          // Generate unique IDs from numbers
}

let banner = require('./banner')
let chars = require('./chars')
let fingerprint = require('./fingerprint')
let getLambdaName = require('./get-lambda-name')
let getLayers = require('./get-layers')
let getRuntime = require('./get-runtime')
let initEnv = require('./init-env')
let inventory = require('./inventory')
let pathToUnix = require('./path-to-unix')
let portInUse = require('./port-in-use')
let {readArc} = require('@architect/parser')
let toLogicalID = require('./to-logical-id')
let updater = require('./updater')
let validate = require('./validate')

module.exports = {
  banner,         // Prints banner and loads basic env vars and AWS creds
  chars,          // Returns platform appropriate characters for CLI UI printing
  fingerprint,    // Generates public/static.json for `@static fingerprint true`
  getLambdaName,  // Get Lambda name from Arc path
  getLayers,      // Get layer config from Arc file or config
  getRuntime,     // Get runtime config from Arc file or config
  initEnv,        // Initialize env vars from .arc-env config
  inventory,      // Get inventory of current AWS resources from Arc file
  pathToUnix,     // Normalize to `/` seperated paths for Windows-specific calls
  portInUse,      // Checks to see if a port is in use
  readArc,        // Reads Arc file and returns raw + parsed versions
  toLogicalID,    // Converts dash casing into Pascal casing for CloudFormation
  updater,        // Standard Arc status updater and progress indicator
  validate,       // Validates an Arc file
}

let banner = require('./banner')
let chars = require('./chars')
let fingerprint = require('./fingerprint')
let getLambdaName = require('./get-lambda-name')
let pathToUnix = require('./path-to-unix')
let toLogicalID = require('./to-logical-id')
let updater = require('./updater')

module.exports = {
  banner,         // Prints banner and loads basic env vars and AWS creds
  chars,          // Returns platform appropriate characters for CLI UI printing
  fingerprint,    // Generates public/static.json for `@static fingerprint true`
  getLambdaName,  // Get Lambda name from Arc path
  pathToUnix,     // Normalize to `/` seperated paths for Windows-specific calls
  toLogicalID,    // Converts dash casing into Pascal casing for CloudFormation
  updater,        // Standard Arc status updater and progress indicator
}

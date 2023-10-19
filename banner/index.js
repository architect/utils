let chalk = require('chalk')
let chars = require('../chars')
let credCheck = require('./cred-check')

module.exports = function printBanner (params = {}) {
  let {
    cwd = process.cwd(),
    checkCreds,
    inventory,
    disableBanner,
    disableRegion,
    disableProfile,
    needsValidCreds,
    version = '–',
  } = params
  let quiet = process.env.ARC_QUIET || process.env.QUIET || params.quiet

  if (disableBanner) return
  else {
    // Boilerplate
    let log = (label, value) => {
      if (!quiet) {
        console.log(chalk.grey(`${label.padStart(12)} ${chars.buzz}`), chalk.cyan(value))
      }
    }

    // Initialize config
    process.env.ARC_APP_NAME = inventory.inv.app

    // Check creds
    let credError = credCheck({ checkCreds, inventory, needsValidCreds })

    // App name
    let name = process.env.ARC_APP_NAME || 'Architect project manifest not found'
    log('App', name)

    // Region
    let region = inventory.inv?.aws?.region || process.env.AWS_REGION || 'Region not configured'
    if (!disableRegion) {
      log('Region', region)
    }

    // Profile
    let profile = process.env.AWS_ACCESS_KEY_ID &&
                  process.env.ARC_AWS_CREDS !== 'dummy'
      ? 'Set via environment'
      : inventory.inv?.aws?.profile || process.env.AWS_PROFILE || 'Profile not configured'
    if (!disableProfile) {
      log('Profile', profile)
    }

    // Caller version
    // Also: set deprecation status for legacy Arc installs
    log('Version', version)

    // cwd
    log('cwd', cwd)

    // Blow up (if necessary) after printing basic diagnostic stuff
    if (credError) throw credError

    // Space
    if (!quiet) console.log()
  }
}

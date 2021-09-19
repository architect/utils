let chalk = require('chalk')
let chars = require('../chars')
let initAWS = require('./init-aws')

module.exports = function printBanner (params = {}) {
  let {
    cwd = process.cwd(),
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
    initAWS({ inventory, needsValidCreds })

    // App name
    let name = process.env.ARC_APP_NAME || 'Architect project manifest not found'
    log('App', name)

    // Region
    let region = process.env.AWS_REGION || '@aws region / AWS_REGION not configured'
    if (!disableRegion) {
      log('Region', region)
    }

    // Profile
    let profile = process.env.ARC_AWS_CREDS === 'env'
      ? 'Set via environment'
      : process.env.AWS_PROFILE || '@aws profile / AWS_PROFILE not configured'
    if (!disableProfile) {
      log('Profile', profile)
    }

    // Caller version
    // Also: set deprecation status for legacy Arc installs
    log('Version', version)

    // cwd
    log('cwd', cwd)

    // Space
    if (!quiet) {
      console.log()
    }
  }
}

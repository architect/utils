let chalk = require('chalk')
let chars = require('../chars')

module.exports = function printBanner (params = {}) {
  let {
    cwd = process.cwd(),
    inventory,
    disableBanner,
    version = '–',
  } = params
  let quiet = process.env.ARC_QUIET || process.env.QUIET || params.quiet

  if (disableBanner) return

  // Boilerplate
  let log = (label, value) => {
    if (!quiet) {
      console.log(chalk.grey(`${label.padStart(12)} ${chars.buzz}`), chalk.cyan(value))
    }
  }

  // App name
  let name = inventory.inv.app || 'Architect project manifest not found'
  log('App', name)

  // Region
  let region =  inventory.inv?.aws?.region ||
                process.env.AWS_REGION ||
                'Region not configured'
  log('Region', region)

  // Profile
  let credsViaEnv = process.env.AWS_ACCESS_KEY_ID ? 'Set via environment' : undefined
  let profile = credsViaEnv ||
                inventory.inv?.aws?.profile ||
                process.env.AWS_PROFILE ||
                'Not configured / default'
  log('Profile', profile)

  // Caller version
  // Also: set deprecation status for legacy Arc installs
  log('Version', version)

  // cwd
  log('cwd', cwd)

  // Space
  if (!quiet) console.log()
}

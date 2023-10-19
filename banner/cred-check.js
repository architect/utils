let { join } = require('path')

/**
 * Credential check and possible backstop
 * - aws-lite requires credentials to initialize
 * - Architect needs credentials for some things (e.g. Deploy), but also has a variety of offline workflows that interface with AWS service API emulators (e.g. Sandbox)
 * - Thus, sometimes it's ok to use dummy creds, sometimes we need to halt
 */
module.exports = function credCheck ({ checkCreds = true, inventory, needsValidCreds = false }) {
  if (!checkCreds) return

  // eslint-disable-next-line
  let { execFileSync } = require('child_process')
  let script = join(__dirname, '_get-creds.js')
  function check () {
    try {
      let env = { ...process.env }
      if (inventory.inv?.aws?.profile) {
        env._ARC_PROFILE = inventory.inv?.aws?.profile
      }
      let result = execFileSync('node', [ script ], { env })
      return JSON.parse(result)
    }
    catch (err) {
      console.error('Unknown credential check error')
      throw err
    }
  }

  let creds = check()
  if (creds.error && needsValidCreds) {
    return Error('Valid credentials needed to run this command; missing or invalid credentials')
  }
  else if (creds.error) {
    /**
     * Backfill creds - any creds will do for local service emulation
     * - Be sure we backfill Lambda's prepopulated env vars
     * - sessionToken / AWS_SESSION_TOKEN is optional, skip so as not to introduce unintended side-effects
     */
    process.env.ARC_AWS_CREDS = 'dummy'
    process.env.AWS_ACCESS_KEY_ID = 'arc_dummy_access_key'
    process.env.AWS_SECRET_ACCESS_KEY = 'arc_dummy_secret_key'
  }
}

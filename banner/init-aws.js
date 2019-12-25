let exists = require('fs').existsSync
let homeDir = require('os').homedir()
let {join} = require('path')
let updater = require('../updater')

/**
 * Initialize AWS configuration, in order of preference:
 * - @aws pragma + ~/.aws/credentials file
 * - Environment variables
 * - Dummy creds (if absolutely necessary)
 */
module.exports = function initAWS ({arc, needsValidCreds=true}) {
  // AWS SDK intentionally not added to package deps; assume caller already has it
  // eslint-disable-next-line
  let aws = require('aws-sdk')

  try {
    let hasCredsFile = exists(join(homeDir, '.aws', 'credentials'))
    arc.aws = arc.aws || []
    let region = arc.aws.find(e=> e[0] === 'region')
    process.env.AWS_REGION = region && region[1] ||
                             process.env.AWS_REGION

    // Always ensure we end with cred a final credential check
    if (hasCredsFile) {
      let profile = arc.aws.find(e=> e[0] === 'profile')
      process.env.ARC_AWS_CREDS = 'profile'
      process.env.AWS_PROFILE = profile && profile[1] ||
                                process.env.AWS_PROFILE ||
                                'default'
      aws.config.credentials = new aws.SharedIniFileCredentials({
        profile: process.env.AWS_PROFILE
      })
      credentialCheck()
    }
    else {
      let hasEnvVars = process.env.AWS_ACCESS_KEY_ID &&
                       process.env.AWS_SECRET_ACCESS_KEY
      if (hasEnvVars) {
        process.env.ARC_AWS_CREDS = 'env'
        aws.config.credentials = new aws.Credentials({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
      }
      credentialCheck()
    }

    function credentialCheck() {
      let creds = aws.config.credentials
      let noCreds = !creds || creds && !creds.accessKeyId
      if (noCreds && needsValidCreds) {
        // Set missing creds flag and let consuming modules handle as necessary
        process.env.ARC_AWS_CREDS = 'missing'
      }
      else if (noCreds && !needsValidCreds) {
        process.env.ARC_AWS_CREDS = 'dummy'
        aws.config.credentials = aws.Credentials({
          accessKeyId: 'xxx',
          secretAccessKey: 'xxx'
        })
      }
      // Always unset profile to prevent misleading claims about loaded creds
      if (noCreds) {
        delete process.env.AWS_PROFILE
      }
    }
  }
  catch(e) {
    // Don't exit process here; caller should be responsible
    let update = updater('Startup')
    update.err(e)
  }
}

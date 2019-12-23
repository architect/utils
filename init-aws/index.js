let exists = require('fs').existsSync
let homeDir = require('os').homedir()
let {join} = require('path')
let readArc = require('../read-arc')
let updater = require('../updater')

/**
 * Initialize AWS configuration, in order of preference:
 * - @aws pragma + ~/.aws/credentials file
 * - Environment variables
 * - Dummy creds (if absolutely necessary)
 */
module.exports = function initAWS () {
  // AWS SDK intentionally not added to package.json deps; assume caller already has it
  // eslint-disable-next-line
  let aws = require('aws-sdk')
  let update = updater('Startup')
  try {
    let hasCredsFile = exists(join(homeDir, '.aws', 'credentials'))
    let {arc} = readArc()
    arc.aws = arc.aws || []
    let region = arc.aws.find(e=> e[0] === 'region')
    process.env.AWS_REGION = region && region[1] ||
                             process.env.AWS_REGION ||
                             'us-west-2'

    // Always ensure we end with cred validation
    if (hasCredsFile) {
      let profile = arc.aws.find(e=> e[0] === 'profile')
      process.env.AWS_PROFILE = profile && profile[1] ||
                                process.env.AWS_PROFILE
      aws.config.credentials = new aws.SharedIniFileCredentials({
        profile: process.env.AWS_PROFILE
      })
      validateCreds()
    }
    else {
      let hasEnvVars = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      if (hasEnvVars) {
        process.env.ARC_AWS_CREDS = 'env'
        aws.config.credentials = aws.Credentials({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
      }
      validateCreds()
    }

    function validateCreds() {
      let creds = aws.config.credentials
      if (!creds || creds && !creds.accessKeyId) {
        // Backfill creds with dummy if anything is amiss
        update.warn('Missing or invalid AWS credentials or credentials file, using dummy credentials')
        aws.config.credentials = aws.Credentials({
          accessKeyId: 'xxx',
          secretAccessKey: 'xxx'
        })
      }
    }
  }
  catch(e) {
    if (e.message != 'not_found') {
      // Don't exit process here even if .arc isn't found; caller should be responsible (via ./read-arc)
      update.err(e)
    }
  }
}

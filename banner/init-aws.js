let { existsSync: exists } = require('fs')
let homeDir = require('os').homedir()
let { join } = require('path')
let updater = require('../updater')

/**
 * Initialize AWS configuration, in order of preference:
 * - @aws pragma + ~/.aws/credentials file
 * - Environment variables
 * - Dummy creds (if absolutely necessary)
 */
module.exports = function initAWS ({ inventory, needsValidCreds = true }) {
  // AWS SDK intentionally not added to package deps; assume caller already has it
  // eslint-disable-next-line
  let aws = require('aws-sdk')
  let credentialsMethod = 'SharedIniFileCredentials'
  let { inv } = inventory
  try {
    let defaultCredsPath = join(homeDir, '.aws', 'credentials')
    let envCredsPath = process.env.AWS_SHARED_CREDENTIALS_FILE
    let credsPath = envCredsPath || defaultCredsPath
    let credsExists = exists(envCredsPath) || exists(defaultCredsPath)
    // Inventory always sets a dfeault region if not specified
    process.env.AWS_REGION = inv.aws.region
    /**
     * Always ensure we end with a final sanity check on loaded credentials
     */
    // Allow local cred file to be overriden by env vars
    let envOverride = process.env.ARC_AWS_CREDS === 'env'
    if (credsExists && !envOverride) {
      let profile = process.env.AWS_PROFILE
      aws.config.credentials = []
      if (inv.aws && inv.aws.profile) {
        process.env.AWS_PROFILE = profile = inv.aws.profile
      }

      let init = new aws.IniLoader()
      let opts = {
        filename: credsPath
      }

      let profileData =  init.loadFrom(opts)
      if (!profile) profile = process.env.AWS_PROFILE = 'default'
      process.env.ARC_AWS_CREDS = 'missing'

      if (profileData[profile]) {
        process.env.ARC_AWS_CREDS = 'profile'

        if (profileData[profile].credential_process) credentialsMethod = 'ProcessCredentials'
        aws.config.credentials = new aws[credentialsMethod]({
          ...opts,
          profile: process.env.AWS_PROFILE
        })
      }
      else {
        delete process.env.AWS_PROFILE
      }
    }
    else {
      let hasEnvVars = process.env.AWS_ACCESS_KEY_ID &&
                       process.env.AWS_SECRET_ACCESS_KEY
      if (hasEnvVars) {
        process.env.ARC_AWS_CREDS = 'env'
        let params = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
        if (process.env.AWS_SESSION_TOKEN) {
          params.sessionToken = process.env.AWS_SESSION_TOKEN
        }
        aws.config.credentials = new aws.Credentials(params)
      }
    }
    credentialCheck()
    /**
     * Final credential check to ensure we meet the cred needs of Arc various packages
     * - Packages that **need** valid creds should be made aware that none are available (ARC_AWS_CREDS = 'missing')
     * - Others that **do not need** valid creds should work fine when supplied with dummy creds (or none at all, but we'll backfill dummy creds jic)
     */
    function credentialCheck () {
      let creds = aws.config.credentials
      let invalidCreds = Array.isArray(creds) && !creds.length
      let noCreds = !creds || invalidCreds || process.env.ARC_AWS_CREDS == 'missing'
      if (noCreds && needsValidCreds) {
        // Set missing creds flag and let consuming modules handle as necessary
        process.env.ARC_AWS_CREDS = 'missing'
      }
      else if (noCreds && !needsValidCreds) {
        /**
         * Any creds will do! (e.g. Sandbox DynamoDB)
         * - Be sure we backfill Lambda's prepopulated env vars
         * - sessionToken / AWS_SESSION_TOKEN is optional, skip so as not to introduce unintended side-effects
         */
        process.env.ARC_AWS_CREDS = 'dummy'
        process.env.AWS_ACCESS_KEY_ID = 'xxx'
        process.env.AWS_SECRET_ACCESS_KEY = 'xxx'
        aws.config.credentials = new aws.Credentials({
          accessKeyId: 'xxx',
          secretAccessKey: 'xxx'
        })
      }
      // If no creds, always unset profile to prevent misleading claims about profile state
      if (noCreds) {
        delete process.env.AWS_PROFILE
      }
    }
  }
  catch (e) {
    // Don't exit process here; caller should be responsible
    let update = updater('Startup')
    update.err(e)
  }
}

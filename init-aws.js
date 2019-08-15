let chars = require('./chars')
let readArcFile = require('./read-arc')

/**
 * Look for @aws pragma and try to initialize AWS configuration
 */
module.exports = function initAWS () {
  // AWS SDK intentionally not added to package.json deps; assumes callers already have it
  // eslint-disable-next-line
  let aws = require('aws-sdk')

  let arc
  try {
    let parsed = readArcFile()
    arc = parsed.arc

    // Attempt to populate AWS_REGION + AWS_PROFILE and load creds
    if (arc && arc.aws) {
      let region = arc.aws.find(e=> e[0] === 'region')
      let profile = arc.aws.find(e=> e[0] === 'profile')

      if (region) {
        process.env.AWS_REGION = region[1]
      }

      if (profile) {
        process.env.AWS_PROFILE = profile[1]
      }

      if (process.env.AWS_PROFILE) {
        aws.config.credentials = new aws.SharedIniFileCredentials({
          profile: process.env.AWS_PROFILE
        })
      }
      else {
        // jic fallback to default creds (if specified)
        aws.config.credentials = new aws.SharedIniFileCredentials()
      }
      if (!aws.config.credentials.accessKeyId) {
        console.log(chars.err, 'Warning: missing or invalid AWS credentials file')
      }
    }
  }
  catch(e) {
    if (e.message != 'not_found') {
      // Don't exit process here even if .arc isn't found; caller should be responsible (via ./read-arc)
      console.log(e)
    }
  }
}

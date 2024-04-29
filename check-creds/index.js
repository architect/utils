/**
 * Credential check
 * - aws-lite requires credentials to initialize
 * - Architect needs credentials for some things (e.g. Deploy), but also has a variety of offline workflows that interface with AWS service API emulators (e.g. Sandbox)
 * - Thus, sometimes it's ok to use dummy creds, but sometimes we need to halt (via this util)
 */
module.exports = function checkAwsCredentials (params, callback) {
  let awsLite = require('@aws-lite/client')
  let { inventory } = params

  let promise
  if (!callback) {
    promise = new Promise((res, rej) => {
      callback = (err, result) => err ? rej(err) : res(result)
    })
  }

  let errMsg = 'Valid AWS credentials needed to continue; missing or invalid credentials'
  awsLite({
    // aws-lite falls back to AWS_PROFILE or 'default' if undefined
    profile: inventory.inv?.aws?.profile,
    region: 'us-west-1',
  })
    .then(() => callback())
    .catch(() => callback(Error(errMsg)))

  return promise
}

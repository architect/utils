let readArcFile = require('./read-arc')

/**
 * Look for @aws pragma and try to populate AWS configuration
 */
module.exports = function populateAWS () {
  let arc
  try {
    let parsed = readArcFile()
    arc = parsed.arc
  }
  catch(e) {
    if (e.message != 'not_found') {
      // Don't exit process here even if .arc isn't found; caller should be responsible (via ./read-arc)
      console.log(e)
    }
  }

  // Attempt to load and populate AWS_REGION + AWS_PROFILE
  if (arc.aws && arc.aws.findIndex(e => e[0] === 'region') !== -1) {
    process.env.AWS_REGION = arc.aws[arc.aws.findIndex(e => e[0] === 'region')][1]
  }
  if (arc.aws && arc.aws.findIndex(e => e[0] === 'profile') !== -1) {
    process.env.AWS_PROFILE = arc.aws[arc.aws.findIndex(e => e[0] === 'profile')][1]
  }
}

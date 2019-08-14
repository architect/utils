let readArcFile = require('./read-arc')

/**
 * Try to initialize basic Architect project configuration
 */
module.exports = function initAWS () {
  let arc
  try {
    let parsed = readArcFile()
    arc = parsed.arc
    process.env.ARC_APP_NAME = arc.app[0]
  }
  catch(e) {
    if (e.message != 'not_found') {
      // Don't exit process here even if .arc isn't found; caller should be responsible (via ./read-arc)
      console.log(e)
    }
  }
}

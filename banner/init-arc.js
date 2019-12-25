let readArcFile = require('../read-arc')
let updater = require('../updater')

/**
 * Initialize basic Architect project configuration
 */
module.exports = function initArc () {
  try {
    let {arc} = readArcFile()
    process.env.ARC_APP_NAME = arc.app[0]
    return arc
  }
  catch(e) {
    if (e.message != 'not_found') {
      // Don't exit process here even if .arc isn't found; caller should be responsible (via ./read-arc)
      let update = updater('Startup')
      update.err(e)
    }
  }
}

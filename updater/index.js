let { getEventListeners } = require('events')
let chalk = require('chalk')
let { printer } = require('./lib')
let methods = require('./methods')

/**
 * Updater
 * - `status` - prints an affirmative status update - `chars.start`
 *   - optional: supporting info on new lines with each additional param
 * - `start`  - start progress indicator - `spinner`||`chars.start`
 *   - aliases: `update`
 * - `done`   - end progress indicator with an update - `chars.done`
 *   - aliases: `stop`
 * - `cancel` - cancel progress indicator without update - !char
 * - `err`    - pretty print an error - `chars.err`
 *   - aliases: `error` and `fail`
 * - `warn`   - cancel progress indicator and print a warning
 *   - aliases: `warn`
 * - `raw`    - just logs a message as-is (respecting quiet)
 *
 * Each method should also return a value to enable capture of progress data
 */
module.exports = function statusUpdater (name, args = {}) {
  let env = process.env
  name = name ? chalk.grey(name) : 'Info'
  let logLevel = args.logLevel || 'normal'
  let quiet = env.ARC_QUIET || env.QUIET || args.quiet || false
  let isCI = env.CI || process.stdout.isTTY === false
  if (!quiet && !isCI) {
    printer.hideCursor() // Disable cursor while updating
    printer.restoreCursor() // Restore cursor on exit
  }
  let running = false

  let params = {
    isCI,
    logLevel,
    name,
    printer,
    quiet,
    running,
  }

  let updaters = {}
  let logLevels = [ 'normal', 'verbose', 'debug' ]
  if (!logLevels.includes(logLevel)) throw ReferenceError(`Invalid logLevel parameter, must be one of: ${logLevels.join(', ')}`)

  logLevels.forEach(logMode => {
    updaters[logMode] = {}
    let args = { logMode, logLevels }
    updaters[logMode].start =   methods.start.bind({}, args, params)
    updaters[logMode].status =  methods.status.bind({}, args, params)
    updaters[logMode].done =    methods.done.bind({}, args, params)
    updaters[logMode].cancel =  methods.cancel.bind({}, args, params)
    updaters[logMode].err =     methods.err.bind({}, args, params)
    updaters[logMode].warn =    methods.warn.bind({}, args, params)
    updaters[logMode].raw =     methods.raw.bind({}, args, params)
    // Aliases
    updaters[logMode].update =  updaters[logMode].start
    updaters[logMode].stop =    updaters[logMode].done
    updaters[logMode].error =   updaters[logMode].err
    updaters[logMode].fail =    updaters[logMode].err
    updaters[logMode].warning = updaters[logMode].warn
  })
  return {
    ...updaters.normal,
    get: methods.get.bind({}, {}, params),
    reset: methods.reset,
    clear: methods.reset,
    verbose: updaters.verbose,
    debug: updaters.debug,
  }
}

// For whatever reason signal-exit doesn't catch SIGINT, so do this...
// Also, if the resolved dep tree isn't totally flat on the filesystem, multiple installations of utils can attempt to attach SIGINT listeners, so we have to guard against that
function restoreCursor () {
  let listeners = getEventListeners(process, 'SIGINT')
  let needsRestore =  !listeners?.length ||
                      !listeners.some(fn => fn.name === '_arcRestoreCursor')
  if (needsRestore) {
    process.on('SIGINT', function _arcRestoreCursor () {
      printer.restoreCursor()
      console.log('')
      process.exit()
    })
  }
}
restoreCursor()

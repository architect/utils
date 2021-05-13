let chalk = require('chalk')
let { printer } = require('./lib')
let methods = require('./methods')
let data = ''

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
  let quiet = () => env.ARC_QUIET || env.QUIET || args.logLevel === 'quiet' || args.quiet || false
  let isCI = env.CI || process.stdout.isTTY === false
  if (!quiet() && !isCI) {
    printer.hideCursor() // Disable cursor while updating
    printer.restoreCursor() // Restore cursor on exit
  }
  let running = false

  let params = {
    data,
    isCI,
    logLevel,
    name,
    printer,
    quiet,
    running,
  }

  let updater = {}
  let logLevels = [ 'quiet', 'normal', 'verbose', 'debug' ]
  if (!logLevels.includes(logLevel)) throw ReferenceError(`Invalid logLevel parameter, must be one of: ${logLevels.join(', ')}`)

  logLevels.forEach(logMode => {
    updater[logLevel] = {}
    let args = { logMode, logLevels, ...params }
    updater[logLevel].start =   methods.start.bind({}, args)
    updater[logLevel].status =  methods.status.bind({}, args)
    updater[logLevel].done =    methods.done.bind({}, args)
    updater[logLevel].cancel =  methods.cancel.bind({}, args)
    updater[logLevel].err =     methods.err.bind({}, args)
    updater[logLevel].warn =    methods.warn.bind({}, args)
    updater[logLevel].raw =     methods.raw.bind({}, args)
    // Aliases
    updater[logLevel].update =  updater[logLevel].start
    updater[logLevel].stop =    updater[logLevel].done
    updater[logLevel].error =   updater[logLevel].err
    updater[logLevel].fail =    updater[logLevel].err
    updater[logLevel].warning = updater[logLevel].warn

  })
  return { ...updater.normal, ...updater }
}

// For whatever reason signal-exit doesn't catch SIGINT, so do this
process.on('SIGINT', () => {
  printer.restoreCursor()
  console.log('')
  process.exit()
})

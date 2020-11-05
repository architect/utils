let chalk = require('chalk')
let chars = require('../chars')
let { printer, spinner } = require('./lib')

/**
 * Updater
 * - `status` - prints an affirmative status update - `chars.start`
 *   - optional: supporting info on new lines with additional params
 *   - aliases: `update`
 * - `start`  - start progress indicator - `spinner`||`chars.start`
 * - `done`   - end progress indicator with an update - `chars.done`
 *   - aliases: `stop`
 * - `cancel` - cancel progress indicator without update - !char
 * - `err`   - pretty print an error - `chars.err`
 *   - aliases: `error` and `fail`
 *
 * Each method should also return a value to enable capture of progress data
 */
module.exports = function updater (name, params = {}) {
  params.quiet = params.quiet || false
  let quiet = () => process.env.ARC_QUIET || process.env.QUIET || params.quiet
  name = name ? chalk.grey(name) : 'Info'
  let isCI = process.env.CI || process.stdout.isTTY === false
  if (!quiet() && !isCI) {
    printer.hideCursor() // Disable cursor while updating
    printer.restoreCursor() // Restore cursor on exit
  }
  let running = false
  let { frames, timing } = spinner

  function progressIndicator (info) {
    // End-user progress mode
    if (!running && !isCI && !quiet()) {
      let i = 0
      running = setInterval(function () {
        printer.write(`${chalk.cyan(frames[i = ++i % frames.length])} ${info}`)
        printer.reset()
      }, timing)
    }
    // CI mode: updates console with status messages but not animations
    else if (!running && isCI && !quiet()) {
      console.log(`${chars.start} ${info}`)
    }
  }

  // Optionally pass a message and/or post a multi-line supporting status update
  function status (msg, ...more) {
    msg = msg ? chalk.cyan(msg) : ''
    let info = msg ? `${chars.start} ${name} ${msg}`.trim() : ''
    if (running) cancel()
    if (!quiet() && info) console.log(info) // Check for msg so as not to print an empty line
    if (more.length) {
      more.forEach(i => {
        let add = chalk.dim(`  | ${i}`)
        if (!quiet()) console.log(add)
        info += `\n${add}`
      })
    }

    return info
  }

  function start (msg) {
    msg = msg ? chalk.cyan(msg) : ''
    let info = `${name} ${msg}`.trim()
    if (running) cancel()
    progressIndicator(info)
    return `${chars.start} ${info}`
  }

  function done (newName, msg) {
    if (!msg) {
      msg = newName
      newName = ''
    }
    if (newName) newName = chalk.grey(newName)
    if (msg) msg = chalk.cyan(msg)
    cancel() // Maybe clear running status and reset
    let info = `${chars.done} ${newName ? newName : name} ${msg ? msg : ''}`.trim()

    if (!quiet()) console.log(info)
    return info
  }

  function cancel () {
    if (running) {
      clearInterval(running)
      printer.reset()
      printer.clear()
      running = false // Prevent accidental second done print
    }
  }

  function err (error) {
    if (running) cancel()
    let isErr = error instanceof Error
    let name = isErr ? error.name : 'Error'
    let msg = isErr ? error.message : error
    let info = `${chars.err} ${chalk.red(name + ':')} ${msg}`.trim()
    if (isErr) {
      info += '\n' + error.stack.split('\n').slice(1).join('\n')
    }
    console.log(info)
    return info
  }

  function warn (warning) {
    if (running) cancel()
    if (warning instanceof Error) warning = warning.message
    let info = `${chars.warn} ${chalk.yellow('Warning:')} ${warning}`.trim()

    if (!quiet()) console.log(info)
    return info
  }

  return {
    start,
    update: start,
    status,
    done,
    stop: done,
    cancel,
    err,
    error: err,
    fail: err,
    warn,
    warning: warn
  }
}

// For whatever reason signal-exit doesn't catch SIGINT, so do this
process.on('SIGINT', () => {
  printer.restoreCursor()
  console.log('')
  process.exit()
})

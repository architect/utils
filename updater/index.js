let chalk = require('chalk')
let chars = require('../chars')
let {printer, spinner} = require('./lib')

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
module.exports = function updater(name) {
  printer.restoreCursor() // Restore cursor on exit
  printer.hideCursor() // Disable cursor while updating
  name = name ? chalk.grey(name) : 'Info'
  let isCI = process.env.CI || !process.stdout.isTTY
  let running = false
  let {frames, timing} = spinner

  function progressIndicator(info) {
    // End-user progress mode
    if (!running && !isCI) {
      let i = 0
      running = setInterval(function() {
        printer.write(`${chalk.cyan(frames[i = ++i % frames.length])} ${info}`)
        printer.reset()
      }, timing)
    }
    // CI mode: updates console with status messages but not animations
    else if (!running && isCI && info.length > 0) {
      console.log(`${chars.start} ${info}`)
    }
  }

  function status(msg, ...more) {
    msg = msg ? chalk.cyan(msg) : ''
    let info = `${chars.start} ${name} ${msg}`.trim()
    console.log(info)
    if (more) {
      more.forEach(i => {
        let add = chalk.dim(`  | ${i}`)
        console.log(add)
        info += `\n${add}`
      })
    }
    return info
  }

  function start(msg) {
    msg = msg ? chalk.cyan(msg) : ''
    let info = `${name} ${msg}`.trim()
    progressIndicator(info)
    return `${chars.start} ${info}`
  }

  function done(newName, msg) {
    if (!msg) {
      msg = newName
      newName = ''
    }
    if (newName) newName = chalk.grey(newName)
    if (msg) msg = chalk.cyan(msg)
    cancel() // Maybe clear running status and reset
    let info = `${chars.done} ${newName ? newName : name} ${msg ? msg : ''}`.trim()
    console.log(info)
    return info
  }

  function cancel() {
    if (running) {
      clearInterval(running)
      printer.reset()
      printer.clear()
      running = false // Prevent accidental second done print
    }
  }

  function err(error) {
    if (running) cancel()
    if (error instanceof Error) error = error.message
    let info = `${chars.err} ${chalk.red('Error:')} ${error}`.trim()
    console.log(info)
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
    fail: err
  }
}
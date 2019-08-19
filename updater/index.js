let chalk = require('chalk')
let chars = require('../chars')
let restore = require('restore-cursor')
let {
  clear,
  reset,
  write,
  hideCursor,
  spinner
} = require('./lib')

/**
 * Updater
 * - `status` - prints an affirmative status update - `chars.done`
 *   - optional: supporting info on new lines with additional params
 * - `start`  - start progress indicator - `spinner`||`chars.start`
 * - `done`   - end progress indicator with an update - `chars.done`
 * - `cancel` - cancel progress indicator without update - !char
 * - `err`   - pretty print an error - `chars.err`
 *   - aliases to `error` and `fail`
 */
module.exports = function updater(name) {
  restore() // Restores cursor on unexpected exit
  let running = false
  let n = chalk.grey(name) || ''
  let m = ''
  let {frames, timing} = spinner


  function progressIndicator() {
    let i = 0
    write(hideCursor)
    // End-user progress mode
    if (!running && !process.env.CI) {
      running = setInterval(function() {
        write(`${chalk.cyan(frames[i = ++i % frames.length])} ${n} ${m}`)
        reset()
      }, timing)
    }
    // CI mode: updates console with status messages but not animations
    else if (!running && process.env.CI && m.length > 0) {
      console.log(`${chars.start} ${n} ${m}`)
    }
  }

  function status(msg, ...info) {
    msg = msg || ''
    m = chalk.cyan(msg)
    console.log(`${chars.start} ${n} ${m}`)
    if (info)
      info.forEach(i => console.log(chalk.dim(`  | ${i}`)))
  }

  function start(msg) {
    msg = msg || ''
    m = chalk.cyan(msg)
    progressIndicator()
  }

  function done(newName, msg) {
    if (!msg) {
      msg = newName
      newName = ''
    }
    if (newName) newName = chalk.grey(newName)
    if (msg) m = chalk.cyan(msg)
    if (running) {
      clearInterval(running)
      reset()
      clear()
      running = false // Prevent accidental second done print
    }
    console.log(`${chars.done} ${newName ? newName : n} ${m}`)
  }

  function cancel() {
    clearInterval(running)
    running = false
    write('\u001B[?25h')
  }

  function err(error) {
    if (running) cancel()
    if (error instanceof Error) error = error.message
    console.log(`${chars.err} ${chalk.red('Error:')} ${error}`)
  }

  return {
    start,
    status,
    done,
    cancel,
    err,
    error: err,
    fail: err
  }
}

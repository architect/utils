let chalk = require('chalk')
let chars = require('../chars')
let { printer, spinner } = require('./lib')
let { frames, timing } = spinner
let data = []

function log (args, params, output, options = {}) {
  let { logMode, logLevels } = args
  let { logLevel, quiet } = params
  let { force, animate } = options

  // Append output to running log
  function append () {
    if (output) data.push(output)
  }

  let sameLogLevel = logLevel === logMode
  let greaterLogLevel = logLevels.indexOf(logLevel) > logLevels.indexOf(logMode)
  let print = output && (sameLogLevel || greaterLogLevel || force)
  if (print) {
    if (quiet && !force) { /* noop to suppress logging */ }
    else if (animate) {
      let i = 0
      params.running = setInterval(function () {
        let out = output.replace(chars.start + ' ', '') // Don't strip via substr, which might truncate escape sequences
        printer.write(`${chalk.cyan(frames[i = ++i % frames.length])} ${out}`)
        printer.reset()
      }, timing)
    }
    else {
      console.log(output)
    }
    append()
  }
}

// Optionally pass a message and/or post a multi-line supporting status update
function status (args, params, msg, ...more) {
  maybeCancel(args, params)
  let { name } = params
  msg = msg ? chalk.cyan(msg) : ''
  let info = msg ? `${chars.start} ${name} ${msg}`.trim() : ''
  log(args, params, info)
  if (more.length) {
    more.forEach(i => {
      let add = chalk.dim(`  | ${i}`)
      log(args, params, add)
      info += `\n${add}`
    })
  }
  return info
}

function start (args, params, msg) {
  maybeCancel(args, params)
  let { name, isCI } = params
  msg = msg ? chalk.cyan(msg) : ''
  let info = `${chars.start} ${name} ${msg}`.trim()
  log(args, params, info, { animate: !isCI })
  return info
}

function done (args, params, newName, msg) {
  let { name } = params
  maybeCancel(args, params) // Maybe clear running status and reset
  if (!msg) {
    msg = newName
    newName = ''
  }
  if (newName) newName = chalk.grey(newName)
  if (msg) msg = chalk.cyan(msg)
  let info = `${chars.done} ${newName ? newName : name} ${msg ? msg : ''}`.trim()
  log(args, params, info)
  return info
}

function cancel (args, { running }) {
  if (running) {
    clearInterval(running)
    printer.reset()
    printer.clear()
    running = false // Prevent accidental second `done` print
  }
}
let maybeCancel = cancel

function err (args, params, error) {
  maybeCancel(args, params)
  let isErr = error instanceof Error
  let name = isErr ? error.name : 'Error'
  let msg = isErr ? error.message : error
  let info = `${chars.err} ${chalk.red(name + ':')} ${msg}`.trim()
  if (isErr) {
    info += '\n' + error.stack.replace(msg, '')
  }
  // Always print errors
  log(args, params, info, { force: true })
  return info
}

function warn (args, params, warning) {
  maybeCancel(args, params)
  if (warning instanceof Error) warning = warning.message
  let info = `${chars.warn} ${chalk.yellow('Warning:')} ${warning}`.trim()
  log(args, params, info)
  return info
}

function raw (args, params, msg) {
  log(args, params, msg)
  return msg
}

function get () {
  return data.length ? data.join('\n') : ''
}

function reset () {
  data = []
}

module.exports = {
  start,
  status,
  done,
  cancel,
  err,
  warn,
  raw,
  get,
  reset,
}

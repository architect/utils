let chalk = require('chalk')
let chars = require('../chars')
let { printer, spinner } = require('./lib')
let { frames, timing } = spinner

function log (params, output) {
  let quiet = params.quiet()
  // Check for msg so as not to print an empty line
  let print = (!quiet && output) || params.force
  if (print) console.log(output)
}

// Optionally pass a message and/or post a multi-line supporting status update
function status (params, msg, ...more) {
  maybeCancel(params)
  let { name } = params
  msg = msg ? chalk.cyan(msg) : ''
  let info = msg ? `${chars.start} ${name} ${msg}`.trim() : ''
  log(params, info)
  if (more.length) {
    more.forEach(i => {
      let add = chalk.dim(`  | ${i}`)
      log(params, add)
      info += `\n${add}`
    })
  }
  return info
}

function start (params, msg) {
  maybeCancel(params)
  let { name, isCI, quiet } = params
  msg = msg ? chalk.cyan(msg) : ''
  let info = `${name} ${msg}`.trim()

  // End-user progress mode
  if (!params.running && !isCI && !quiet()) {
    let i = 0
    params.running = setInterval(function () {
      printer.write(`${chalk.cyan(frames[i = ++i % frames.length])} ${info}`)
      printer.reset()
    }, timing)
  }
  // CI mode: updates console with status messages but not animations
  else if (!params.running && isCI) {
    log(params, `${chars.start} ${info}`)
  }

  return `${chars.start} ${info}`
}

function done (params, newName, msg) {
  let { name } = params
  maybeCancel(params) // Maybe clear running status and reset
  if (!msg) {
    msg = newName
    newName = ''
  }
  if (newName) newName = chalk.grey(newName)
  if (msg) msg = chalk.cyan(msg)
  let info = `${chars.done} ${newName ? newName : name} ${msg ? msg : ''}`.trim()
  log(params, info)
  return info
}

function cancel ({ running }) {
  if (running) {
    clearInterval(running)
    printer.reset()
    printer.clear()
    running = false // Prevent accidental second `done` print
  }
}
let maybeCancel = cancel

function err (params, error) {
  maybeCancel(params)
  let isErr = error instanceof Error
  let name = isErr ? error.name : 'Error'
  let msg = isErr ? error.message : error
  let info = `${chars.err} ${chalk.red(name + ':')} ${msg}`.trim()
  if (isErr) {
    info += '\n' + error.stack.split('\n').slice(1).join('\n')
  }
  // Always print errors
  log({ force: true, ...params }, info)
  return info
}

function warn (params, warning) {
  maybeCancel(params)
  if (warning instanceof Error) warning = warning.message
  let info = `${chars.warn} ${chalk.yellow('Warning:')} ${warning}`.trim()
  log(params, info)
  return info
}

function raw (params, msg) {
  log(params, msg)
  return msg
}

module.exports = {
  start,
  status,
  done,
  cancel,
  err,
  warn,
  raw,
}

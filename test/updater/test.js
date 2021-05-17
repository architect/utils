let updater = require('../../updater')
let lib = require('../../updater/lib')
let chars = require('../../chars')
let test = require('tape')

/**
 * Note: this test analyzes stdout output, do not run through tap-spec or other TTY-mungers
 * Always run reset() before your test to expunge tap output from the running log
 */
let output = ''
process.stdout.write = (write => {
  return function (string) {
    output += string
    write.apply(process.stdout, arguments)
  }
})(process.stdout.write)

let isBuildCI = process.env.CI
let timer = 275 // Should animate only twice on both *nix + Win
let tidy = i => i.replace(/(^\n|\n$)/g, '') // Remove trailing newline
let reset = update => {
  output = ''
  if (update) update.reset()
}

test('Set up env', t => {
  t.plan(3)
  t.ok(updater, 'Updater loaded')
  t.ok(lib, 'Updater lib loaded')
  t.ok(chars, 'Chars loaded')
})

test('Methods', t => {
  t.plan(39)
  let name = 'Methods test' // Should be different from test name
  let update = updater(name)
  let methods = [ 'start', 'status', 'done', 'cancel', 'err', 'warn', 'raw' ]
  let aliases = [ 'update', 'stop', 'error', 'fail', 'warning' ]
  let all = methods.concat(aliases)
  all.forEach(method => {
    t.ok(update[method], `Got updater.${method}`)
    t.ok(update.verbose[method], `Got updater.verbose.${method}`)
    t.ok(update.debug[method], `Got updater.debug.${method}`)
  })
  t.ok(update.get, `Got updater.get`)
  t.ok(update.reset, `Got updater.reset`)
  t.ok(update.clear, `Got updater.clear`)
})

test('Status update test', t => {
  t.plan(13)
  reset()
  let name = 'Status test' // Should be different from test name
  let update = updater(name)

  // No message
  let result = update.status()
  let out = output
  t.notOk(tidy(out).includes(name) && result.includes(name), 'Did not return / print anything')
  console.log(`Returned: ${result}`)
  reset(update)

  // One message
  let msg = 'one liner'
  result = update.status(msg)
  out = output
  t.equal(tidy(out), result, 'Output and return are equal')
  t.ok(result.includes(name), 'Returned / printed correct name')
  t.ok(result.includes(msg), 'Returned / printed correct msg')
  console.log(`Returned: ${result}`)
  reset(update)

  // Message + multi-line update
  msg = 'multi liner'
  let line2 = 'this is line two'
  let line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  t.equal(tidy(out), result, 'Output and return are equal')
  t.ok(result.includes(name), 'Returned / printed correct name')
  t.ok(result.includes(msg), 'Returned / printed correct msg')
  t.ok(result.includes(line2), 'Returned / printed line2')
  t.ok(result.includes(line3), 'Returned / printed line3')
  console.log(`Returned: ${result}`)
  reset(update)

  // No message + multi-line update
  msg = ''
  line2 = 'this is line two'
  line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  t.equal(tidy(out), tidy(result), 'Output and return are equal (except newline placement)')
  t.notOk(result.includes(name), 'Did not return / print name')
  t.ok(result.includes(line2), 'Returned / printed line2')
  t.ok(result.includes(line3), 'Returned / printed line3')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Status update test (quiet)', t => {
  t.plan(13)
  reset()
  let name = 'Status test' // Should be different from test name
  let update = updater(name, { quiet: true })

  // No message
  let result = update.status()
  let out = output
  t.notOk(tidy(out).includes(name) && result.includes(name), 'Did not return / print anything')
  console.log(`Returned: ${result}`)
  reset(update)

  // One message
  let msg = 'one liner'
  result = update.status(msg)
  out = output
  t.notOk(out, 'Did not print')
  t.ok(result.includes(name), 'Returned correct name')
  t.ok(result.includes(msg), 'Returned correct msg')
  console.log(`Returned: ${result}`)
  reset(update)

  // Message + multi-line update
  msg = 'multi liner'
  let line2 = 'this is line two'
  let line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  t.notOk(out, 'Did not print')
  t.ok(result.includes(name), 'Returned correct name')
  t.ok(result.includes(msg), 'Returned correct msg')
  t.ok(result.includes(line2), 'Returned line2')
  t.ok(result.includes(line3), 'Returned line3')
  console.log(`Returned: ${result}`)
  reset(update)

  // No message + multi-line update
  msg = ''
  line2 = 'this is line two'
  line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  t.notOk(out, 'Did not print')
  t.notOk(result.includes(name), 'Did not return name')
  t.ok(result.includes(line2), 'Returned / printed line2')
  t.ok(result.includes(line3), 'Returned / printed line3')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Start + cancel test', t => {
  let count = isBuildCI ? 1 : 3
  t.plan(count)
  reset()
  let name = 'Progress indicator + cancel test'
  let update = updater(name)

  // No message
  let result = update.start()
  setTimeout(() => {
    update.cancel()
    let out = output
    out = out.split(name)
    t.ok(result.includes(name), 'Returned correct name')
    if (!isBuildCI) {
      t.equal(out.length, 3, 'Printed correct name, animated twice')
      t.pass(`update.cancel ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Start + cancel test (quiet)', t => {
  let count = isBuildCI ? 2 : 3
  t.plan(count)
  reset()
  let name = 'Progress indicator + cancel test'
  let update = updater(name, { quiet: true })

  // No message
  let result = update.start()
  setTimeout(() => {
    update.cancel()
    let out = output
    t.ok(result.includes(name), 'Returned correct name')
    t.notOk(out, 'Did not print')
    if (!isBuildCI) {
      t.pass(`update.cancel ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Start + done test', t => {
  let count = isBuildCI ? 3 : 5
  t.plan(count)
  reset()
  let name = 'Progress indicator + done test'
  let update = updater(name)

  // Message
  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    update.done()
    let out = output
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.ok(out.includes(chars.done), 'update.done updated line with done status')
    out = out.split(name)
    if (!isBuildCI) {
      t.equal(out.length, 4, 'Printed correct name, animated twice')
      t.pass(`update.done ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Start + done test (quiet)', t => {
  let count = isBuildCI ? 3 : 4
  t.plan(count)
  reset()
  let name = 'Progress indicator + done test'
  let update = updater(name, { quiet: true })

  // Message
  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    update.done()
    let out = output
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.notOk(out, 'Did not print')
    if (!isBuildCI) {
      t.pass(`update.done ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Warn test', t => {
  t.plan(4)
  reset()
  let name = 'Warn test'
  let update = updater(name)

  let warning = `Here's a warning!`
  let result = update.warn(warning)
  let out = output
  t.notOk(out.includes(name), 'Warning did not include name')
  t.ok(out.includes(warning), 'Returned correct warning')
  t.ok(out.includes(chars.warn), 'Warning included icon')
  t.ok(result, 'Returned result')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Warn test (quiet)', t => {
  t.plan(4)
  reset()
  let name = 'Warn test'
  let update = updater(name, { quiet: true })

  let warning = `Here's a warning!`
  let result = update.warn(warning)
  let out = output
  t.notOk(result.includes(name), 'Warning did not include name')
  t.ok(result.includes(warning), 'Returned correct warning')
  t.ok(result.includes(chars.warn), 'Warning included icon')
  t.notOk(out, 'Did not print')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Raw test', t => {
  t.plan(3)
  reset()
  let name = 'Raw test'
  let update = updater(name)

  let raw = `Here's a raw log!`
  let result = update.raw(raw)
  let out = output
  t.notOk(out.includes(name), 'Raw did not include name')
  t.ok(out.includes(raw), 'Printed correct raw input')
  t.ok(result.includes(raw), 'Returned correct raw input')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Raw test (quiet)', t => {
  t.plan(3)
  reset()
  let name = 'Raw test'
  let update = updater(name, { quiet: true })

  let raw = `Here's a raw log!`
  let result = update.raw(raw)
  let out = output
  t.notOk(out.includes(name), 'Raw did not include name')
  t.ok(result.includes(raw), 'Returned correct raw input')
  t.notOk(out, 'Did not print')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Start + done with updated name test', t => {
  let count = isBuildCI ? 4 : 7
  t.plan(count)
  reset()
  let name = 'Progress indicator + done with updated name test'
  let update = updater(name)

  // Round 2
  let msg = `Let's indicate some more progress!`
  let result = update.start(msg)
  let newName = 'A status change'
  let newMsg = 'A new message'
  setTimeout(() => {
    let done = update.done(newName, newMsg)
    let out = output
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(done.includes(newName), 'Returned correct updated name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.ok(out.includes(chars.done) && out.includes(newName) && out.includes(newMsg), 'update.done updated line with update done status (both name and message)')
    out = out.split(name)
    if (!isBuildCI) {
      t.ok(done.includes(newMsg), 'Returned correct updated msg')
      t.equal(out.length, 3, 'Printed correct updated name, animated twice')
      t.pass(`update.done ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Start + done with updated name test (quiet)', t => {
  let count = isBuildCI ? 4 : 6
  t.plan(count)
  reset()
  let name = 'Progress indicator + done with updated name test'
  let update = updater(name, { quiet: true })

  // Round 2
  let msg = `Let's indicate some more progress!`
  let result = update.start(msg)
  let newName = 'A status change'
  let newMsg = 'A new message'
  setTimeout(() => {
    let done = update.done(newName, newMsg)
    let out = output
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(done.includes(newName), 'Returned correct updated name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.notOk(out, 'Did not print')
    if (!isBuildCI) {
      t.ok(done.includes(newMsg), 'Returned correct updated msg')
      t.pass(`update.done ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Start / CI-mode test', t => {
  t.plan(5)
  process.env.CI = true
  reset()
  let name = 'Progress indicator CI-mode test'
  let update = updater(name)

  // Message
  let msg = `Let's indicate some progress for CI!`
  let result = update.start(msg)
  setTimeout(() => {
    let out = output
    out = out.split(name)
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.equal(out.length, 2, 'Did not animate')
    t.notOk(out.join('').includes(lib.spinner.frames[1]), 'Really did not animate')
    t.pass(`In CI mode, process wouldn't hang endlessly if update.cancel or update.done aren't run`) // As evidenced by this test having run without update.cancel or update.done
    console.log(`Returned: ${result}`)
    reset(update)
    delete process.env.CI
  }, timer)
})

test('Start / CI-mode test (quiet)', t => {
  t.plan(4)
  process.env.CI = true
  reset()
  let name = 'Progress indicator CI-mode test'
  let update = updater(name, { quiet: true })

  // Message
  let msg = `Let's indicate some progress for CI!`
  let result = update.start(msg)
  setTimeout(() => {
    let out = output
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.notOk(out, 'Did not print')
    t.pass(`In CI mode, process wouldn't hang endlessly if update.cancel or update.done aren't run`) // As evidenced by this test having run without update.cancel or update.done
    console.log(`Returned: ${result}`)
    reset(update)
    delete process.env.CI
  }, timer)
})

test('Error test', t => {
  t.plan(10)
  reset()
  let name = 'Error update test'
  let update = updater(name)

  // An error message
  let e = 'an error'
  let result = update.error(e)
  let out = output
  t.ok(tidy(out).includes(result), 'Output and return are equal (except cursor restore escape chars)')
  t.ok(result.includes(chars.err) && result.includes('Error:'), 'Returned / printed error name')
  t.notOk(result.includes(name), 'Did not return / print updater name')
  t.ok(result.includes(e), 'Returned / printed correct error')
  t.ok(result.split('\n').length === 1, 'Did not return a stack trace')
  console.log(`Returned: ${result}`)
  reset(update)

  // An actual error
  let errMsg = 'a real error'
  let error = Error(errMsg)
  result = update.error(error)
  out = output
  t.equal(tidy(out), result, 'Output and return are equal')
  t.ok(result.includes(chars.err) && result.includes('Error:'), 'Returned / printed error name')
  t.notOk(result.includes(name), 'Did not return / print updater name')
  t.ok(result.includes(errMsg), 'Returned / printed correct error message')
  t.ok(result.split('\n').length > 1, 'Returned a stack trace')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Error test (quiet)', t => {
  t.plan(8)
  reset()
  let name = 'Error update test'
  let update = updater(name, { quiet: true })

  // An error message
  let e = 'an error'
  let result = update.error(e)
  let out = output
  t.ok(tidy(out).includes(result), 'Output and return are equal (except cursor restore escape chars)')
  t.ok(result.includes(chars.err) && result.includes('Error:'), 'Returned error name')
  t.notOk(result.includes(name), 'Did not return updater name')
  t.ok(result.includes(e), 'Returned correct error')
  console.log(`Returned: ${result}`)
  reset(update)

  // An actual error
  let errMsg = 'a real error'
  let error = Error(errMsg)
  result = update.error(error)
  out = output
  t.ok(out, 'Did print (because an error is present)')
  t.ok(result.includes(chars.err) && result.includes('Error:'), 'Returned error name')
  t.notOk(result.includes(name), 'Did not return updater name')
  t.ok(result.includes(errMsg), 'Returned correct error message')
  console.log(`Returned: ${result}`)
  reset(update)
})

test('Start + error test', t => {
  let count = isBuildCI ? 5 : 7
  t.plan(count)
  reset()
  let name = 'Progress indicator + error'
  let update = updater(name)

  // Start then error
  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    let e = 'an error occurred'
    let err = update.error(e)
    let out = output.split(name)
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.ok(err.includes(chars.err) && err.includes('Error:'), 'Returned / printed error name')
    t.notOk(err.includes(name), 'Did not return / print updater name')
    t.ok(err.includes(e), 'Returned / printed correct error message')
    if (!isBuildCI) {
      t.equal(out.length, 3, 'Printed correct name, animated twice')
      t.pass(`Error ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Start + error test (quiet)', t => {
  let count = isBuildCI ? 6 : 8
  t.plan(count)
  reset()
  let name = 'Progress indicator + error'
  let update = updater(name, { quiet: true })

  // Start then error
  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    let e = 'an error occurred'
    let err = update.error(e)
    let out = output.split(name)
    t.ok(out, 'Did print (because an error is present)')
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.ok(err.includes(chars.err) && err.includes('Error:'), 'Returned error name')
    t.notOk(err.includes(name), 'Did not return updater name')
    t.ok(err.includes(e), 'Returned correct error message')
    if (!isBuildCI) {
      t.equal(out.length, 1, 'Printed error')
      t.pass(`Error ended indicator, or this test wouldn't have run`)
    }
    console.log(`Returned: ${result}`)
    reset(update)
  }, timer)
})

test('Log getter test', t => {
  t.plan(4)
  reset()
  let name = 'Getter'
  let bits = [ 'one', 'two', 'three' ]
  let log = []
  let out
  let result

  function go () {
    reset(update)
    log = []
    bits.forEach(bit => log.push(update.status(`update ${bit}`)))
    out = output
    result = log.join('\n')
  }

  let update = updater(name)
  go()
  t.ok(tidy(out).includes(result), 'Output and return are equal (except cursor restore escape chars)')
  t.equal(update.get(), result, 'Getter returned log of all printed updates')

  update = updater(name, { quiet: true })
  go()
  t.notOk(out, 'Did not print')
  t.equal(update.get(), result, 'Getter returned log of all updates even (with quiet param)')
  reset(update)
})

test('Log levels (logLevel) test', t => {
  t.plan(12)
  reset()
  let name = 'Log levels'
  let quiet = false
  let update
  let logLevel
  let out
  let normal
  let verbose
  let debug

  // Normal
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: false')
  verbose = update.verbose.status('verbose, quiet: false')
  debug = update.debug.status('debug, quiet: false')
  out = output
  t.ok(tidy(out).includes(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  t.notOk(tidy(out).includes(verbose), 'Output does not include statements with logLevel verbose')
  t.notOk(tidy(out).includes(debug), 'Output does not include statements with logLevel debug')
  t.equal(update.get(), normal, 'Getter returned only normal statements')
  reset(update)

  // Verbose
  logLevel = 'verbose'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: false')
  verbose = update.verbose.status('verbose, quiet: false')
  debug = update.debug.status('debug, quiet: false')
  out = output
  t.ok(tidy(out).includes(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  t.ok(tidy(out).includes(verbose), 'Output includes statements with logLevel verbose')
  t.notOk(tidy(out).includes(debug), 'Output does not include statements with logLevel debug')
  t.equal(update.get(), `${normal}\n${verbose}`, 'Getter returned only normal & verbose statements')
  reset(update)

  // Debug
  logLevel = 'debug'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: false')
  verbose = update.verbose.status('verbose, quiet: false')
  debug = update.debug.status('debug, quiet: false')
  out = output
  t.ok(tidy(out).includes(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  t.ok(tidy(out).includes(verbose), 'Output includes statements with logLevel verbose')
  t.ok(tidy(out).includes(debug), 'Output includes statements with logLevel debug')
  t.equal(update.get(), `${normal}\n${verbose}\n${debug}`, 'Getter returned only normal, verbose, & debug statements')
  reset(update)
})

test('Log levels (logLevel) test (quiet)', t => {
  t.plan(6)
  reset()
  let name = 'Log levels'
  let quiet = true
  let update
  let logLevel
  let out
  let normal
  let verbose
  let debug

  // Normal
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: true')
  verbose = update.verbose.status('verbose, quiet: true')
  debug = update.debug.status('debug, quiet: true')
  out = output
  t.notOk(out, 'Did not print')
  t.equal(update.get(), normal, 'Getter returned only normal statements')
  reset(update)

  // Verbose
  logLevel = 'verbose'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: true')
  verbose = update.verbose.status('verbose, quiet: true')
  debug = update.debug.status('debug, quiet: true')
  out = output
  t.notOk(out, 'Did not print')
  t.equal(update.get(), `${normal}\n${verbose}`, 'Getter returned only normal & verbose statements')
  reset(update)

  // Debug
  logLevel = 'debug'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: true')
  verbose = update.verbose.status('verbose, quiet: true')
  debug = update.debug.status('debug, quiet: true')
  out = output
  t.notOk(out, 'Did not print')
  t.equal(update.get(), `${normal}\n${verbose}\n${debug}`, 'Getter returned only normal, verbose, & debug statements')
  reset(update)
})

test('Reset test', t => {
  t.plan(3)
  reset()
  let name = 'Reset'
  let update = updater(name)
  let normal = update.status('normal')
  let out = output
  t.ok(tidy(out).includes(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  t.equal(update.get(), normal, 'Getter returned only normal statements')
  update.reset()
  t.equal(update.get(), '', 'Resetter cleared updater data')
  reset(update)
})

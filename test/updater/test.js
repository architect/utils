const { test } = require('node:test')
const assert = require('node:assert')
const updater = require('../../updater')
const lib = require('../../updater/lib')
const chars = require('../../chars')

/**
 * Note: this test analyzes stdout output
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

test('Set up env', () => {
  assert.ok(updater, 'Updater loaded')
  assert.ok(lib, 'Updater lib loaded')
  assert.ok(chars, 'Chars loaded')
})

test('Methods', () => {
  let name = 'Methods test'
  let update = updater(name)
  let methods = [ 'start', 'status', 'done', 'cancel', 'err', 'warn', 'raw' ]
  let aliases = [ 'update', 'stop', 'error', 'fail', 'warning' ]
  let all = methods.concat(aliases)
  all.forEach(method => {
    assert.ok(update[method], `Got updater.${method}`)
    assert.ok(update.verbose[method], `Got updater.verbose.${method}`)
    assert.ok(update.debug[method], `Got updater.debug.${method}`)
  })
  assert.ok(update.get, `Got updater.get`)
  assert.ok(update.reset, `Got updater.reset`)
  assert.ok(update.clear, `Got updater.clear`)
})

test('Status update test', () => {
  reset()
  let name = 'Status test'
  let update = updater(name)

  // No message
  let result = update.status()
  let out = output
  assert.doesNotMatch(tidy(out), new RegExp(name), 'no message parameter yields no updater name in output')
  assert.doesNotMatch(result, new RegExp(name), 'no message parameter yields no updater name in return value')
  reset(update)

  // One message
  let msg = 'one liner'
  result = update.status(msg)
  out = output
  assert.strictEqual(tidy(out), result, 'Output and return are equal')
  assert.match(result, new RegExp(name), 'Returned / printed correct name')
  assert.match(result, new RegExp(msg), 'Returned / printed correct msg')
  reset(update)

  // Message + multi-line update
  msg = 'multi liner'
  let line2 = 'this is line two'
  let line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  assert.strictEqual(tidy(out), result, 'Output and return are equal')
  assert.match(result, new RegExp(name), 'Returned / printed correct name')
  assert.match(result, new RegExp(msg), 'Returned / printed correct msg')
  assert.match(result, new RegExp(line2), 'Returned / printed line2')
  assert.match(result, new RegExp(line3), 'Returned / printed line3')
  reset(update)

  // No message + multi-line update
  msg = ''
  line2 = 'this is line two'
  line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  assert.strictEqual(tidy(out), tidy(result), 'Output and return are equal (except newline placement)')
  assert.doesNotMatch(result, new RegExp(name), 'Did not return / print name')
  assert.match(result, new RegExp(line2), 'Returned / printed line2')
  assert.match(result, new RegExp(line3), 'Returned / printed line3')
  reset(update)
})

test('Status update test (quiet)', () => {
  reset()
  let name = 'Status test'
  let update = updater(name, { quiet: true })

  // No message
  let result = update.status()
  let out = output
  assert.doesNotMatch(tidy(out), new RegExp(name), 'no message parameter yields no updater name in output')
  assert.doesNotMatch(result, new RegExp(name), 'no message parameter yields no updater name in return value')
  reset(update)

  // One message
  let msg = 'one liner'
  result = update.status(msg)
  out = output
  assert.ok(!out, 'Did not print')
  assert.match(result, new RegExp(name), 'Returned correct name')
  assert.match(result, new RegExp(msg), 'Returned correct msg')
  reset(update)

  // Message + multi-line update
  msg = 'multi liner'
  let line2 = 'this is line two'
  let line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  assert.ok(!out, 'Did not print')
  assert.match(result, new RegExp(name), 'Returned correct name')
  assert.match(result, new RegExp(msg), 'Returned correct msg')
  assert.match(result, new RegExp(line2), 'Returned line2')
  assert.match(result, new RegExp(line3), 'Returned line3')
  reset(update)

  // No message + multi-line update
  msg = ''
  line2 = 'this is line two'
  line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  assert.ok(!out, 'Did not print')
  assert.doesNotMatch(result, new RegExp(name), 'Did not return name')
  assert.match(result, new RegExp(line2), 'Returned / printed line2')
  assert.match(result, new RegExp(line3), 'Returned / printed line3')
  reset(update)
})

test('Start + cancel test', (t, done) => {
  reset()
  let name = 'Progress indicator and cancel test'
  let update = updater(name)

  let result = update.start()
  setTimeout(() => {
    update.cancel()
    let out = output
    out = out.split(name)
    assert.match(result, new RegExp(name), 'Returned correct name')
    if (!isBuildCI) {
      assert.strictEqual(out.length, 3, 'Printed correct name, animated twice')
      assert.ok(true, `update.cancel ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Start + cancel test (quiet)', (t, done) => {
  reset()
  let name = 'Progress indicator and cancel test'
  let update = updater(name, { quiet: true })

  let result = update.start()
  setTimeout(() => {
    update.cancel()
    let out = output
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.doesNotMatch(out, new RegExp(name), 'Did not print updater name')
    if (!isBuildCI) {
      assert.ok(true, `update.cancel ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Start + done test', (t, done) => {
  reset()
  let name = 'Progress indicator and done test'
  let update = updater(name)

  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    update.done()
    let out = output
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.match(out, new RegExp(chars.done), 'update.done updated line with done status')
    out = out.split(name)
    if (!isBuildCI) {
      assert.strictEqual(out.length, 4, 'Printed correct name, animated twice')
      assert.ok(true, `update.done ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Start + done test (quiet)', (t, done) => {
  reset()
  let name = 'Progress indicator and done test'
  let update = updater(name, { quiet: true })

  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    update.done()
    let out = output
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.doesNotMatch(out, new RegExp(name), 'Did not print updater name')
    if (!isBuildCI) {
      assert.ok(true, `update.done ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Warn test', () => {
  reset()
  let name = 'Warn test'
  let update = updater(name)

  let warning = `Here's a warning!`
  let result = update.warn(warning)
  let out = output
  assert.doesNotMatch(out, new RegExp(name), 'Warning did not include name')
  assert.match(out, new RegExp(warning), 'Returned correct warning')
  assert.match(out, new RegExp(chars.warn), 'Warning included icon')
  assert.ok(result, 'Returned result')
  reset(update)
})

test('Warn test (quiet)', () => {
  reset()
  let name = 'Warn test'
  let update = updater(name, { quiet: true })

  let warning = `Here's a warning!`
  let result = update.warn(warning)
  let out = output
  assert.doesNotMatch(result, new RegExp(name), 'Warning did not include name')
  assert.match(result, new RegExp(warning), 'Returned correct warning')
  assert.match(result, new RegExp(chars.warn), 'Warning included icon')
  assert.ok(!out, 'Did not print')
  reset(update)
})

test('Raw test', () => {
  reset()
  let name = 'Raw test'
  let update = updater(name)

  let raw = `Here's a raw log!`
  let result = update.raw(raw)
  let out = output
  assert.doesNotMatch(out, new RegExp(name), 'Raw did not include name')
  assert.match(out, new RegExp(raw), 'Printed correct raw input')
  assert.match(result, new RegExp(raw), 'Returned correct raw input')
  reset(update)
})

test('Raw test (quiet)', () => {
  reset()
  let name = 'Raw test'
  let update = updater(name, { quiet: true })

  let raw = `Here's a raw log!`
  let result = update.raw(raw)
  let out = output
  assert.doesNotMatch(out, new RegExp(name), 'Raw did not include name')
  assert.match(result, new RegExp(raw), 'Returned correct raw input')
  assert.ok(!out, 'Did not print')
  reset(update)
})

test('Start + done with updated name test', (t, done) => {
  reset()
  let name = 'Progress indicator and done with updated name test'
  let update = updater(name)

  let msg = `Let's indicate some more progress!`
  let result = update.start(msg)
  let newName = 'A status change'
  let newMsg = 'A new message'
  setTimeout(() => {
    let doneResult = update.done(newName, newMsg)
    let out = output
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(doneResult, new RegExp(newName), 'Returned correct updated name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.match(out, new RegExp(chars.done), 'update.done updated line with update done chars')
    assert.match(out, new RegExp(newMsg), 'update.done updated line with updated msg')
    out = out.split(name)
    if (!isBuildCI) {
      assert.match(doneResult, new RegExp(newMsg), 'Returned correct updated msg')
      assert.strictEqual(out.length, 3, 'Printed correct updated name, animated twice')
      assert.ok(true, `update.done ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Start + done with updated name test (quiet)', (t, done) => {
  reset()
  let name = 'Progress indicator and done with updated name test'
  let update = updater(name, { quiet: true })

  let msg = `Let's indicate some more progress!`
  let result = update.start(msg)
  let newName = 'A status change'
  let newMsg = 'A new message'
  setTimeout(() => {
    let doneResult = update.done(newName, newMsg)
    let out = output
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(doneResult, new RegExp(newName), 'Returned correct updated name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.doesNotMatch(out, new RegExp(name), 'Did not print updater name')
    if (!isBuildCI) {
      assert.match(doneResult, new RegExp(newMsg), 'Returned correct updated msg')
      assert.ok(true, `update.done ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Start / CI-mode test', (t, done) => {
  process.env.CI = true
  reset()
  let name = 'Progress indicator CI-mode test'
  let update = updater(name)

  let msg = `Let's indicate some progress for CI!`
  let result = update.start(msg)
  setTimeout(() => {
    let out = output
    out = out.split(name)
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.strictEqual(out.length, 2, 'Did not animate')
    assert.doesNotMatch(out.join(''), new RegExp(lib.spinner.frames[1]), 'Really did not animate')
    assert.ok(true, `In CI mode, process wouldn't hang endlessly if update.cancel or update.done aren't run`)
    reset(update)
    delete process.env.CI
    done()
  }, timer)
})

test('Start / CI-mode test (quiet)', (t, done) => {
  process.env.CI = true
  reset()
  let name = 'Progress indicator CI-mode test'
  let update = updater(name, { quiet: true })

  let msg = `Let's indicate some progress for CI!`
  let result = update.start(msg)
  setTimeout(() => {
    let out = output
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.doesNotMatch(out, new RegExp(name), 'Did not print updater name')
    assert.ok(true, `In CI mode, process wouldn't hang endlessly if update.cancel or update.done aren't run`)
    reset(update)
    delete process.env.CI
    done()
  }, timer)
})

test('Error test', () => {
  reset()
  let name = 'Error update test'
  let update = updater(name)

  // An error message
  let e = 'an error'
  let result = update.error(e)
  let out = output
  assert.match(tidy(out), new RegExp(result), 'Output and return are equal (except cursor restore escape chars)')
  assert.match(result, new RegExp(chars.err), 'Returned error name')
  assert.match(result, /Error:/, 'Printed error prefix')
  assert.doesNotMatch(result, new RegExp(name), 'Did not return / print updater name')
  assert.match(result, new RegExp(e), 'Returned / printed correct error')
  assert.strictEqual(result.split('\n').length, 1, 'Did not return a stack trace')
  reset(update)

  // An actual error
  let errMsg = 'a real error'
  let error = Error(errMsg)
  result = update.error(error)
  out = output
  assert.strictEqual(tidy(out), result, 'Output and return are equal')
  assert.match(result, new RegExp(chars.err), 'Returned error name')
  assert.match(result, /Error:/, 'Returned error prefix')
  assert.doesNotMatch(result, new RegExp(name), 'Did not return / print updater name')
  assert.match(result, new RegExp(errMsg), 'Returned / printed correct error message')
  assert.ok(result.split('\n').length > 1, 'Returned a stack trace')
  reset(update)
})

test('Error test (quiet)', () => {
  reset()
  let name = 'Error update test'
  let update = updater(name, { quiet: true })

  // An error message
  let e = 'an error'
  let result = update.error(e)
  let out = output
  assert.match(tidy(out), new RegExp(result), 'Output and return are equal (except cursor restore escape chars)')
  assert.match(result, new RegExp(chars.err), 'Returned error name')
  assert.match(result, /Error:/, 'Returned error prefix')
  assert.doesNotMatch(result, new RegExp(name), 'Did not return updater name')
  assert.match(result, new RegExp(e), 'Returned correct error')
  reset(update)

  // An actual error
  let errMsg = 'a real error'
  let error = Error(errMsg)
  result = update.error(error)
  out = output
  assert.ok(out, 'Did print (because an error is present)')
  assert.match(result, new RegExp(chars.err), 'Returned error name')
  assert.match(result, /Error:/, 'Returned error prefix')
  assert.doesNotMatch(result, new RegExp(name), 'Did not return updater name')
  assert.match(result, new RegExp(errMsg), 'Returned correct error message')
  reset(update)
})

test('Start + error test', (t, done) => {
  reset()
  let name = 'Progress indicator and error'
  let update = updater(name)

  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    let e = 'an error occurred'
    let err = update.error(e)
    let out = output.split(name)
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.match(err, new RegExp(chars.err), 'Returned error name')
    assert.match(err, /Error:/, 'Returned error prefix')
    assert.doesNotMatch(err, new RegExp(name), 'Did not return / print updater name')
    assert.match(err, new RegExp(e), 'Returned / printed correct error message')
    if (!isBuildCI) {
      assert.ok(out.length >= 2, 'Printed correct name, animated at least once')
      assert.ok(true, `Error ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Start + error test (quiet)', (t, done) => {
  reset()
  let name = 'Progress indicator and error'
  let update = updater(name, { quiet: true })

  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    let e = 'an error occurred'
    let err = update.error(e)
    let out = output.split(name)
    assert.ok(out, 'Did print (because an error is present)')
    assert.match(result, new RegExp(name), 'Returned correct name')
    assert.match(result, new RegExp(msg), 'Returned correct msg')
    assert.match(err, new RegExp(chars.err), 'Returned error name')
    assert.match(err, /Error:/, 'Returned error prefix')
    assert.doesNotMatch(err, new RegExp(name), 'Did not return updater name')
    assert.match(err, new RegExp(e), 'Returned correct error message')
    if (!isBuildCI) {
      assert.strictEqual(out.length, 1, 'Printed error')
      assert.ok(true, `Error ended indicator, or this test wouldn't have run`)
    }
    reset(update)
    done()
  }, timer)
})

test('Log getter test', () => {
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
  assert.match(tidy(out), new RegExp(result), 'Output and return are equal (except cursor restore escape chars)')
  assert.strictEqual(update.get(), result, 'Getter returned log of all printed updates')

  update = updater(name, { quiet: true })
  go()
  assert.ok(!out, 'Did not print')
  assert.strictEqual(update.get(), result, 'Getter returned log of all updates even (with quiet param)')
  reset(update)
})

test('Log levels (logLevel) test', () => {
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
  assert.match(tidy(out), new RegExp(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  assert.doesNotMatch(tidy(out), new RegExp(verbose), 'Output does not include statements with logLevel verbose')
  assert.doesNotMatch(tidy(out), new RegExp(debug), 'Output does not include statements with logLevel debug')
  assert.strictEqual(update.get(), normal, 'Getter returned only normal statements')
  reset(update)

  // Verbose
  logLevel = 'verbose'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: false')
  verbose = update.verbose.status('verbose, quiet: false')
  debug = update.debug.status('debug, quiet: false')
  out = output
  assert.match(tidy(out), new RegExp(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  assert.match(tidy(out), new RegExp(verbose), 'Output includes statements with logLevel verbose')
  assert.doesNotMatch(tidy(out), new RegExp(debug), 'Output does not include statements with logLevel debug')
  assert.strictEqual(update.get(), `${normal}\n${verbose}`, 'Getter returned only normal & verbose statements')
  reset(update)

  // Debug
  logLevel = 'debug'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: false')
  verbose = update.verbose.status('verbose, quiet: false')
  debug = update.debug.status('debug, quiet: false')
  out = output
  assert.match(tidy(out), new RegExp(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  assert.match(tidy(out), new RegExp(verbose), 'Output includes statements with logLevel verbose')
  assert.match(tidy(out), new RegExp(debug), 'Output includes statements with logLevel debug')
  assert.strictEqual(update.get(), `${normal}\n${verbose}\n${debug}`, 'Getter returned only normal, verbose, & debug statements')
  reset(update)
})

test('Log levels (logLevel) test (quiet)', () => {
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
  assert.ok(!out, 'Did not print')
  assert.strictEqual(update.get(), normal, 'Getter returned only normal statements')
  reset(update)

  // Verbose
  logLevel = 'verbose'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: true')
  verbose = update.verbose.status('verbose, quiet: true')
  debug = update.debug.status('debug, quiet: true')
  out = output
  assert.ok(!out, 'Did not print')
  assert.strictEqual(update.get(), `${normal}\n${verbose}`, 'Getter returned only normal & verbose statements')
  reset(update)

  // Debug
  logLevel = 'debug'
  update = updater(name, { logLevel, quiet })
  normal = update.status('normal, quiet: true')
  verbose = update.verbose.status('verbose, quiet: true')
  debug = update.debug.status('debug, quiet: true')
  out = output
  assert.ok(!out, 'Did not print')
  assert.strictEqual(update.get(), `${normal}\n${verbose}\n${debug}`, 'Getter returned only normal, verbose, & debug statements')
  reset(update)
})

test('Reset test', () => {
  reset()
  let name = 'Reset'
  let update = updater(name)
  let normal = update.status('normal')
  let out = output
  assert.match(tidy(out), new RegExp(normal), 'Output includes statements with logLevel normal (except cursor restore escape chars)')
  assert.strictEqual(update.get(), normal, 'Getter returned only normal statements')
  update.reset()
  assert.strictEqual(update.get(), '', 'Resetter cleared updater data')
  reset(update)
})

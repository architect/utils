let updater = require('../updater')
let lib = require('../updater/lib')
let chars = require('../chars')
let test = require('tape')

/**
 * Note: this test analyzes stdout output, do not run through tap-spec or other TTY-mungers
 */
let output = ''
process.stdout.write = (write => {
  return function(string) {
    output += string
    write.apply(process.stdout, arguments)
  }
})(process.stdout.write)

let timer = 275 // Should animate only twice on both *nix + Win
let tidy = i => i.replace(/\n$/,'') // Remove trailing newline
let reset = () => output = ''

test('Set up env', t => {
  t.plan(4)
  t.ok(updater, 'Updater loaded')
  t.ok(lib, 'Updater lib loaded')
  t.ok(chars, 'Chars loaded')
  let isCI = process.env.CI || !process.stdout.isTTY
  if (process.env.APPVEYOR && process.stdout.isTTY)
    process.env.CI = false
  if (isCI)
    t.fail('Cannot run tests: process.env.CI || !process.stdout.isTTY')
  else
    t.ok('Env is not CI or !TTY')
})

test('Status update test', t => {
  t.plan(10)
  reset()
  let name = 'Status test' // Should be different from test name
  let update = updater(name)

  // No message
  let result = update.status()
  let out = output
  reset()
  t.ok(tidy(out).includes(result), 'Output and return are equal (except cursor restore escape chars)')
  t.ok(result.includes(name), 'Returned / printed correct name')
  console.log(`Result: ${result}\nOutput: ${out}`)
  reset()

  // One message
  let msg = 'one liner'
  result = update.status(msg)
  out = output
  reset()
  t.equal(tidy(out), result, 'Output and return are equal')
  t.ok(result.includes(name), 'Returned / printed correct name')
  t.ok(result.includes(msg), 'Returned / printed correct msg')
  console.log(`Result: ${result}\nOutput: ${out}`)
  reset()

  // Multiple messages
  msg = 'multi liner'
  let line2 = 'this is line two'
  let line3 = 'and this is line three'
  result = update.status(msg, line2, line3)
  out = output
  reset()
  t.equal(tidy(out), result, 'Output and return are equal')
  t.ok(result.includes(name), 'Returned / printed correct name')
  t.ok(result.includes(msg), 'Returned / printed correct msg')
  t.ok(result.includes(line2), 'Returned / printed line2')
  t.ok(result.includes(line3), 'Returned / printed line3')
  console.log(`Result: ${result}\nOutput: ${out}`)
})

test('Start + cancel test', t => {
  t.plan(3)
  reset()
  let name = 'Progress indicator + cancel test'
  let update = updater(name)

  // No message
  let result = update.start()
  setTimeout(() => {
    update.cancel()
    let out = output
    out = out.split(name)
    reset()
    t.ok(result.includes(name), 'Returned correct name')
    t.equal(out.length, 3, 'Printed correct name, animated twice')
    t.pass(`Cancel ended indicator, or this test wouldn't have run`)
    console.log(`Result: ${result}`)
  }, timer)
})

test('Start + done test', t => {
  t.plan(5)
  reset()
  let name = 'Progress indicator + done test'
  let update = updater(name)

  // Message
  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    update.done()
    let out = output
    out = out.split(name)
    reset()
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.equal(out.length, 4, 'Printed correct name, animated twice')
    t.ok(out.join('').includes(chars.done), 'Done updated line with done status')
    t.pass(`Done ended indicator, or this test wouldn't have run`)
    console.log(`Result: ${result}`)
    reset()
  }, timer)
})

test('Start + done with updated name test', t => {
  t.plan(7)
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
    out = out.split(name)
    reset()
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(done.includes(newName), 'Returned correct updated name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.ok(done.includes(newMsg), 'Returned correct updated msg')
    t.equal(out.length, 3, 'Printed correct updated name, animated twice')
    out = out.join('')
    t.ok(out.includes(chars.done) && out.includes(newName) && out.includes(newMsg), 'Done updated line with update done status (both name and message)')
    t.pass(`Done ended indicator, or this test wouldn't have run`)
    console.log(`Result: ${result}`)
    t.end()
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
    reset()
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.equal(out.length, 2, 'Did not animate')
    t.notOk(out.join('').includes(lib.spinner.frames[1]), 'Really did not animate')
    t.pass(`In CI mode, process wouldn't hang endlessly if cancel or done aren't run`) // As evidenced by this test having run without done or cancel
    console.log(`Result: ${result}`)
    delete process.env.CI
  }, timer)
})

test('Error test', t => {
  t.plan(8)
  reset()
  let name = 'Error update test'
  let update = updater(name)

  // An error message
  let e = 'an error'
  let result = update.error(e)
  let out = output
  reset()
  t.ok(tidy(out).includes(result), 'Output and return are equal (except cursor restore escape chars)')
  t.ok(result.includes(chars.err) && result.includes('Error:'), 'Returned / printed error name')
  t.notOk(result.includes(name), 'Did not return / print updater name')
  t.ok(result.includes(e), 'Returned / printed correct error')
  console.log(`Result: ${result}\nOutput: ${out}`)
  reset()

  // An actual error
  let errMsg = 'a real error'
  let error = Error(errMsg)
  result = update.error(error)
  out = output
  reset()
  t.equal(tidy(out), result, 'Output and return are equal')
  t.ok(result.includes(chars.err) && result.includes('Error:'), 'Returned / printed error name')
  t.notOk(result.includes(name), 'Did not return / print updater name')
  t.ok(result.includes(errMsg), 'Returned / printed correct error message')
  console.log(`Result: ${result}\nOutput: ${out}`)
})

test('Start + error test', t => {
  t.plan(7)
  reset()
  let name = 'Progress indicator + error'
  let update = updater(name)

  // Start then error
  let msg = `Let's indicate some progress!`
  let result = update.start(msg)
  setTimeout(() => {
    let e = 'an error occurred'
    let err = update.error(e)
    let out = output
    out = out.split(name)
    reset()
    t.ok(result.includes(name), 'Returned correct name')
    t.ok(result.includes(msg), 'Returned correct msg')
    t.equal(out.length, 3, 'Printed correct name, animated twice')
    t.ok(err.includes(chars.err) && err.includes('Error:'), 'Returned / printed error name')
    t.notOk(err.includes(name), 'Did not return / print updater name')
    t.ok(err.includes(e), 'Returned / printed correct error message')
    t.pass(`Error ended indicator, or this test wouldn't have run`)
    console.log(`Result: ${result}\nOutput: ${out}`)
  }, timer)
})
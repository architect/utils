let test = require('tape')

test('Set up env', t => {
  t.plan(4)
  // TODO ↓ remove me! ↓
  console.log(`process.env`, JSON.stringify(process.env,null,2))
  console.log(`process.env.CI`, process.env.CI)
  console.log(`!process.stdout.isTTY`, !process.stdout.isTTY)
  console.log(`process.env.APPVEYOR`, process.env.APPVEYOR)
  process.env.CI = false
  console.log(`process.env.CI after false`, process.env.CI)
  let isCI = process.env.CI || !process.stdout.isTTY
  if (process.env.APPVEYOR && process.stdout.isTTY)
    process.env.CI = false
  if (isCI)
    t.fail('Cannot run tests: process.env.CI || !process.stdout.isTTY')
  else
    t.ok('Env is not CI or !TTY')
})

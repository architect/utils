let test = require('tape')
let credCheck = require('../../banner/cred-check')

function reset (t) {
  let envVars = [
    'ARC_AWS_CREDS',
    'AWS_PROFILE',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SESSION_TOKEN',
    'AWS_SHARED_CREDENTIALS_FILE',
  ]
  envVars.forEach(v => delete process.env[v])
  envVars.forEach(v => {
    if (process.env[v]) t.fail(`Found errant env var: ${v}`)
  })
}

let inventory = { inv: { aws: {} } }

test('Set up env', t => {
  t.plan(1)
  t.ok(credCheck, 'Found credCheck')
})

test('Credential check is disabled', t => {
  t.plan(2)
  let err = credCheck({ checkCreds: false, inventory })
  t.notOk(err, 'No credential loading error reported')
  t.notOk(process.env.ARC_AWS_CREDS, 'Did not mutate ARC_AWS_CREDS')
  reset(t)
})

test('Credential checks', t => {
  t.plan(3)
  let err

  // Count on aws-lite finding creds (via env)
  process.env.AWS_ACCESS_KEY_ID = 'yo'
  process.env.AWS_SECRET_ACCESS_KEY = 'yo'
  err = credCheck({ inventory })
  t.notOk(err, 'No credential loading error reported')
  t.notOk(process.env.ARC_AWS_CREDS, 'Did not mutate ARC_AWS_CREDS')

  // Fail a cred check
  reset(t)
  process.env.AWS_PROFILE = 'random_profile_name_that_does_not_exist'
  err = credCheck({ inventory, needsValidCreds: true })
  t.ok(err, 'Reported credential loading error')
  console.log(err)
  reset(t)
})

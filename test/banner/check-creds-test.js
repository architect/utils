let test = require('tape')
let checkCreds = require('../../check-creds')

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
  t.ok(checkCreds, 'Found checkCreds')
})

test('Credential checks (async)', async t => {
  t.plan(2)

  // Count on aws-lite finding creds (via env)
  process.env.AWS_ACCESS_KEY_ID = 'yo'
  process.env.AWS_SECRET_ACCESS_KEY = 'yo'
  try {
    await checkCreds({ inventory })
    t.pass('No credential loading error reported')
  }
  catch (err) {
    t.fail(err)
  }

  // Fail a cred check
  reset(t)
  process.env.AWS_PROFILE = 'random_profile_name_that_does_not_exist'
  try {
    await checkCreds({ inventory })
    t.fail('Should have errored')
  }
  catch (err) {
    t.ok(err, 'Reported credential loading error')
  }
  reset(t)
})

test('Credential checks (callback, via env)', t => {
  t.plan(1)

  // Count on aws-lite finding creds (via env)
  process.env.AWS_ACCESS_KEY_ID = 'yo'
  process.env.AWS_SECRET_ACCESS_KEY = 'yo'
  checkCreds({ inventory }, err => {
    reset(t)
    if (err) t.fail(err)
    else t.pass('No credential loading error reported')
  })
})

test('Credential checks (callback failure, via profile)', t => {
  t.plan(1)
  // Fail a cred check
  reset(t)
  process.env.AWS_PROFILE = 'random_profile_name_that_does_not_exist'
  checkCreds({ inventory }, err => {
    reset(t)
    if (err) t.ok(err, 'Reported credential loading error')
    else t.fail('Should have errored')
  })
})

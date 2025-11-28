const { test } = require('node:test')
const assert = require('node:assert')
const checkCreds = require('../../check-creds')

function reset () {
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
    if (process.env[v]) assert.fail(`Found errant env var: ${v}`)
  })
}

let inventory = { inv: { aws: {} } }

test('Set up env', () => {
  assert.ok(checkCreds, 'Found checkCreds')
})

test('Credential checks (async)', async () => {
  // Count on aws-lite finding creds (via env)
  process.env.AWS_ACCESS_KEY_ID = 'yo'
  process.env.AWS_SECRET_ACCESS_KEY = 'yo'
  try {
    await checkCreds({ inventory })
    assert.ok(true, 'No credential loading error reported')
  }
  catch (err) {
    assert.fail(err)
  }

  // Fail a cred check
  reset()
  process.env.AWS_PROFILE = 'random_profile_name_that_does_not_exist'
  try {
    await checkCreds({ inventory })
    assert.fail('Should have errored')
  }
  catch (err) {
    assert.ok(err, 'Reported credential loading error')
  }
  reset()
})

test('Credential checks (callback, via env)', (t, done) => {
  // Count on aws-lite finding creds (via env)
  process.env.AWS_ACCESS_KEY_ID = 'yo'
  process.env.AWS_SECRET_ACCESS_KEY = 'yo'
  checkCreds({ inventory }, err => {
    reset()
    if (err) assert.fail(err)
    else assert.ok(true, 'No credential loading error reported')
    done()
  })
})

test('Credential checks (callback failure, via profile)', (t, done) => {
  // Fail a cred check
  reset()
  process.env.AWS_PROFILE = 'random_profile_name_that_does_not_exist'
  checkCreds({ inventory }, err => {
    reset()
    if (err) assert.ok(err, 'Reported credential loading error')
    else assert.fail('Should have errored')
    done()
  })
})

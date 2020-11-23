let test = require('tape')
let aws = require('aws-sdk')
let tmpFile = require('temp-write')
let mockCredsContent = require('./mock-aws-creds-file')
let _inventory = require('@architect/inventory')
let mockCredsFile = tmpFile(mockCredsContent)
let credsExists = true
let fs = {
  existsSync: function () {
    return credsExists
  }
}
let profile = 'architect'
let secret = 'so-secret'
let sessionToken = 'a-random-token'
let proxyquire = require('proxyquire').noCallThru()
let initAWS = proxyquire('../../banner/init-aws', {
  'fs': fs,
  '@noCallThru': true
})

function reset (t) {
  let envVars = [
    'ARC_AWS_CREDS',
    'AWS_PROFILE',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SESSION_TOKEN',
    'AWS_SHARED_CREDENTIALS_FILE'
  ]
  envVars.forEach(v => {delete process.env[v]})
  envVars.forEach(v => {
    if (process.env[v]) t.fail(`Found errant env var: ${v}`)
  })
  aws.config = { credentials: null }
}

/**
 * AWS credential initialization tests are focused on our credential population
 * These aren't intended to be integration tests for aws-sdk credentials methods (`SharedIniFileCredentials` + `Credentials`, etc.)
 */
test('Set region', async t => {
  reset(t)
  t.plan(2)
  let region = 'us-west-1'
  let rawArc = `@app\nappname\n@aws\nregion ${region}`
  let inventory = await _inventory({ rawArc })
  initAWS({ inventory })
  t.equal(process.env.AWS_REGION, region, `AWS region set by .arc`)
  // Leave AWS_REGION env var set for next test

  rawArc = `@app\nappname`
  inventory = await _inventory({ rawArc })
  initAWS({ inventory })
  t.equal(process.env.AWS_REGION, region, `AWS region set by env`)
  reset(t)
})

test('Credentials supplied by ~/.aws/credentials', async t => {
  t.plan(12)
  let rawArc
  let inventory

  // Profile found, no env override
  // Profile specified by .arc
  process.env.AWS_SHARED_CREDENTIALS_FILE = await mockCredsFile
  rawArc = `@app\nappname\n@aws\nprofile ${profile}`
  inventory = await _inventory({ rawArc })

  initAWS({ inventory })
  t.equal(process.env.ARC_AWS_CREDS, 'profile', `ARC_AWS_CREDS set to 'profile'`)
  t.equal(process.env.AWS_PROFILE, profile, `AWS_PROFILE set by .arc`)
  t.equal(aws.config.credentials.accessKeyId, 'architect_mock_access_key', `AWS config not mutated`)
  reset(t)

  // Profile specified by env
  process.env.AWS_SHARED_CREDENTIALS_FILE = await mockCredsFile
  process.env.AWS_PROFILE = profile
  rawArc = `@app\nappname`
  inventory = await _inventory({ rawArc })

  initAWS({ inventory })
  t.equal(process.env.ARC_AWS_CREDS, 'profile', `ARC_AWS_CREDS set to 'profile'`)
  t.equal(process.env.AWS_PROFILE, profile, `AWS_PROFILE set by env`)
  t.equal(aws.config.credentials.accessKeyId, 'architect_mock_access_key', `AWS config not mutated`)
  reset(t)

  // Process Credential Respected
  process.env.AWS_SHARED_CREDENTIALS_FILE = await mockCredsFile
  process.env.AWS_PROFILE = 'architect_process'

  initAWS({ inventory })
  t.equal(process.env.ARC_AWS_CREDS, 'profile', `ARC_AWS_CREDS set to 'profile'`)
  t.equal(process.env.AWS_PROFILE, 'architect_process', `AWS_PROFILE set by env`)
  console.log(aws.config.credentials)
  t.notOk(aws.config.credentials.accessKeyId, `AWS access key not set via processCred`)
  reset(t)

  // Profile defaulted
  process.env.AWS_SHARED_CREDENTIALS_FILE = await mockCredsFile

  initAWS({ inventory })
  t.equal(process.env.ARC_AWS_CREDS, 'profile', `ARC_AWS_CREDS set to 'profile'`)
  t.equal(process.env.AWS_PROFILE, 'default', `AWS_PROFILE set to default`)
  t.equal(aws.config.credentials.accessKeyId, 'default_mock_access_key', `AWS config not mutated`)
  reset(t)
})

test('Credentials supplied by env vars', async t => {
  t.plan(10)

  // Credentials file found, env override
  process.env.ARC_AWS_CREDS = 'env'
  process.env.AWS_ACCESS_KEY_ID = profile
  process.env.AWS_SECRET_ACCESS_KEY = 'so-secret'
  let rawArc = `@app\nappname\n@aws\nprofile ${profile}`
  let inventory = await _inventory({ rawArc })
  initAWS({ inventory })
  t.equal(process.env.ARC_AWS_CREDS, 'env', `ARC_AWS_CREDS set to 'env'`)
  t.notOk(process.env.AWS_PROFILE, `AWS_PROFILE not set`)
  t.equal(aws.config.credentials.accessKeyId, profile, `AWS config access key set`)
  t.equal(aws.config.credentials.secretAccessKey, secret, `AWS config secret key set`)
  t.notOk(aws.config.credentials.sessionToken, `AWS config sessionToken not set`)
  reset(t)

  process.env.ARC_AWS_CREDS = 'env'
  process.env.AWS_ACCESS_KEY_ID = profile
  process.env.AWS_SECRET_ACCESS_KEY = 'so-secret'
  process.env.AWS_SESSION_TOKEN = sessionToken
  initAWS({ inventory })
  t.equal(process.env.ARC_AWS_CREDS, 'env', `ARC_AWS_CREDS set to 'env'`)
  t.notOk(process.env.AWS_PROFILE, `AWS_PROFILE not set`)
  t.equal(aws.config.credentials.accessKeyId, profile, `AWS config access key set`)
  t.equal(aws.config.credentials.secretAccessKey, secret, `AWS config secret key set`)
  t.equal(aws.config.credentials.sessionToken, sessionToken, `AWS config sessionToken set`)
  reset(t)
})

test('Final credential check', async t => {
  t.plan(9)
  process.env.HIDE_HOME = true
  process.env.AWS_SHARED_CREDENTIALS_FILE = await tmpFile('')
  let rawArc = `@app\nappname\n@aws\nprofile does-not-exist`
  let inventory = await _inventory({ rawArc })
  initAWS({ inventory })
  t.equal(process.env.ARC_AWS_CREDS, 'missing', `ARC_AWS_CREDS set to 'missing'`)
  t.notOk(process.env.AWS_PROFILE, `AWS_PROFILE deleted`)
  t.notOk(Object.keys(aws.config.credentials).length, `AWS config not present`)
  reset(t)

  process.env.AWS_SHARED_CREDENTIALS_FILE = await tmpFile('')
  initAWS({ inventory, needsValidCreds: false })
  t.equal(process.env.ARC_AWS_CREDS, 'dummy', `ARC_AWS_CREDS set to 'dummy'`)
  t.equal(process.env.AWS_ACCESS_KEY_ID, 'xxx', `AWS_ACCESS_KEY_ID backfilled`)
  t.equal(process.env.AWS_SECRET_ACCESS_KEY, 'xxx', `AWS_SECRET_ACCESS_KEY backfilled`)
  t.notOk(process.env.AWS_PROFILE, `AWS_PROFILE deleted`)
  t.equal(aws.config.credentials.accessKeyId, 'xxx', `AWS config.credentials.accessKeyId backfilled to 'xxx'`)
  t.equal(aws.config.credentials.secretAccessKey, 'xxx', `AWS config.credentials.secretAccessKey backfilled to 'xxx'`)
  reset(t)
})

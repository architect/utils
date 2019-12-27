let test = require('tape')
let credsExists = true
let fs = {
  existsSync: function () {
    return credsExists
  }
}
let profile = 'architect'
let secret = 'so-secret'
let sessionToken = 'a-random-token'
let foundProfile = true
let aws = {
  config: {credentials: null},
  Credentials: function (params) {
    this.accessKeyId = params.accessKeyId
    this.secretAccessKey = params.secretAccessKey
    this.sessionToken = params.sessionToken || null
  },
  SharedIniFileCredentials: function () {
    if (foundProfile) {
      this.accessKeyId = profile
    }
  }
}
let proxyquire = require('proxyquire').noCallThru()
let initAWS = proxyquire('../../banner/init-aws', {
  'fs': fs,
  'aws-sdk': aws,
  '@noCallThru': true
})

function reset(t) {
  let envVars = [
    'ARC_AWS_CREDS',
    'AWS_PROFILE',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SESSION_TOKEN',
  ]
  envVars.forEach(v => {delete process.env[v]})
  envVars.forEach(v => {
    if (process.env[v]) t.fail(`Found errant env var: ${v}`)
  })
  aws.config = {credentials: null}
}

/**
 * AWS credential initialization tests are focused on our credential population
 * These aren't intended to be integration tests for aws-sdk credentials methods (`SharedIniFileCredentials` + `Credentials`, etc.)
 */
test('Set region', t => {
  reset(t)
  t.plan(2)
  let region = 'us-west-1'
  let arc = {
    aws: [
      ['region', region]
    ]
  }
  initAWS({arc})
  t.equal(process.env.AWS_REGION, region, `AWS region set by .arc`)
  // Leave AWS_REGION env var set for next test
  arc = {}
  initAWS({arc})
  t.equal(process.env.AWS_REGION, region, `AWS region set by env`)
  reset(t)
})

test('Credentials supplied by ~/.aws/credentials', t => {
  t.plan(9)
  let arc = {
    aws: [
      ['profile', profile]
    ]
  }
  // Profile found, no env override
  // Profile specified by .arc
  initAWS({arc})
  t.equal(process.env.ARC_AWS_CREDS, 'profile', `ARC_AWS_CREDS set to 'profile'`)
  t.equal(process.env.AWS_PROFILE, profile, `AWS_PROFILE set by .arc`)
  t.equal(aws.config.credentials.accessKeyId, profile, `AWS config not mutated`)
  reset(t)

  // Profile specified by env
  arc = {}
  process.env.AWS_PROFILE = profile
  initAWS({arc})
  t.equal(process.env.ARC_AWS_CREDS, 'profile', `ARC_AWS_CREDS set to 'profile'`)
  t.equal(process.env.AWS_PROFILE, profile, `AWS_PROFILE set by env`)
  t.equal(aws.config.credentials.accessKeyId, profile, `AWS config not mutated`)
  reset(t)

  // Profile defaulted
  initAWS({arc})
  t.equal(process.env.ARC_AWS_CREDS, 'profile', `ARC_AWS_CREDS set to 'profile'`)
  t.equal(process.env.AWS_PROFILE, 'default', `AWS_PROFILE set to default`)
  t.equal(aws.config.credentials.accessKeyId, profile, `AWS config not mutated`)
  reset(t)
})

test('Credentials supplied by env vars', t => {
  t.plan(10)
  let arc = {
    aws: [
      ['profile', profile]
    ]
  }
  // Credentials file found, env override
  process.env.ARC_AWS_CREDS = 'env'
  process.env.AWS_ACCESS_KEY_ID = profile
  process.env.AWS_SECRET_ACCESS_KEY = 'so-secret'
  initAWS({arc})
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
  initAWS({arc})
  t.equal(process.env.ARC_AWS_CREDS, 'env', `ARC_AWS_CREDS set to 'env'`)
  t.notOk(process.env.AWS_PROFILE, `AWS_PROFILE not set`)
  t.equal(aws.config.credentials.accessKeyId, profile, `AWS config access key set`)
  t.equal(aws.config.credentials.secretAccessKey, secret, `AWS config secret key set`)
  t.equal(aws.config.credentials.sessionToken, sessionToken, `AWS config sessionToken set`)
  reset(t)
})

test('Final credential check', t => {
  t.plan(7)
  let arc = {
    aws: [
      ['profile', profile]
    ]
  }
  // Profile not found (no aws.config.credentials populated)
  foundProfile = false
  let needsValidCreds = true
  initAWS({arc, needsValidCreds})
  t.equal(process.env.ARC_AWS_CREDS, 'missing', `ARC_AWS_CREDS set to 'missing'`)
  t.notOk(process.env.AWS_PROFILE, `AWS_PROFILE deleted`)
  t.notOk(Object.keys(aws.config.credentials).length, `AWS config not present`)
  reset(t)

  needsValidCreds = false
  initAWS({arc, needsValidCreds})
  t.equal(process.env.ARC_AWS_CREDS, 'dummy', `ARC_AWS_CREDS set to 'dummy'`)
  t.notOk(process.env.AWS_PROFILE, `AWS_PROFILE deleted`)
  t.equal(aws.config.credentials.accessKeyId, 'xxx', `AWS config.credentials.accessKeyId backfilled to 'xxx'`)
  t.equal(aws.config.credentials.secretAccessKey, 'xxx', `AWS config.credentials.secretAccessKey backfilled to 'xxx'`)
  reset(t)
})

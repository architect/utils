let test = require('tape')
let fingerprintConfig = require('../../fingerprint/config')

test('Module is present', t => {
  t.plan(1)
  t.ok(fingerprintConfig, 'Fingerprint config module is present')
})

test('Fingerprint and ignore are not configured', t => {
  t.plan(2)
  // Defaults
  let arc = {}
  let result = fingerprintConfig(arc)
  t.equal(result.fingerprint, false, 'Fingerprinting is disabled')
  t.equal(result.ignore.length, 0, 'Ignore array empty')
})

test('Invalid config', t => {
  t.plan(1)
  let arc = { static: [ 'fingerprint', 'yas' ] }
  let result = fingerprintConfig(arc)
  t.equal(result.fingerprint, false, 'Fingerprinting is still disabled')
})


test('Fingerprint is configured', t => {
  t.plan(3)
  let arc = { static: [
    [ 'fingerprint', true ],
  ] }
  let result = fingerprintConfig(arc)
  t.ok(result.fingerprint, 'Fingerprinting is enabled')

  arc = { static: [
    [ 'fingerprint', 'external' ],
  ] }
  result = fingerprintConfig(arc)
  t.ok(result.fingerprint, 'Fingerprinting is enabled')
  t.equal(result.fingerprint, 'external', 'Fingerprint set to external')
})

/**
 * Ignore tests, emulates:
 * @static
 * ignore
 *   foo
 *   bar
 */
test('Ignore is configured', t => {
  t.plan(3)
  let arc = { static: [
    { ignore: [ 'foo', 'bar' ] }
  ] }
  let result = fingerprintConfig(arc)
  t.equal(result.ignore.length, 2, 'Ignore array returned')
  t.equal(result.ignore[0], 'foo', `Ignore item is correct: ${result.ignore[0]}`)
  t.equal(result.ignore[1], 'bar', `Ignore item is correct: ${result.ignore[1]}`)
})

test('Ignore is configured (deprecated mode)', t => {
  t.plan(3)
  process.env.DEPRECATED = 'true'
  let arc = { static: [
    { ignore: { foo: false, bar: false } }
  ] }
  let result = fingerprintConfig(arc)
  t.equal(result.ignore.length, 2, 'Ignore array returned (deprecated)')
  t.equal(result.ignore[0], 'foo', `Ignore item is correct (deprecated): ${result.ignore[0]}`)
  t.equal(result.ignore[1], 'bar', `Ignore item is correct (deprecated): ${result.ignore[1]}`)
  delete process.env.DEPRECATED
})

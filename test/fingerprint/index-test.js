// let aws = require('aws-sdk')
let fs = require('fs')
let path = require('path')
let proxyquire = require('proxyquire')
let sha = require('sha')
let sinon = require('sinon')
let test = require('tape')

let globStub = sinon.stub().callsFake((path, options, callback) => callback(null, []))
let arcObject = {}
let readArcStub = {
  readArc: sinon.stub().callsFake(() => {
    let mockArc = {arc: arcObject}
    return mockArc
  })
}
let shaStub = sinon.stub(sha, 'get').callsFake((file, callback) => callback(null, 'df330f3f12')) // Fake hash
let fingerprint = proxyquire('../../fingerprint', {
  'glob': globStub,
  '@architect/parser': readArcStub
})
let fingerprintConfig = require('../../fingerprint').config

let params = {
  fingerprint: true,
  ignore: [],
}

// glob returns paths always delimited with '/', which messes us up on windows
// so use this function when stubbing e.g. glob
function normalizePath(path) { return path.replace(/\\/g, '/') }

test('fingerprint respects folder setting', t=> {
  // t.plan(6)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(path.join(process.cwd(), 'foo', 'index.html')),
    normalizePath(path.join(process.cwd(), 'foo', 'readme.md')), // this should get ignored
    normalizePath(path.join(process.cwd(), 'foo', 'css', 'styles.css')),
  ]))
  // Static manifest
  let manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  arcObject = {
    static: [['folder', 'foo']]
  }
  fingerprint(params, (err, result) => {
    if (err) t.fail(err)
    manifest = JSON.parse(manifest)
    console.log('Generated manifest:')
    console.log(manifest)

    t.ok(shaStub.calledTwice, 'Correct number of files hashed')
    t.equals(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
    t.equals(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
    t.equals(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
    t.equals(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
    t.ok(fsStub.called, 'static.json manifest written')

    // Reset env for next test
    fs.writeFile.restore()
    shaStub.resetHistory()
    arcObject = {}
    t.end()
  })
})

test('fingerprint generates static.json manifest', t=> {
  t.plan(6)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(path.join(process.cwd(), 'public', 'index.html')),
    normalizePath(path.join(process.cwd(), 'public', 'readme.md')), // this should get ignored
    normalizePath(path.join(process.cwd(), 'public', 'css', 'styles.css')),
  ]))
  // Static manifest
  let manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  fingerprint(params, (err, result) => {
    if (err) t.fail(err)
    manifest = JSON.parse(manifest)
    console.log('Generated manifest:')
    console.log(manifest)

    t.ok(shaStub.calledTwice, 'Correct number of files hashed')
    t.equals(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
    t.equals(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
    t.equals(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
    t.equals(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
    t.ok(fsStub.called, 'static.json manifest written')

    // Reset env for next test
    fs.writeFile.restore()
    shaStub.resetHistory()
  })
})

test('fingerprint ignores specified static assets', t=> {
  t.plan(4)
  params.ignore.push('styles.css')
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(path.join(process.cwd(), 'public', 'index.html')),
    normalizePath(path.join(process.cwd(), 'public', 'readme.md')),
    normalizePath(path.join(process.cwd(), 'public', 'styles.css')),
  ]))
  // Static manifest
  let manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  fingerprint(params, (err, result) => {
    if (err) t.fail(err)
    manifest = JSON.parse(manifest)
    console.log('Generated manifest:')
    console.log(manifest)

    t.ok(shaStub.calledOnce, 'Correct number of files hashed')
    t.equals(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly')
    t.equals(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly')
    t.ok(fsStub.called, 'static.json manifest written')

    // Reset env for next test
    fs.writeFile.restore()
    shaStub.resetHistory()
  })
})

test('fingerprint cancels early if disabled', t=> {
  t.plan(2)
  params.fingerprint = false
  fingerprint(params, (err, result) => {
    if (err) t.fail(err)

    t.ok(shaStub.notCalled, 'Correct number of files hashed (none)')
    t.notOk(result, 'Returned no result')

    // Reset env for next test
    shaStub.resetHistory()
  })
})

test('fingerprint config subutil', t => {
  t.plan(7)
  let arc1 = {}
  let result1 = fingerprintConfig(arc1)
  t.equals(result1.fingerprint, false, 'Fingerprinting disabled')
  t.equals(result1.ignore.length, 0, 'Ignore array empty')

  let arc2 = {static:['fingerprint', 'yas']} // Invalid config
  let result2 = fingerprintConfig(arc2)
  t.equals(result2.fingerprint, false, 'Fingerprinting still disabled')

  /**
   * Emulates:
   * @static
   * fingerprint true
   * ignore
   *   foo
   *   bar
   */
  let arc3 = {static: [
    ['fingerprint', true],
    {ignore: {foo:false, bar:false}}
  ]}
  let result3 = fingerprintConfig(arc3)
  t.ok(result3.fingerprint, 'Fingerprinting enabled')
  t.equals(result3.ignore.length, 2, 'Ignore array returned')
  t.equals(result3.ignore[0], 'foo', 'Ignore array[0] matches')
  t.equals(result3.ignore[1], 'bar', 'Ignore array[1] matches')
})

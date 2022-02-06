let fs = require('fs')
let { join } = require('path')
let proxyquire = require('proxyquire')
let sha = require('sha')
let sinon = require('sinon')
let test = require('tape')
let normalizePath = require('../../path-to-unix')
let _inventory = require('@architect/inventory')
let inventory

let globStub = sinon.stub().callsFake((path, options, callback) => callback(null, []))
let shaStub = sinon.stub(sha, 'get').callsFake((file, callback) => callback(null, 'df330f3f12')) // Fake hash
let fingerprint = proxyquire('../../fingerprint', {
  'glob': globStub
})

let params = () => ({
  inventory,
  fingerprint: true,
  // ignore: [],
})

function updateInventory (t, settings = '', callback) {
  inventory = undefined
  let rawArc = `@app\nfingerprinting\n@static\n${settings}`
  _inventory({ rawArc }, function (err, result) {
    if (err) t.fail(err)
    else {
      t.pass('Updated inventory')
      inventory = result
      callback()
    }
  })
}

function reset (t) {
  // Reset env for next test
  fs.writeFile.restore()
  shaStub.resetHistory()
  t.pass('Reset')
}

let cwd = process.cwd()
let mock = join(cwd, 'test', 'mock', 'fingerprint')

test('Set up env', t => {
  t.plan(2)
  t.ok(fingerprint, 'Fingerprint module is present')
  process.chdir(mock)
  t.equal(process.cwd(), mock, 'Switched to mock dir')
})

test('fingerprint respects folder setting', t => {
  t.plan(7)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(join(process.cwd(), 'foo', 'index.html')),
    normalizePath(join(process.cwd(), 'foo', 'readme.md')), // this should get ignored
    normalizePath(join(process.cwd(), 'foo', 'css', 'styles.css')),
  ]))
  // Static manifest
  let manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, 'folder foo', () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaStub.calledTwice, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      t.equal(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      t.equal(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      t.ok(fsStub.called, 'static.json manifest written')

      // Reset env for next test
      fs.writeFile.restore()
      shaStub.resetHistory()
    })
  })
})

test('fingerprint respects prefix setting (by doing nothing)', t => {
  // This test effectively does nothing, but it's here to ensure the presence of prefix does not influence how the static manifest is generated
  t.plan(7)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(join(process.cwd(), 'public', 'index.html')),
    normalizePath(join(process.cwd(), 'public', 'readme.md')), // this should get ignored
    normalizePath(join(process.cwd(), 'public', 'css', 'styles.css')),
  ]))
  // Static manifest
  let manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, 'prefix a-prefix', () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaStub.calledTwice, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      t.equal(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      t.equal(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      t.ok(fsStub.called, 'static.json manifest written')

      // Reset env for next test
      fs.writeFile.restore()
      shaStub.resetHistory()
    })
  })
})

test('fingerprint generates static.json manifest', t => {
  t.plan(7)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(join(process.cwd(), 'public', 'index.html')),
    normalizePath(join(process.cwd(), 'public', 'readme.md')), // this should get ignored
    normalizePath(join(process.cwd(), 'public', 'css', 'styles.css')),
  ]))
  // Static manifest
  let manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, null, () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaStub.calledTwice, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      t.equal(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      t.equal(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      t.ok(fsStub.called, 'static.json manifest written')

      // Reset env for next test
      fs.writeFile.restore()
      shaStub.resetHistory()
    })
  })
})

test('fingerprint does does not generate static.json when set to external', t => {
  t.plan(4)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(join(process.cwd(), 'public', 'index.html'))
  ]))
  // Static manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    callback()
  })
  updateInventory(t, 'fingerprint external', () => {
    let p = params()
    delete p.fingerprint
    fingerprint(p, (err, result) => {
      if (err) t.fail(err)
      t.notOk(result, 'Did not pass back manifest')
      t.ok(shaStub.notCalled, 'No files hashed')
      t.ok(fsStub.notCalled, 'static.json manifest not written')

      // Reset env for next test
      fs.writeFile.restore()
      shaStub.resetHistory()
    })
  })
})

test('fingerprint ignores specified static assets', t => {
  t.plan(6)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(join(process.cwd(), 'public', 'index.html')),
    normalizePath(join(process.cwd(), 'public', 'readme.md')),
    normalizePath(join(process.cwd(), 'public', 'styles.css')),
  ]))
  // Static manifest
  let manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, 'ignore\n  styles.css', () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaStub.calledOnce, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly')
      t.ok(fsStub.called, 'static.json manifest written')
      reset(t)
    })
  })
})

test('fingerprint cancels early if disabled', t => {
  t.plan(3)
  updateInventory(t, 'fingerprint false', () => {
    let p = params()
    delete p.fingerprint
    fingerprint(p, (err, result) => {
      if (err) t.fail(err)

      t.ok(shaStub.notCalled, 'Correct number of files hashed (none)')
      t.notOk(result, 'Returned no result')

      // Reset env for next test
      shaStub.resetHistory()
    })
  })
})

test('Teardown', t => {
  t.plan(1)
  process.chdir(cwd)
  t.equal(process.cwd(), cwd, 'Reset cwd')
})

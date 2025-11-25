let fs = require('fs')
let { join } = require('path')
let proxyquire = require('proxyquire')
let sinon = require('sinon')
let test = require('tape')
let pathToUnix = require('../../path-to-unix')
let _inventory = require('@architect/inventory')
let inventory
let globStub = sinon.stub().callsFake(() => [])
let writeFileStub = sinon.stub().callsFake((dest, data, callback) => callback())
let shaGetStub = sinon.stub().callsFake((file, callback) => callback(null, 'df330f3f12')) // Fake hash
let fingerprint = proxyquire('../../fingerprint', {
  'fs': { ...fs, globSync: globStub, writeFile: writeFileStub, '@global': true },
  '../sha': { get: shaGetStub },
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
  // Reset stubs
  shaGetStub.resetHistory()
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake(() => [
    pathToUnix(join(process.cwd(), 'foo', 'index.html')),
    pathToUnix(join(process.cwd(), 'foo', 'readme.md')), // this should get ignored
    pathToUnix(join(process.cwd(), 'foo', 'css', 'styles.css')),
  ])
  // Static manifest
  let manifest
  writeFileStub.resetBehavior()
  writeFileStub.callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, 'folder foo', () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaGetStub.calledTwice, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      t.equal(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      t.equal(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      t.ok(writeFileStub.called, 'static.json manifest written')

    })
  })
})

test('fingerprint respects prefix setting (by doing nothing)', t => {
  // This test effectively does nothing, but it's here to ensure the presence of prefix does not influence how the static manifest is generated
  t.plan(7)
  // Reset stubs
  shaGetStub.resetHistory()
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake(() => [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
    pathToUnix(join(process.cwd(), 'public', 'readme.md')), // this should get ignored
    pathToUnix(join(process.cwd(), 'public', 'css', 'styles.css')),
  ])
  // Static manifest
  let manifest
  writeFileStub.resetBehavior()
  writeFileStub.callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, 'prefix a-prefix', () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaGetStub.calledTwice, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      t.equal(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      t.equal(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      t.ok(writeFileStub.called, 'static.json manifest written')

    })
  })
})

test('fingerprint generates static.json manifest', t => {
  shaGetStub.resetHistory()
  t.plan(7)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake(() => [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
    pathToUnix(join(process.cwd(), 'public', 'readme.md')), // this should get ignored
    pathToUnix(join(process.cwd(), 'public', 'css', 'styles.css')),
  ])
  // Static manifest
  let manifest
  writeFileStub.resetBehavior()
  writeFileStub.callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, null, () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaGetStub.calledTwice, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      t.equal(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      t.equal(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      t.ok(writeFileStub.called, 'static.json manifest written')

    })
  })
})

test('fingerprint does does not generate static.json when set to external', t => {
  shaGetStub.resetHistory()
  writeFileStub.resetHistory()
  t.plan(4)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake(() => [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
  ])
  updateInventory(t, 'fingerprint external', () => {
    let p = params()
    delete p.fingerprint
    fingerprint(p, (err, result) => {
      if (err) t.fail(err)
      t.notOk(result, 'Did not pass back manifest')
      t.ok(shaGetStub.notCalled, 'No files hashed')
      t.ok(writeFileStub.notCalled, 'static.json manifest not written')
    })
  })
})

test('fingerprint ignores specified static assets', t => {
  shaGetStub.resetHistory()
  t.plan(6)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake(() => [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
    pathToUnix(join(process.cwd(), 'public', 'readme.md')),
    pathToUnix(join(process.cwd(), 'public', 'styles.css')),
  ])
  // Static manifest
  let manifest
  writeFileStub.resetBehavior()
  writeFileStub.callsFake((dest, data, callback) => {
    manifest = data
    callback()
  })
  updateInventory(t, 'ignore\n  styles.css', () => {
    fingerprint(params(), (err, result) => {
      if (err) t.fail(err)
      manifest = JSON.parse(manifest)
      console.log('Generated manifest:')
      console.log(manifest)

      t.ok(shaGetStub.calledOnce, 'Correct number of files hashed')
      t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly')
      t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly')
      t.ok(writeFileStub.called, 'static.json manifest written')
      reset(t)
    })
  })
})

test('fingerprint cancels early if disabled', t => {
  shaGetStub.resetHistory()
  t.plan(3)
  updateInventory(t, 'fingerprint false', () => {
    let p = params()
    delete p.fingerprint
    fingerprint(p, (err, result) => {
      if (err) t.fail(err)

      t.ok(shaGetStub.notCalled, 'Correct number of files hashed (none)')
      t.notOk(result, 'Returned no result')
    })
  })
})

test('Teardown', t => {
  t.plan(1)
  process.chdir(cwd)
  t.equal(process.cwd(), cwd, 'Reset cwd')
})

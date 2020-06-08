let fs = require('fs')
let path = require('path')
let proxyquire = require('proxyquire')
let sha = require('sha')
let sinon = require('sinon')
let test = require('tape')
let normalizePath = require('../../path-to-unix')

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

let params = {
  fingerprint: true,
  ignore: [],
}

test('Module is present', t => {
  t.plan(2)
  t.ok(fingerprint, 'Fingerprint module is present')
  t.ok(fingerprint.config, 'Fingerprint module exports config')
})

test('fingerprint respects folder setting', t=> {
  t.plan(6)
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
    t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
    t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
    t.equal(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
    t.equal(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
    t.ok(fsStub.called, 'static.json manifest written')

    // Reset env for next test
    fs.writeFile.restore()
    shaStub.resetHistory()
    arcObject = {}
  })
})

test('fingerprint respects prefix setting (by doing nothing)', t=> {
  // This test effectively does nothing, but it's here to ensure the presence of prefix does not influence how the static manifest is generated
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
  arcObject = {
    static: [['prefix', 'a-prefix']]
  }
  fingerprint(params, (err, result) => {
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
    arcObject = {}
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

test('fingerprint does does not generate static.json when set to external', t=> {
  t.plan(3)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    normalizePath(path.join(process.cwd(), 'public', 'index.html'))
  ]))
  // Static manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {
    callback()
  })
  fingerprint({ fingerprint: 'external' }, (err, result) => {
    if (err) t.fail(err)
    t.notOk(result, 'Did not pass back manifest')
    t.ok(shaStub.notCalled, 'No files hashed')
    t.ok(fsStub.notCalled, 'static.json manifest not written')

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
    t.equal(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly')
    t.equal(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly')
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

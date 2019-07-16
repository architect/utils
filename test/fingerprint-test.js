// let aws = require('aws-sdk')
let fs = require('fs')
let path = require('path')
let proxyquire = require('proxyquire')
let sha = require('sha')
let sinon = require('sinon')
let test = require('tape')

let globStub = sinon.stub().callsFake((path, options, callback) => callback(null, []))
let readArcStub = sinon.stub().callsFake(() => {
  let mockArc = {
    arc: {}
    // static: [
    //   [ 'fingerprint', true]
    // ]
  }
  // TODO ↓ remove me! ↓
  console.log(`called stub`, mockArc)
  return mockArc
})
let shaStub = sinon.stub(sha, 'get').callsFake((file, callback) => callback(null, 'df330f3f12')) // Fake hash
let fingerprint = proxyquire('../fingerprint', {
  'glob': globStub,
  './read-arc': readArcStub
})

let params = {
  fingerprint: true,
  ignore: [],
}

test('fingerprint generates static.json manifest', t=> {
  t.plan(4)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    path.join(process.cwd(), 'public', 'index.html'),
    path.join(process.cwd(), 'public', 'readme.md'),
    path.join(process.cwd(), 'public', 'styles.css'),
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
    t.equals(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly')
    t.equals(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly')
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
    path.join(process.cwd(), 'public', 'index.html'),
    path.join(process.cwd(), 'public', 'readme.md'),
    path.join(process.cwd(), 'public', 'styles.css'),
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

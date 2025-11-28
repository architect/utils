const { test, mock } = require('node:test')
const assert = require('node:assert')
const { join } = require('path')
const pathToUnix = require('../../path-to-unix')
const _inventory = require('@architect/inventory')

let inventory
let cwd = process.cwd()
let mockDir = join(cwd, 'test', 'mock', 'fingerprint')

// Track mock state
let globResults = []
let writeFileCalls = []
let shaGetCalls = []
const shaHash = 'df330f3f12'

// Create a fresh fingerprint module loader with mocks
function loadFingerprintWithMocks () {
  // Clear module cache
  delete require.cache[require.resolve('../../fingerprint')]
  delete require.cache[require.resolve('fs')]

  // Mock fs module
  const fs = require('fs')

  mock.method(fs, 'globSync', () => globResults)
  mock.method(fs, 'writeFile', (dest, data, callback) => {
    writeFileCalls.push({ dest, data })
    callback()
  })
  mock.method(fs, 'statSync', () => ({ isFile: () => true }))

  // Mock sha module
  const sha = require('../../sha')
  mock.method(sha, 'get', (file, callback) => {
    shaGetCalls.push(file)
    callback(null, shaHash)
  })

  return require('../../fingerprint')
}

const fingerprint = loadFingerprintWithMocks()

let params = () => ({
  inventory,
  fingerprint: true,
})

async function updateInventory (settings = '') {
  inventory = undefined
  let rawArc = `@app\nfingerprinting\n@static\n${settings}`
  inventory = await _inventory({ rawArc })
  return inventory
}

function resetMocks () {
  writeFileCalls = []
  shaGetCalls = []
}

test('Set up env', () => {
  assert.ok(fingerprint, 'Fingerprint module is present')
  process.chdir(mockDir)
  assert.strictEqual(process.cwd(), mockDir, 'Switched to mock dir')
})

test('fingerprint respects folder setting', (t, done) => {
  resetMocks()
  globResults = [
    pathToUnix(join(process.cwd(), 'foo', 'index.html')),
    pathToUnix(join(process.cwd(), 'foo', 'readme.md')), // this should get ignored
    pathToUnix(join(process.cwd(), 'foo', 'css', 'styles.css')),
  ]

  updateInventory('folder foo').then(() => {
    fingerprint(params(), (err, result) => {
      if (err) assert.fail(err)

      const manifest = JSON.parse(writeFileCalls[0].data)
      console.log('Generated manifest:')
      console.log(manifest)

      assert.strictEqual(shaGetCalls.length, 2, 'Correct number of files hashed')
      assert.strictEqual(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      assert.strictEqual(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      assert.strictEqual(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      assert.strictEqual(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      assert.ok(writeFileCalls.length > 0, 'static.json manifest written')
      done()
    })
  })
})

test('fingerprint respects prefix setting (by doing nothing)', (t, done) => {
  resetMocks()
  globResults = [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
    pathToUnix(join(process.cwd(), 'public', 'readme.md')), // this should get ignored
    pathToUnix(join(process.cwd(), 'public', 'css', 'styles.css')),
  ]

  updateInventory('prefix a-prefix').then(() => {
    fingerprint(params(), (err, result) => {
      if (err) assert.fail(err)

      const manifest = JSON.parse(writeFileCalls[0].data)
      console.log('Generated manifest:')
      console.log(manifest)

      assert.strictEqual(shaGetCalls.length, 2, 'Correct number of files hashed')
      assert.strictEqual(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      assert.strictEqual(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      assert.strictEqual(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      assert.strictEqual(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      assert.ok(writeFileCalls.length > 0, 'static.json manifest written')
      done()
    })
  })
})

test('fingerprint generates static.json manifest', (t, done) => {
  resetMocks()
  globResults = [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
    pathToUnix(join(process.cwd(), 'public', 'readme.md')), // this should get ignored
    pathToUnix(join(process.cwd(), 'public', 'css', 'styles.css')),
  ]

  updateInventory(null).then(() => {
    fingerprint(params(), (err, result) => {
      if (err) assert.fail(err)

      const manifest = JSON.parse(writeFileCalls[0].data)
      console.log('Generated manifest:')
      console.log(manifest)

      assert.strictEqual(shaGetCalls.length, 2, 'Correct number of files hashed')
      assert.strictEqual(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly for index.html')
      assert.strictEqual(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly for index.html')
      assert.strictEqual(manifest['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data parsed correctly for css/styles.css')
      assert.strictEqual(result['css/styles.css'], 'css/styles-df330f3f12.css', 'Manifest data returned correctly for css/styles.css')
      assert.ok(writeFileCalls.length > 0, 'static.json manifest written')
      done()
    })
  })
})

test('fingerprint does does not generate static.json when set to external', (t, done) => {
  resetMocks()
  globResults = [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
  ]

  updateInventory('fingerprint external').then(() => {
    let p = params()
    delete p.fingerprint
    fingerprint(p, (err, result) => {
      if (err) assert.fail(err)
      assert.ok(!result, 'Did not pass back manifest')
      assert.strictEqual(shaGetCalls.length, 0, 'No files hashed')
      assert.strictEqual(writeFileCalls.length, 0, 'static.json manifest not written')
      done()
    })
  })
})

test('fingerprint ignores specified static assets', (t, done) => {
  resetMocks()
  globResults = [
    pathToUnix(join(process.cwd(), 'public', 'index.html')),
    pathToUnix(join(process.cwd(), 'public', 'readme.md')),
    pathToUnix(join(process.cwd(), 'public', 'styles.css')),
  ]

  updateInventory('ignore\n  styles.css').then(() => {
    fingerprint(params(), (err, result) => {
      if (err) assert.fail(err)

      const manifest = JSON.parse(writeFileCalls[0].data)
      console.log('Generated manifest:')
      console.log(manifest)

      assert.strictEqual(shaGetCalls.length, 1, 'Correct number of files hashed')
      assert.strictEqual(manifest['index.html'], 'index-df330f3f12.html', 'Manifest data parsed correctly')
      assert.strictEqual(result['index.html'], 'index-df330f3f12.html', 'Manifest data returned correctly')
      assert.ok(writeFileCalls.length > 0, 'static.json manifest written')
      done()
    })
  })
})

test('fingerprint cancels early if disabled', (t, done) => {
  resetMocks()

  updateInventory('fingerprint false').then(() => {
    let p = params()
    delete p.fingerprint
    fingerprint(p, (err, result) => {
      if (err) assert.fail(err)
      assert.strictEqual(shaGetCalls.length, 0, 'Correct number of files hashed (none)')
      assert.ok(!result, 'Returned no result')
      done()
    })
  })
})

test('Teardown', () => {
  process.chdir(cwd)
  assert.strictEqual(process.cwd(), cwd, 'Reset cwd')
})

const { test } = require('node:test')
const assert = require('node:assert')
const sort = require('../../path-sort')

test('pathSort', () => {
  let paths = [
    'src/http/get-index/index.js',
    'src/http/get-index/package.json',
    'src/http/get-api-foo/index.js',
    'src/http/get-api-foo/package.json',
  ]
  let sorted = sort(paths)
  let expected = [
    'src/http/get-api-foo/index.js',
    'src/http/get-api-foo/package.json',
    'src/http/get-index/index.js',
    'src/http/get-index/package.json',
  ]
  assert.deepStrictEqual(sorted, expected, 'should be deeply equivalent')
})

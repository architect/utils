const { test } = require('node:test')
const assert = require('node:assert')
const pathToUnix = require('../../path-to-unix')

test('path-to-unix returns / seperated paths on Windows', () => {
  assert.strictEqual(pathToUnix('C:\\Users\\user'), 'C:/Users/user', 'pathToUnix returns / seperated paths on Windows')
})

test('path-to-unix returns / seperated paths on Unix', () => {
  assert.strictEqual(pathToUnix('/home/user'), '/home/user', 'pathToUnix returns / seperated paths on Unix')
})

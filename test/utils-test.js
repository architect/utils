const { test } = require('node:test')
const assert = require('node:assert')
const utils = require('../')

test('Test ensuring utils (and any deps) are present and accounted for', () => {
  let all = Object.getOwnPropertyNames(utils)
  all.forEach(util => {
    assert.ok(utils[util], `${util} is present`)
  })
})

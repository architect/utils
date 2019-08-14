let utils = require('../')
let test = require('tape')

test('Test ensuring utils (and any deps) are present and accounted for', t => {
  let all = Object.getOwnPropertyNames(utils)
  t.plan(all.length)
  all.forEach(util => {
    t.ok(utils[util], `${util} is present`)
  })
})

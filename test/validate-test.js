let test = require('tape')
let validate = require('../validate')
let fs = require('fs')
let path = require('path')
let raw = fs.readFileSync(path.join(__dirname, 'mock', '.arc')).toString()
let parser = require('@architect/parser')
let arc = parser(raw)

test('validate returns arc file passed in if validation passes', t => {
  t.plan(1)
  validate(arc, raw, (e, returned_arc) => {
    t.deepEquals(returned_arc, arc, 'arc object passed in is returned')
  })
})

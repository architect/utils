let test = require('tape')
let pathToUnix = require('../path-to-unix')

test('path-to-unix returns / seperated paths on Windows', t => {
  t.plan(1)
  t.equals(pathToUnix('C:\\Users\\user'), 'C:/Users/user', 'pathToUnix returns / seperated paths on Windows')
})
test('path-to-unix returns / seperated paths on Unix', t => {
  t.plan(1)
  t.equals(pathToUnix('/home/user'), '/home/user', 'pathToUnix returns / seperated paths on Windows')
})

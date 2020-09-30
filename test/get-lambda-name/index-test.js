let test = require('tape')
let name = require('../../get-lambda-name')

test('get-lambda-name converts routes to acceptable names', t => {
  t.plan(7)
  t.equals(name('/'), '-index', 'root route returns -index')
  t.equals(name('/memories'), '-memories', 'named base route converts slashes')
  t.equals(name('/batman/robin'), '-batman-robin', 'intermediate slashes are converted to dashes')
  t.equals(name('/batman.robin'), '-batman_robin', 'dots are converted to underscores')
  t.equals(name('/batman-robin'), '-batman_robin', 'dashes are converted to underscores')
  t.equals(name('/:batman'), '-000batman', 'colons are converted to triple zeros')
  t.equals(name('/path/*'), '-path-catchall', '* is converted to catchall')
})

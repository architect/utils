let net = require('net')

module.exports = function canUse(port, callback) {
  var tester = net.createServer()
    .once('error', callback)
    .once('listening', function() {
      tester.once('close', function() {callback()})
      .close()
    }).listen(port)
}

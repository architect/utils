let readArcFile = require('../read-arc')
let parallel = require('run-parallel')
let code = require('./lambda-code')
let assets = require('./public-code')
/**
 * [new!] cannonical code generator
 *
 * rules:
 *
 * - goes fast: init an entire .arc file in one shot in parallel
 * - dep free!!!
 * - min code possible
 * - only one comment at the top of the file
 * - add .arc-config by default
 * -
 *
 * @param {Function} callback - a node style errback
 * @returns {Promise} - (if no callback is supplied)
 */
module.exports = function init(callback) {

  let promise
  if (!callback) {
    promise = new Promise(function ugh(res, rej) {
      callback = function errback(err, result) {
        err ? rej(err) : res(result)
      }
    })
  }

  let {arc} = readArcFile()
  let find = setting=> setting[0] === 'runtime'
  let runtime = arc.aws && arc.aws.some(find)? arc.aws.find(find)[1] : 'nodejs10.x'
  let functions = []

  // generate ./public with minimal set of static assets
  if (arc.static)
    functions = functions.concat(assets)

  // generate http functions
  if (arc.http) {
    let type = 'http'
    functions = functions.concat(arc.http.map(route=> {
      return code.bind({}, {type, runtime, method: route[0], path: route[1]})
    }))
  }

  //let eventFunctions = arc.events.map()
  //let queueFunctions = arc.queues.map()
  //let tableFunctions = arc.tables.map()
  //let wsFunctions = arc.ws.map()

  // the holy trinity of async
  parallel(functions, callback)
  return promise
}

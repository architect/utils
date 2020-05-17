let chalk = require('chalk')

/**
 * Allowed runtimes
 * 1. yes, we are deliberately opting .arc users out of older runtimes; open to discussing in an issue!
 * 2. we will always support the runtimes below as long as aws does...
 */
let allowed = [
  'nodejs12.x', // index 0 == default runtime
  'nodejs10.x',
  'deno',
  'python3.8',
  'python3.7',
  'python3.6',
  'go1.x',
  'ruby2.7',
  'ruby2.5',
  'dotnetcore3.1',
  'dotnetcore2.1',
  'java11',
  'java8',
]

let defaultRuntime = allowed[0]

/**
 * Extract runtime from @aws section
 * - finds `runtime` in @aws section
 */
module.exports = function getRuntime(arc) {
  if (!arc || !arc.aws) return defaultRuntime

  let awsRuntime = arc.aws.find(tuple => tuple.includes('runtime'))
  let runtime = awsRuntime && awsRuntime[1]
  return module.exports.allowed(runtime)
}

/**
 * Check runtime validity
 */
module.exports.allowed = function allowedRuntimes(runtime) {
  let quiet = process.env.ARC_QUIET || process.env.QUIET
  if (allowed.includes(runtime)) {
    return runtime
  }
  else {
    if (!quiet) {
      console.log(chalk.bold.yellow(`Warning:`), chalk.bold.white(`Invalid runtime specified, defaulting to ${defaultRuntime}`))
    }
    return defaultRuntime
  }
}

let readArcFile = require('./read-arc')
let chalk = require('chalk')

module.exports = function printBanner(params) {
  if (process.env.QUIET) null
  else {
    let arc
    try {
      let parsed = readArcFile()
      arc = parsed.arc
    }
    catch(e) {
      if (e.message != 'not_found')
        console.log(e)
    }
    let {version} = params
    version = version || '–'

    let name = arc ? arc.app[0] : 'Architect project manifest not found'
    let x = process.platform.startsWith('win') ? '~' : '⌁'

    let region = process.env.AWS_REGION || 'AWS_REGION not found'
    let profile = process.env.AWS_PROFILE || 'AWS_PROFILE not found'

    console.log(chalk.grey(`      app ${x} ${chalk.cyan.bold(name)}`))
    console.log(chalk.grey(`   region ${x} ${chalk.cyan(region)}`))
    console.log(chalk.grey(`  profile ${x} ${chalk.cyan(profile)}`))
    console.log(chalk.grey(`  version ${x} ${chalk.cyan(version)}`))
    console.log(chalk.grey(`      cwd ${x} ${chalk.cyan(process.cwd())}\n`))
  }
}

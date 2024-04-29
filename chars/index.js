let chalk = require('chalk')
let notWin = !process.platform.startsWith('win')

/**
 * Windows cmd.exe supports a partial UCS-2 charset
 */
let buzz = notWin
  ? chalk.grey('⌁')
  : chalk.grey('~')

let start = notWin
  ? chalk.green.dim('⚬')
  : chalk.green.dim('○')

let done = notWin
  ? chalk.green.dim('✓')
  : chalk.green.dim('√')

let warn = notWin
  ? chalk.yellow('⚠️')
  : chalk.yellow('!')

let err = notWin
  ? chalk.red('×')
  : chalk.red('x')

module.exports = {
  buzz,
  start,
  done,
  warn,
  err,
}

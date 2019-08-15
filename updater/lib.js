let out = process.stdout
// Clears the line so we can overwrite it
let clear = () => out.clearLine()
// Resets cursor position
let reset = x => out.cursorTo(x ? x : 0)
// Write to console, add single extra line to buffer while running
let write = t  => out.write(t + '\n' + '\033[1A')
let hideCursor = '\u001B[?25l'
let restoreCursor = '\u001B[?25h'

let isWin = process.platform.startsWith('win')
let windows = '| / – \\ | / – \\'.split(' ')
let unix = '⊙ ⦾ ⦿ ⦿ ⦿ ⦾ ⊙ ⊙ ⊙ ⊙'.split(' ')
let frames = isWin
  ? windows
  : unix
let timing = isWin
  ? 125
  : 100
let spinner = {frames, timing}

module.exports = {
  clear,
  reset,
  write,
  hideCursor,
  restoreCursor,
  spinner
}

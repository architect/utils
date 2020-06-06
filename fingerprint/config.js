module.exports = function fingerprintConfig ({static=[]}) {
  // Maybe enable fingerprint
  let fingerprint = false
  if (static.some(s => {
    if (!s[0]) return false
    if (s[0] === 'fingerprint' && s[1] && [ true, 'enabled', 'internal' ].some(i => i === s[1])) return true
    return false
  })) {
    fingerprint = true
  }
  // Allow apps and frameworks to handle their own fingerprinting
  if (static.some(s => {
    if (!s[0]) return false
    if (s[0] === 'fingerprint' && s[1] === 'external') return true
    return false
  })) {
    fingerprint = 'external'
  }

  // Collect any strings to match against for ignore
  let ignore = static.find(s => s['ignore'])
  if (ignore) {ignore = Object.getOwnPropertyNames(ignore.ignore)}
  else ignore = []

  return {fingerprint, ignore}
}

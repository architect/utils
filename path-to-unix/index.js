/**
 * Use Unix seperators on Windows
 * We do this because `path.posix.normalize(process.cwd())` returns `C:\\foo\\bar`, when we want `C:/foo/bar`
 * Normalise to slash file names (`C:/foo/bar`) for regex tests, etc.
 */
module.exports = function pathToUnix (string) {
  return string.replace(/\\/g, '/')
}

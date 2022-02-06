// TODO: swap this out for structuredClone at some point in the future, ideally
function deepCopy (obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item)
      return arr
    }, [])
  }
  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key])
      return newObj
    }, {})
  }
}

function deepFreeze (obj) {
  Object.values(obj).forEach(value => {
    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  })
  return Object.freeze(obj)
}

// Fast deep frozen object copy
// This is ~2x faster than JSON deep copying, while also deep-freezing
module.exports = obj => deepFreeze(deepCopy(obj))

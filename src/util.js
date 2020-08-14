export const isObject = (value) => {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

export const isArray = (value) => {
  const _isArray =
    Array.isArray ||
    ((_arg) => Object.prototype.toString.call(_arg) === '[object Array]')
  return _isArray(value)
}

export const isString = (value) => {
  return Object.prototype.toString.call(value) === '[object String]'
}

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (isObject(value)) return Object.keys(value).length === 0
  if (isArray(value)) return value.length === 0

  return false
}

export default {
  isEmpty,
}

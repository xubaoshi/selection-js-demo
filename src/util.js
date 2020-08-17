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

export const revertMapToObject = (map) => {
  let obj = {}
  for (let [key, value] of map) {
    obj[key] = value
  }
  return obj
}

// 按照 xptah 分类
export const filterListByField = (list, fieldName) => {
  if (isEmpty(list)) return []
  const map = new Map()
  list.forEach((item) => {
    if (map.has(item[fieldName])) {
      map.set(item[fieldName], [map.get(item[fieldName]), item].flat())
    } else {
      map.set(item[fieldName], [item])
    }
  })
  return revertMapToObject(map)
}

export default {
  isEmpty,
  filterListByField,
}

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

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a')
      return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

export default {
  isEmpty,
  filterListByField,
  parseTime,
}

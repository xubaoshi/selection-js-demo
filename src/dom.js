// 获取网页尺寸
export const getPagearea = () => {
  if (document.compatMode == 'BackCompat') {
    return {
      width: Math.max(document.body.scrollWidth, document.body.clientWidth),
      height: Math.max(document.body.scrollHeight, document.body.clientHeight),
    }
  }

  return {
    width: Math.max(
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth
    ),
    height: Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight
    ),
  }
}

// 获取元素距离网页左侧距离
export const getElementLeft = (element) => {
  let actualLeft = element.offsetLeft
  let current = element.offsetParent
  while (current !== null) {
    let parentLeftBorderWidth = document.defaultView.getComputedStyle(
      current,
      null
    ).borderLeftWidth
    actualLeft += current.offsetLeft
    if (parentLeftBorderWidth) {
      actualLeft += parseFloat(parentLeftBorderWidth)
    }

    current = current.offsetParent
  }
  return actualLeft
}

// 获取元素距离网页顶部距离
export const getElementTop = (element) => {
  let actualTop = element.offsetTop
  let current = element.offsetParent
  while (current !== null) {
    actualTop += current.offsetTop
    current = current.offsetParent
  }
  return actualTop
}

// 根据 xpath 获取匹配的第一个 dom
export const getDomByXPath = (xpath) => {
  var result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ANY_TYPE,
    null
  )
  return result.iterateNext()
}

// 根据 xpath 获取匹配的 xpath 数量
export const getDomCountByXPath = () => {
  var result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ANY_TYPE,
    null
  )
  var i = 0
  while (result.iterateNext()) {
    i++
  }
  return i
}

export default {
  getPagearea,
  getElementLeft,
  getElementTop,
  getDomByXPath,
  getDomCountByXPath,
}

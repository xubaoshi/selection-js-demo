import dom from './dom'
import util from './util'

const SelectionTool = function(options) {
  const defaultOptions = {}
  this.config = {
    ...defaultOptions,
    ...options,
  }
  this.init()
}

SelectionTool.prototype = {
  init() {
    const xpathList = [
      '/html/body/div[1]/div/div[2]/div[2]/section/div/div[3]/div[1]',
      '/html/body/div[1]/div/div[2]/div[2]/section/div/div[3]/div[6]/div[1]/span',
      '/html/body/div[1]/div/div[2]/div[2]/section/div/div[3]/div[7]/div[1]/div',
    ]
    this.insertMask()
    this.insertSelection(xpathList)
    this.initEvent()
  },
  // 插入蒙版
  insertMask() {
    const $body = document.querySelector('body')
    const $mask = document.createElement('div')
    const pageArea = dom.getPagearea()
    $mask.style.width = `${pageArea.width}px`
    $mask.style.height = `${pageArea.height}px`
    $mask.style.backgroundColor = '#00CE7A'
    $mask.style.opacity = '0.3'
    $mask.style.position = 'absolute'
    $mask.style.top = 0
    $mask.style.zIndex = 99999
    $body.appendChild($mask)
    this.$mask = $mask
  },
  // 删除蒙版
  removeMask() {
    this.$mask && this.$mask.remove()
  },
  // 插入选框
  insertSelection(xpathList) {
    if (util.isEmpty(xpathList)) return
    const $selections = []
    xpathList.forEach((xpath) => {
      const $target = dom.getDomByXPath(xpath)
      // todo
      // 元素不同、权限不同。内容不同，相同的 xpath 可能定位到不同东西
      if ($target) {
        const rect = $target.getBoundingClientRect()
        const left = dom.getElementLeft($target)
        const top = dom.getElementTop($target)
        const $selection = document.createElement('div')
        $selection.style.position = 'absolute'
        $selection.style.width = `${rect.width}px`
        $selection.style.height = `${rect.height}px`
        $selection.style.boxSizing = 'border-box'
        $selection.style.border = 'solid 2px blue'
        $selection.style.left = `${left}px`
        $selection.style.top = `${top}px`
        this.$mask.appendChild($selection)
        $selections.push($selection)
      }
    })
    this.$selections = $selections
  },
  // 事件处理
  initEvent() {
    if (util.isEmpty(this.$selections)) return

    // 初始化画框事件
    this.$selections.forEach((item) => {
      item.addEventListener('click', () => {
        alert(1111)
      })
    })

    // 页面 resize 重置画框
    window.addEventListener('resize', () => {
      this.removeMask()
      this.init()
    })
  },
}

window.SelectionTool = SelectionTool

export default SelectionTool

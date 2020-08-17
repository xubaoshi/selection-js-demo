import dom from './dom'
import util from './util'
import ajax from './ajax'

const SelectionTool = function(options) {
  const defaultOptions = {}
  this.config = {
    ...defaultOptions,
    ...options,
  }
  this.xpathMap = null
  this.$mask = null
  this.$selections = null
  this.init()
}

SelectionTool.prototype = {
  init() {
    ajax({
      type: 'get',
      url: '/log/event',
      data: {
        pageView: location.href,
      },
      success: (response) => {
        const result = response ? JSON.parse(response) : {}
        if (result.success === 1) {
          if (util.isEmpty(result.logs)) return
          const xpathMap = util.filterListByField(result.logs, 'eselector')
          const xpathList = Object.keys(xpathMap)
          this.xpathMap = xpathMap
          if (!util.isEmpty(xpathList)) {
            this.insertMask()
            this.insertSelection(xpathList)
            this.initEvent()
          }
        }
        // const xpathList = [
        //   '//*[@id="app"]/div[1]/div[2]/div[2]/section[1]/div[1]/div[2]/main[1]/form[1]/div[1]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/input[1]',
        //   // '/html/body/div[1]/div/div[2]/div[2]/section/div/div[3]/div[6]/div[1]/span',
        //   // '/html/body/div[1]/div/div[2]/div[2]/section/div/div[3]/div[7]/div[1]/div',
        // ]
      },
    })
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
        $selection.style.display = `flex`
        $selection.style.justifyContent = 'center'
        $selection.style.alignItems = 'center'
        $selection.style.cursor = 'pointer'
        $selection.setAttribute('data-xpath', xpath)
        this.insertSelectionEle(xpath, $selection)
        this.$mask.appendChild($selection)
        $selections.push($selection)
      }
    })
    this.$selections = $selections
  },
  // 插入选框元素
  insertSelectionEle(xpath, $selection) {
    const list = this.xpathMap[xpath]
    if (util.isEmpty(list)) return
    const $ele = document.createElement('div')
    $ele.style.fontSize = '16px'
    $ele.innerText = `该元素被点击${list.length}次`
    $ele.style.color = '#000'
    $selection.appendChild($ele)
  },
  // 事件处理
  initEvent() {
    if (util.isEmpty(this.$selections)) return

    // 初始化画框事件
    this.$selections.forEach((item) => {
      const xpath = item.getAttribute('data-xpath')
      item.addEventListener('click', () => {
        alert(xpath)
      })
    })

    // 页面 resize 重置画框
    window.addEventListener('resize', () => {
      this.removeMask()
      this.init()
    })
  },
  destroy() {
    this.removeMask()
    this.$mask = null
    this.xpathMap = null
    this.$selections = null
  },
}

window.SelectionTool = SelectionTool

export default SelectionTool

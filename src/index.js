import dom from './dom'
import util from './util'
import ajax from './ajax'
import pickerStyle from './pikaday/style.js'
import Pikaday from './pikaday'

const enableColor = 'green'
const disableColor = '#e45c43'
const SelectionTool = function(options) {
  const defaultOptions = {}
  this.config = {
    ...defaultOptions,
    ...options,
  }
  this.enable = false
  this.xpathMap = null
  this.actualXpathList = []
  this.$switchBtn = null
  this.$mask = null
  this.$tips = null
  this.$selections = null
  this.$selectWrap = null
  this.$startInput = null
  this.$xpathList = null
  this.$endInput = null
  this.insertSwicthBtn()

  // 组合键监听
  document.onkeydown = (e) => {
    const keyCode = e.keyCode || e.which || e.charCode
    const ctrlKey = e.ctrlKey || e.metaKey
    const shiftKey = e.shiftKey
    if (ctrlKey && shiftKey && keyCode === 85) {
      if (this.enable === false) {
        this.init().then((result) => {
          if (result) {
            this.$switchBtn.innerText = '关闭'
            this.$switchBtn.style.backgroundColor = disableColor
            this.enable = true
          } else {
            this.destroy()
          }
        })
      } else {
        this.destroy()
        this.$switchBtn.innerText = '开启'
        this.$switchBtn.style.backgroundColor = enableColor
        this.enable = false
        window.removeEventListener('resize', this.resizeFn, false)
      }
    }
    e.preventDefault()
    return false
  }

  // 页面 resize 重置画框
  window.addEventListener('resize', this.resizeFn, false)
}

SelectionTool.prototype = {
  init(url = '/log/event', isRefresh = false) {
    const params = {
      pageView: location.href,
    }
    if (isRefresh) {
      params['start'] = this.$startInput.value
      params['end'] = this.$endInput.value
    }
    return new Promise((resolve) => {
      ajax({
        type: 'get',
        url,
        data: {
          ...params,
        },
        success: (response) => {
          const result = response ? JSON.parse(response) : {}
          if (result.success === 1) {
            if (util.isEmpty(result.logs)) {
              resolve(false)
              return
            }
            if (isRefresh) {
              this.refresh()
            }
            let xpathMap = util.filterListByField(result.logs, 'eselector')
            const xpathList = Object.keys(xpathMap).sort((a, b) => {
              return xpathMap[b].length - xpathMap[a].length
            })
            // const xpathList = Object.keys(xpathMap)
            this.xpathMap = xpathMap
            if (!util.isEmpty(xpathList)) {
              if (isRefresh) {
                this.insertSelection(xpathList)
                this.insertSelectDateEle(
                  params['start'],
                  params['end'],
                  isRefresh
                )
                this.insertXpathList(this.actualXpathList)
                this.initEvent()
              } else {
                this.insertMask()
                this.insertSelection(xpathList)
                this.insertSelectDateEle()
                this.insertXpathList(this.actualXpathList)
                this.initEvent()
              }
              resolve(true)
            } else {
              resolve(false)
            }
          }
        },
        fail: () => {
          resolve(false)
        },
      })
    })
  },
  // 插入开关按钮
  insertSwicthBtn() {
    const $body = document.querySelector('body')
    const $switchBtn = document.createElement('div')
    $switchBtn.style.width = '50px'
    $switchBtn.style.height = '50px'
    $switchBtn.style.backgroundColor = enableColor
    $switchBtn.style.position = 'fixed'
    $switchBtn.style.right = '50px'
    $switchBtn.style.bottom = '50px'
    $switchBtn.style.zIndex = 100000
    $switchBtn.style.display = 'flex'
    $switchBtn.style.justifyContent = 'center'
    $switchBtn.style.alignItems = 'center'
    $switchBtn.style.cursor = 'pointer'
    $switchBtn.style.fontSize = '18px'
    $switchBtn.style.fontWeight = 'bold'
    $switchBtn.style.borderRadius = '50%'
    $switchBtn.style.color = '#fff'
    $switchBtn.innerText = '开启'

    $switchBtn.addEventListener('click', () => {
      if (this.enable) {
        this.destroy()
        $switchBtn.innerText = '开启'
        $switchBtn.style.backgroundColor = enableColor
        this.enable = false
        window.removeEventListener('resize', this.resizeFn, false)
      } else {
        this.init().then((result) => {
          if (result) {
            $switchBtn.innerText = '关闭'
            $switchBtn.style.backgroundColor = disableColor
            this.enable = true
          } else {
            this.destroy()
          }
        })
      }
    })
    $body.appendChild($switchBtn)
    this.$switchBtn = $switchBtn
  },
  // 插入蒙版
  insertMask() {
    const $body = document.querySelector('body')
    const $mask = document.createElement('div')
    const $rightBtn = document.createElement('img')
    const pageArea = dom.getPagearea()
    $mask.style.width = `${pageArea.width}px`
    $mask.style.height = `${pageArea.height}px`
    $mask.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
    $mask.style.position = 'absolute'
    $mask.style.top = 0
    $mask.style.zIndex = 99999

    // img
    $rightBtn.src =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAQCAYAAABHjGx4AAAABGdBTUEAALGPC/xhBQAAAbpJREFUSA3dls1Kw0AQgGdibZuUelFExEoR0YMI/lTwUkXw4BuoR5/BJ/Al9A0UvPkC4k30JaxttSKebJMmbbPjbGDDpra3Bm0Wlp2dTCbzZXYmQRgyiMhouu4ZCjwGoA1AnGEdDjH/EzUi9ji2DwB85NCu81b6jnU0KJiBgdt2p+SjfwUEpUE3/VsdwtMkwqlpmi/9Mf4C/W53y0j+PWcv1W88DnsG+jQgu5nL4bser6FvbJvmUfRuxxVSsvC5nRXo3jDDhM4WARXoXbLhnG4wjjIR7DXbnXM99vDoOg4t+OC98puIwOvGo5AdxwncWJY1CnfDfSBW8mZmSTWnEEpApxw3ZKtlQ6VaC6aUYx1ERdd1i+oZGihtK2UcqwSr1utQXCwEU8pxwwrENcUSgvLXZ10pR73qkPLIyimB44YlAauKJQTlfhUb6FujEYDpdalg5bW4BjelFeU7aEZcm9NNx/1SyqSs3Ige8lb2QPIEGXU8bzcpcDoHZ3SLk5gOQYWAQ90gOTJN2Z63H4KycJQcuCiJ8PFEapB/4Hd88J+jl5Oz4zrtpjCznBIGWijgIjlofSRcqF3oFX4AzV2zMbRXkMUAAAAASUVORK5CYII='
    $rightBtn.id = 'right-btn'
    $mask.appendChild($rightBtn)

    $body.appendChild($mask)
    this.$mask = $mask
  },
  // 插入选框
  insertSelection(xpathList) {
    if (util.isEmpty(xpathList)) return
    const $tips = []
    const $selections = []
    const actualXpathList = []
    xpathList.forEach((xpath) => {
      const $target = dom.getDomByXPath(xpath)
      // todo
      // 元素不同、权限不同。内容不同，相同的 xpath 可能定位到不同东西
      if ($target) {
        const rect = $target.getBoundingClientRect()
        const left = dom.getElementLeft($target)
        const top = dom.getElementTop($target)
        const $tip = document.createElement('div')
        const $selection = document.createElement('div')

        if (!(rect.width > 0 && rect.height > 0)) {
          return
        } else {
          actualXpathList.push(xpath)
        }

        // $selection
        $selection.style.position = 'absolute'
        $selection.style.width = `${rect.width}px`
        $selection.style.height = `${rect.height}px`
        $selection.style.boxSizing = 'border-box'
        $selection.style.left = `${left}px`
        $selection.style.top = `${top}px`
        $selection.style.border = 'solid 1px #e45c43'
        $selection.className = 'selection-item'
        $selection.setAttribute('data-xpath', xpath)

        // $tip
        $tip.style.position = 'absolute'
        $tip.style.width = `20px`
        $tip.style.height = `20px`
        $tip.style.boxSizing = 'border-box'
        $tip.style.borderRadius = '50%'
        $tip.style.backgroundColor = '#e45c43'
        $tip.style.left = `${left + rect.width - 10}px`
        $tip.style.top = `${top - 10}px`
        $tip.style.display = `flex`
        $tip.style.justifyContent = 'center'
        $tip.style.alignItems = 'center'
        $tip.style.cursor = 'pointer'
        $tip.className = 'selection-tip'
        $tip.setAttribute('data-xpath', xpath)
        this.insertSelectionEle(xpath, $tip)
        this.$mask.appendChild($selection)
        this.$mask.appendChild($tip)
        $tips.push($tip)
        $selections.push($selection)
      }
    })
    this.$tips = $tips
    this.$selections = $selections
    this.actualXpathList = actualXpathList
  },
  // 插入选框元素
  insertSelectionEle(xpath, $tip) {
    const list = this.xpathMap[xpath]
    if (util.isEmpty(list)) return
    const $ele = document.createElement('div')
    $ele.style.fontSize = '14px'
    $ele.innerText = list.length
    $ele.style.color = '#fff'
    $tip.appendChild($ele)
  },
  // 时间搜索展示控件
  insertSelectDateEle(start, end, isRefresh) {
    const $selectWrap = document.createElement('div')
    const startInputStr = `
    <img id="left-btn" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAQCAYAAABHjGx4AAAABGdBTUEAALGPC/xhBQAAAcRJREFUSA3Vls1OwkAQx2cQQaj1olEQiMQYPRgTPzDxgl48+Abq0WfwCXwJfQNNvPkCXo0+giERYmKMR0lLC3THWXSb5evGUplDt/vf6cz8uh8twhAjoljd8y5Q4CkAbQPiAms4xD0SGRHbXNsnAD5xabd2OvHAGg0qZmDhjtMsBRjcAEFp0EP/VkN4nkY4T6VSb7019oF+N1plpOCRZy/e6zwJfQb6isHMjmXhh15vTO84Di2jaN9PKqRk4XW7KNC7Y4Ypna0LVKB/zY4Z3WES74ngsN5oXuq1h0vXdSkfgF/jN9EFrztP1D1i1U4lV9XhFEIJaJZNQb5WKuA23L73JDU5ZsSIip7nFVVsDZT2lDjqNruUgWrtvQtWQkpNjpkygbipYoeg/PXZUuKoW9uehUIuF8IqSKnJMVNGAjZUbO0TQsZAZTIdVvZNQ8ocfCity1ZaB5T35nzd9bK/krmrhF0p5DsJLMsyl0hFxh5Q1/cP1JjpdiyAfxA8o7s8iQk+eZudPSoEHJsGjCY+zTm+fyRzq8PoJJpCzGcVAZ7JLMg/8PsBBC/mU0aTgZdtK47JtbiIYRoFXEVTxhiy8kZtQbvwAzDVrST7/gN5AAAAAElFTkSuQmCC"></img>
    <div style="margin-bottom:10px;"><span style="font-size: 14px;color: #606266;">开始时间： </span></input><input readonly="readonly" track-ignore="1" placehoder="请选择开始时间" id="startTime"></div>
    <div><span style="font-size: 14px;color: #606266;">结束时间： </span><input readonly="readonly" track-ignore="1"  placehoder="请选择结束时间" id="endTime"></input>
    <button style="margin-left: 10px;" track-ignore="1" id="search">查询</button>
    <button style="margin-left: 5px;" track-ignore="1" id="reset">重置</button></div>`
    const $style = document.createElement('style')
    $style.innerHTML = pickerStyle
    $style.type = 'text/css'
    $selectWrap.style.width = '500px'
    $selectWrap.style.height = 'calc(100vh - 20px)'
    $selectWrap.style.position = 'fixed'
    $selectWrap.style.top = '10px'
    $selectWrap.style.bottom = '10px'
    $selectWrap.style.right = '10px'
    $selectWrap.style.border = 'solid 1px #ccc'
    $selectWrap.style.backgroundColor = '#fff'
    $selectWrap.style.padding = '15px'
    $selectWrap.style.display = isRefresh ? 'block' : 'none'

    $selectWrap.innerHTML = startInputStr
    this.$mask.appendChild($selectWrap)
    this.$selectWrap = $selectWrap
    document
      .getElementsByTagName('HEAD')
      .item(0)
      .appendChild($style)

    // 初始化时间选择控件
    const $startInput = document.getElementById('startTime')

    const startPicker = new Pikaday({
      field: $startInput,
      format: 'YYYY-MM-DD',
      onSelect: function(date) {
        $startInput.value = util.parseTime(date, '{y}-{m}-{d}')
      },
      reposition: false,
    })

    this.$mask.appendChild(startPicker.el)
    if (start) {
      // $startInput.value = start
      startPicker.setDate(start)
    }

    const $endInput = document.getElementById('endTime')
    const endPicker = new Pikaday({
      field: $endInput,
      onSelect: function(date) {
        $endInput.value = util.parseTime(date, '{y}-{m}-{d}')
      },
      reposition: false,
    })
    this.$mask.appendChild(endPicker.el)
    if (end) {
      // $endInput.value = end
      endPicker.setDate(end)
    }

    this.$startInput = $startInput
    this.$endInput = $endInput
  },
  // 在时间搜索展示控件中插入 xpath 列表
  insertXpathList(xpathList) {
    // 插入 xpath 列表
    const $xpathList = document.createElement('ul')
    $xpathList.id = 'xpath-list'
    $xpathList.className = 'xpath-list'
    $xpathList.innerHTML =
      `<li class="header">
          <div class="col-1">xpath</div>
          <div>点击次数</div>
        </li>` +
      xpathList
        .map((item) => {
          return `<li>
          <a track-ignore="1" title='${item}' href="javascript:;">${item}</a>
          <div>${this.xpathMap[item].length}</div>
        </li>`
        })
        .join('')
    this.$selectWrap.appendChild($xpathList)
    this.$xpathList = $xpathList
  },
  resizeFn() {
    if (!this.enable) return
    const that = this
    let resizeTimer = null
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      that.destroy()
      that.init()
    }, 500)
  },
  // 事件处理
  initEvent() {
    if (util.isEmpty(this.$tips)) return

    // 初始化画框事件
    // this.$tips.forEach((item) => {
    //   const xpath = item.getAttribute('data-xpath')
    //   item.addEventListener('click', () => {
    //     alert(xpath)
    //   })
    // })

    // 监听 xpath 点击
    const $xpathList = document.getElementById('xpath-list')
    $xpathList.onclick = (ev) => {
      var ev = ev || window.event
      var target = ev.target || ev.srcElement
      if (target.nodeName.toLocaleLowerCase() === 'a') {
        const xpath = target.innerText
        const $tips = document.querySelectorAll('.selection-tip')
        const $selections = document.querySelectorAll('.selection-item')
        $tips.forEach(($tip) => {
          const tipXpath = $tip.getAttribute('data-xpath')
          if (tipXpath === xpath) {
            $tip.style.backgroundColor = 'green'
            $tip.scrollIntoView(true)
          } else {
            $tip.style.backgroundColor = '#e45c43'
          }
        })
        $selections.forEach(($selection) => {
          const tipXpath = $selection.getAttribute('data-xpath')
          if (tipXpath === xpath) {
            $selection.style.borderColor = 'green'
          } else {
            $selection.style.borderColor = '#e45c43'
          }
        })
      }
    }

    // 监听 search 按钮点击
    const $btn = document.getElementById('search')
    $btn.addEventListener('click', () => {
      if (this.$startInput.value && this.$endInput.value) {
        this.init('/log/event', true)
      }
    })

    // 监听 reset 按钮点击
    const $reset = document.getElementById('reset')
    $reset.addEventListener('click', () => {
      this.$startInput.value = ''
      this.$endInput.value = ''
      this.init('/log/event', true)
    })

    // left-btn
    const $leftBtn = document.getElementById('left-btn')
    $leftBtn.addEventListener('click', () => {
      this.$selectWrap.style.display = 'none'
      $rightBtn.style.display = 'block'
    })

    // right-btn
    const $rightBtn = document.getElementById('right-btn')
    $rightBtn.addEventListener('click', () => {
      this.$selectWrap.style.display = 'block'
      $rightBtn.style.display = 'none'
    })
  },
  // 删除蒙版
  removeMask() {
    this.$mask && this.$mask.remove()
  },
  // 销毁
  destroy() {
    if (!util.isEmpty(this.$tips)) {
      this.$tips.forEach(($tip) => {
        $tip.removeEventListener('click', () => {})
      })
    }
    this.removeMask()
    this.$mask = null
    this.xpathMap = null
    this.$tips = null
    this.$selections = null
    this.actualXpathList = []
    this.$selectWrap = null
    // this.$switchBtn = null
    this.$startInput = null
    this.$endInput = null
  },
  // 刷新
  refresh() {
    if (!util.isEmpty(this.$tips)) {
      this.$tips.forEach(($tip) => {
        $tip.removeEventListener('click', null)
        $tip.remove()
      })
    }
    if (!util.isEmpty(this.$selections)) {
      this.$selections.forEach(($selection) => {
        $selection.remove()
      })
    }

    this.$xpathList.remove()
    this.$selectWrap.remove()

    this.xpathMap = null
    this.$tips = null
    this.$selections = null
    this.actualXpathList = []
  },
}

window.SelectionTool = SelectionTool

export default SelectionTool

<template>
  <div class="main-container">
    <vx-editor-tip-bar />
    <div
      class="design-container"
      id="js-container"
      ref="container"
      @click.right.stop.exact="pointerRightDown($event)"
      @click.self.exact="selectCanvasHandler"
    >
      <div class="design-canvas" :style="canvasStyles">
        <div class="editor-shell" :style="canvasStyles">
          <div class="editor-canvas" ref="canvas">
            <div class="editor-layout" @mouseout="clearHoverHandler">
              <vx-Editor-bg :zoom="global.zoom" @select="selectBgHandler" />
              <vx-water-mark />
              <template v-for="(item, index) in layout.elements">
                <vx-shape @move="contextmenuShow = false" :key="index" :item="item" :index="index"></vx-shape>
              </template>
            </div>
          </div>
          <div class="editor-hover" :class="[`hover-${type}`, {'hover-lock': lock}]"></div>
          <!-- 删除该属性 :widget="transformStyle" 解决撤销时选中样式位置错误的bug。2019-10-11 09:22 -->
          <vx-editor-guider />
          <vx-image-cut />
          <vx-toolbar />
        </div>
      </div>
      <vx-selector />
      <vx-contextmenu
        :selectWidget="selectWidget"
        v-model="contextmenuShow"
        :top="contextmenuTop"
        :left="contextmenuleft"
      />
    </div>
  </div>
</template>
<script>
import { getter, mitation } from 'src/design/store'
import { mixin } from 'src/design/utils'

import VxEditorTipBar from 'src/design/components/tipBar'

import VxEditorBg from './background'

import VxWaterMark from './watermark'

import VxEditorGuider from './guider'
import VxImageCut from './imageCut'
import VxToolbar from './toolbar'
import vxSelector from './selector'
import VxContextmenu from './contentMenu'
import VxShape from './shape'
export default {
  name: 'vx-canvas',
  mixins: [mixin],
  props: {
    success: {
      type: Boolean
    }
  },
  components: {
    VxShape,
    VxEditorTipBar,
    VxEditorBg,

    VxWaterMark, // 水印
    VxEditorGuider, // 辅助线
    VxImageCut, // 裁剪图片
    VxToolbar, // 工具条
    vxSelector, // 多选
    VxContextmenu // 上下文菜单
  },
  data() {
    return {
      transformStyle: {},
      timer: null,
      editor: -1,
      editorParent: -1,
      type: null,
      over: {},
      lock: false,
      contextmenuTop: 0,
      contextmenuleft: 0,
      container: { y: 99 },
      contextmenuShow: false,
      groupItemSelected: '' // 组元素选中
    }
  },
  computed: {
    global() {
      return getter.global()
    },
    layout() {
      return getter.layout()
    },
    selectWidget() {
      return getter.current()
    },

    canvasStyles() {
      return {
        width: `${this.layout.width * this.global.zoom}px`,
        height: `${this.layout.height * this.global.zoom}px`
      }
    },
    cutable() {
      return getter.cutable()
    },
    mulSelected() {
      return getter.mulSelected()
    },
    selectedItem() {
      return getter.selectedItem()
    }
  },
  methods: {
    transformHandler(index) {
      this.over = this.overlap(index)
      let data = this.layout.elements[index]
      let pos = {
        w: data.width,
        h: data.height,
        l: data.left,
        t: data.top
      }
      let transform = data.transform || { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
      this.$set(this, 'transformStyle', {
        transform: transform,
        width: pos.w,
        height: pos.h,
        top: pos.t,
        left: pos.l,
        draggable: data.dragable,
        rotatable: data.rotatable,
        type: data.type,
        display: 'block',
        index: index,
        editor: false
      })
    },
    clearHoverHandler() {
      this.lock = false
    },
    cleartransformHandler() {
      this.$set(this, 'transformStyle', {})
      this.editor = -1
      this.editorParent = -1
      this.over = {}
      this.contextmenuShow = false
      this.groupItemSelected = ''
      mitation.setCutable(false)
    },
    selectCanvasHandler() {
      this.cleartransformHandler()
      mitation.setCurrent({ id: -1, type: 'canvas' })
      // mitation.setSelectedItem([]);
    },
    selectBgHandler() {
      this.cleartransformHandler()
      mitation.setCurrent({ id: -1, type: 'background' })
    },
    // 获取上下文菜单位置
    pointerRightDown(e) {
      e.preventDefault()
      this.contextmenuShow = true
      let top = e.pageY - this.container.y
      let left = e.pageX - this.container.x
      let _h = this.container.height - top
      let _w = this.container.width - left
      if (_h < 200) {
        top = -_h
      }
      if (_w < 200) {
        left = -_w
      }
      this.contextmenuTop = top
      this.contextmenuleft = left
    },

    getContainerSize() {
      let size = document.querySelector('#js-container').getBoundingClientRect()
      this.container = size
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        let el = this.$refs.container
        if (!el) return
        let h = el.clientHeight,
          w = el.clientWidth
        if (h > 0 && w > 0) {
          this.updateZoom(h, w)
        }
        this.getContainerSize()
      }, 100)
    })
    setTimeout(() => {
      let el = this.$refs.container
      if (!el) return
      let h = el.clientHeight,
        w = el.clientWidth
      if (h > 0 && w > 0) {
        this.updateZoom(h, w)
      }
      this.getContainerSize()
    }, 100)
  },
  watch: {
    success(val) {
      if (val) {
        setTimeout(() => {
          let el = this.$refs.container
          if (!el) return
          let h = el.clientHeight,
            w = el.clientWidth
          if (h > 0 && w > 0) {
            this.updateZoom(h, w)
          }
          this.getContainerSize()
        }, 1)
      }
    },
    'selectWidget.id': function(val) {
      this.index = val
      if (val >= 0) {
        this.transformHandler(val)
        this.contextmenuShow = false
      } else {
        this.cleartransformHandler()
      }
    }
  }
}
</script>
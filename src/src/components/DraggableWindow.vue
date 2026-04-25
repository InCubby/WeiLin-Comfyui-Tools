<template>
  <Teleport to="#weilin_comfyui_tools_prompt_ui_div">
    <div
      ref="windowRef"
      class="weilin_prompt_ui_draggable-window"
      :style="windowStyle"
      @mousedown="emit('active')"
    >
      <!-- 窗口标题栏 -->
      <div class="weilin_prompt_ui_window-header" @mousedown.stop="emit('active')">
        <div class="weilin_prompt_ui_window-title">
          {{ title }}
        </div>
        <button class="weilin_prompt_ui_close-btn" @click="emit('close')">×</button>
      </div>

      <!-- 内容区域 -->
      <div
        class="weilin_prompt_ui_window-content"
        :style="contentStyle"
        @scroll="handleScroll"
      >
        <slot></slot>
      </div>

    </div>
  </Teleport>
</template>

<script setup>
  import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
  import interact from 'interactjs'

  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    position: {
      type: Object,
      required: true
    },
    size: {
      type: Object,
      required: true
    },
    zIndex: {
      type: Number,
      default: 1
    },
    name: {
      type: String,
      default: 'default_window_name'
    },
    minWidth: {
      type: Number,
      default: 200
    },
    minHeight: {
      type: Number,
      default: 200
    },
    contentScrollable: {
      type: Boolean,
      default: true
    }
  })

  const emit = defineEmits(['update:position', 'update:size', 'active', 'close'])
  const windowRef = ref(null)
  let interactable = null
  let activeInteraction = null
  let emitRafId = null
  let pendingPosition = null
  let pendingSize = null

  // 当前位置和大小状态
  const currentPosition = ref({ x: 0, y: 0 })
  const currentSize = ref({ width: 600, height: 400 })
  const windowStyle = computed(() => ({
    left: `${currentPosition.value.x}px`,
    top: `${currentPosition.value.y}px`,
    width: `${currentSize.value.width}px`,
    height: `${currentSize.value.height}px`,
    zIndex: props.zIndex
  }))
  const contentStyle = computed(() => ({
    overflowY: props.contentScrollable ? 'auto' : 'hidden',
    overflowX: 'hidden'
  }))

  watch(
    () => [props.position?.x, props.position?.y, props.size?.width, props.size?.height],
    ([x, y, width, height]) => {
      syncStateFromProps(x, y, width, height)
    },
    { immediate: true }
  )

  // 优化：使用节流函数限制滚动事件频率
  let scrollThrottleTimer = null
  const handleScroll = () => {
    if (scrollThrottleTimer) {
      return
    }
    scrollThrottleTimer = setTimeout(() => {
      window.parent.postMessage(
        { type: `weilin_prompt_ui_window_change_${props.name}_scroll` },
        '*'
      )
      scrollThrottleTimer = null
    }, 100)
  }

  const clampPosition = (x, y, width = currentSize.value.width) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const minLeftSpace = 100
    return {
      x: Math.min(Math.max(minLeftSpace - width, x), viewportWidth - 100),
      y: Math.min(Math.max(100, y), viewportHeight - 100)
    }
  }

  const isPointerReleased = (event) => {
    const buttons = event?.buttons ?? event?.originalEvent?.buttons
    return buttons === 0
  }

  const ensurePointerPressed = (event) => {
    if (!isPointerReleased(event)) {
      return false
    }
    endInteraction()
    return true
  }

  const handleWindowBlur = () => {
    endInteraction()
  }

  const initInteract = () => {
    if (!windowRef.value) return

    interactable = interact(windowRef.value)
      .draggable({
        allowFrom: '.weilin_prompt_ui_window-header',
        ignoreFrom: '.weilin_prompt_ui_close-btn',
        listeners: {
          start(event) {
            activeInteraction = event.interaction
          },
          move(event) {
            if (ensurePointerPressed(event)) {
              return
            }
            const next = clampPosition(
              currentPosition.value.x + event.dx,
              currentPosition.value.y + event.dy
            )
            applyWindowStateChange({ position: next })
          },
          end() {
            endInteraction()
          }
        }
      })
      .resizable({
        edges: { top: true, right: true, bottom: true, left: true },
        margin: 8,
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: props.minWidth, height: props.minHeight }
          })
        ],
        listeners: {
          start(event) {
            activeInteraction = event.interaction
          },
          move(event) {
            if (ensurePointerPressed(event)) {
              return
            }
            const nextSize = {
              width: event.rect.width,
              height: event.rect.height
            }
            const nextPosition = clampPosition(
              currentPosition.value.x + event.deltaRect.left,
              currentPosition.value.y + event.deltaRect.top,
              nextSize.width
            )
            applyWindowStateChange({ position: nextPosition, size: nextSize })
          },
          end() {
            endInteraction()
          }
        }
      })
  }

  // 在组件挂载时初始化位置和大小
  onMounted(() => {
    if (props.position) {
      currentPosition.value = clampPosition(
        props.position.x,
        props.position.y,
        props.size?.width || currentSize.value.width
      )
    }

    if (props.size) {
      currentSize.value = { ...props.size }
    }

    initInteract()
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('mouseup', endInteraction)
    window.addEventListener('pointerup', endInteraction)
  })

  // 组件卸载时清理定时器和交互绑定
  onUnmounted(() => {
    if (scrollThrottleTimer) {
      clearTimeout(scrollThrottleTimer)
      scrollThrottleTimer = null
    }
    window.removeEventListener('blur', handleWindowBlur)
    window.removeEventListener('mouseup', endInteraction)
    window.removeEventListener('pointerup', endInteraction)
    endInteraction({ cancelRaf: true })
    if (interactable) {
      interactable.unset()
      interactable = null
    }
  })

  // 同步外部位置与尺寸到本地状态。
  function syncStateFromProps(x, y, width, height) {
    const positionChanged = x !== currentPosition.value.x || y !== currentPosition.value.y
    if (positionChanged) {
      currentPosition.value = { x, y }
    }
    const sizeChanged = width !== currentSize.value.width || height !== currentSize.value.height
    if (sizeChanged) {
      currentSize.value = { width, height }
    }
  }

  // 按动画帧合并并发送窗口状态更新。
  function queueWindowEmit({ position = null, size = null } = {}) {
    if (position) {
      pendingPosition = position
    }
    if (size) {
      pendingSize = size
    }
    if (emitRafId !== null) {
      return
    }
    emitRafId = window.requestAnimationFrame(() => {
      emitRafId = null
      flushPendingEmit()
    })
  }

  // 立即发送当前队列中的状态更新。
  function flushPendingEmit() {
    if (pendingPosition) {
      emit('update:position', pendingPosition)
      pendingPosition = null
    }
    if (pendingSize) {
      emit('update:size', pendingSize)
      pendingSize = null
    }
  }

  // 统一处理位置与尺寸变化并按需同步到外层。
  function applyWindowStateChange({ position = null, size = null } = {}) {
    const positionChanged =
      !!position &&
      (position.x !== currentPosition.value.x || position.y !== currentPosition.value.y)
    const sizeChanged =
      !!size && (size.width !== currentSize.value.width || size.height !== currentSize.value.height)
    if (!positionChanged && !sizeChanged) {
      return false
    }
    if (positionChanged) {
      currentPosition.value = position
    }
    if (sizeChanged) {
      currentSize.value = size
    }
    queueWindowEmit({
      position: positionChanged ? position : null,
      size: sizeChanged ? size : null
    })
    return true
  }

  // 结束当前交互并确保最终状态已同步。
  function endInteraction(options = {}) {
    const cancelRaf = !!options?.cancelRaf
    if (cancelRaf && emitRafId !== null) {
      window.cancelAnimationFrame(emitRafId)
      emitRafId = null
    }
    flushPendingEmit()
    if (!activeInteraction) {
      return
    }
    const canCheckInteracting = typeof activeInteraction.interacting === 'function'
    if (!canCheckInteracting || activeInteraction.interacting()) {
      activeInteraction.stop()
    }
    activeInteraction = null
  }
</script>

<style scoped>
  .weilin_prompt_ui_draggable-window {
    position: absolute;
    background: var(--weilin-prompt-ui-primary-bg);
    border: 1px solid var(--weilin-prompt-ui-border-color);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 100;
  }

  .weilin_prompt_ui_window-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--weilin-prompt-ui-secondary-bg);
    cursor: move;
    user-select: none;
  }

  .weilin_prompt_ui_window-title {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    margin-right: 8px;
    color: var(--weilin-prompt-ui-primary-text);
  }

  .weilin_prompt_ui_close-btn {
    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
    color: var(--weilin-prompt-ui-secondary-text);
  }

  .weilin_prompt_ui_close-btn:hover {
    color: #ff4d4f;
  }

  .weilin_prompt_ui_window-content {
    flex: 1;
    padding: 16px;
    background: var(--weilin-prompt-ui-primary-bg);
  }

  .weilin_prompt_ui_window-content::-webkit-scrollbar {
    width: 6px;
  }

  .weilin_prompt_ui_window-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .weilin_prompt_ui_window-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .weilin_prompt_ui_window-content::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>

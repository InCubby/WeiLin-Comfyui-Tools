<template>
  <div id="weilin_comfyui_tools_prompt_ui_container_main">
    <!-- 提示词窗口 -->
    <DraggableWindow
      name="promptBox"
      v-if="windows.prompt.visible"
      :title="
        promptManager === 'prompt' ? t('promptBox.windowTitle') : t('promptBox.windowTitleGlobal')
      "
      :position="windows.prompt.position"
      :size="windows.prompt.size"
      :min-width="560"
      :min-height="340"
      :content-scrollable="false"
      :z-index="windowManager.getZIndex('prompt')"
      @update:position="updatePosition('prompt', $event)"
      @update:size="updateSize('prompt', $event)"
      @active="windowManager.setActiveWindow('prompt')"
      @close="closeWindow('prompt')"
    >
      <PromptBox :promptManager="promptManager" ref="promptBoxRef" />
    </DraggableWindow>

    <!-- Tag管理窗口 -->
    <DraggableWindow
      name="tagManager"
      v-if="windows.tag.visible"
      :title="t('tagManager.windowTitle')"
      :position="windows.tag.position"
      :size="windows.tag.size"
      :z-index="windowManager.getZIndex('tag')"
      @update:position="updatePosition('tag', $event)"
      @update:size="updateSize('tag', $event)"
      @active="windowManager.setActiveWindow('tag')"
      @close="closeWindow('tag')"
    >
      <TagManager :tagManager="tagManager" />
    </DraggableWindow>

    <!-- 历史记录窗口  -->
    <DraggableWindow
      name="historyManager"
      v-if="windows.history.visible"
      :title="t('history.windowTitle')"
      :position="windows.history.position"
      :size="windows.history.size"
      :z-index="windowManager.getZIndex('history')"
      @update:position="updatePosition('history', $event)"
      @update:size="updateSize('history', $event)"
      @active="windowManager.setActiveWindow('history')"
      @close="closeWindow('history')"
    >
      <HistoryManager />
    </DraggableWindow>

    <!-- 节点列表快捷窗口 -->
    <DraggableWindow
      name="nodeListWindow"
      v-if="windows.node_list_window.visible"
      :title="t('nodeListWindow.windowTitle')"
      :position="windows.node_list_window.position"
      :size="windows.node_list_window.size"
      :z-index="windowManager.getZIndex('node_list_window')"
      @update:position="updatePosition('node_list_window', $event)"
      @update:size="updateSize('node_list_window', $event)"
      @active="windowManager.setActiveWindow('node_list_window')"
      @close="closeWindow('node_list_window')"
    >
      <NodeListWindow />
    </DraggableWindow>

    <!-- 云仓库窗口 -->
    <DraggableWindow
      name="cloudWindow"
      v-if="windows.cloud_window.visible"
      :title="t('cloudWindow.windowTitle')"
      :position="windows.cloud_window.position"
      :size="windows.cloud_window.size"
      :z-index="windowManager.getZIndex('cloud_window')"
      @update:position="updatePosition('cloud_window', $event)"
      @update:size="updateSize('cloud_window', $event)"
      @active="windowManager.setActiveWindow('cloud_window')"
      @close="closeWindow('cloud_window')"
    >
      <CloudWindow />
    </DraggableWindow>

    <!-- Danbooru管理器窗口 -->
    <DraggableWindow
      name="DanbooruManagerWindow"
      v-if="windows.danbooru_manager_window.visible"
      :title="t('controls.danbooruManager')"
      :position="windows.danbooru_manager_window.position"
      :size="windows.danbooru_manager_window.size"
      :z-index="windowManager.getZIndex('danbooru_manager_window')"
      @update:position="updatePosition('danbooru_manager_window', $event)"
      @update:size="updateSize('danbooru_manager_window', $event)"
      @active="windowManager.setActiveWindow('danbooru_manager_window')"
      @close="closeWindow('danbooru_manager_window')"
    >
      <DanbooruManagerWindow ref="danbooruManagerRef" />
    </DraggableWindow>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import DraggableWindow from '@/components/DraggableWindow.vue'
  import PromptBox from './view/prompt_box/prompt_index.vue'
  import TagManager from './view/tag_manager/tag_index.vue'
  import HistoryManager from './view/history_manager/history_index.vue'
  import { windowManager } from '@/utils/windowManager'
  import NodeListWindow from '@/view/node_list/index.vue'
  import CloudWindow from '@/view/cloud/index.vue'
  import DanbooruManagerWindow from '@/view/danbooru/danbooru_manager.vue'
  import { translatorApi } from '@/api/translator'
  import message from '@/utils/message'

  // 初始化 i18n
  const { t } = useI18n()

  const thisEditPromptId = ref('')
  const STORAGE_PREFIX = 'weilin_tools_'
  const tagManager = ref('manager')
  const promptManager = ref('prompt_global')
  const THEME_KEY = `${STORAGE_PREFIX}theme`
  // 获取主题设置
  const isDark = ref(localStorage.getItem(THEME_KEY) === 'dark')
  // 全局提示词
  const globalPrompt = ref('')

  // 默认窗口配置
  const DEFAULT_WINDOWS = {
    prompt: {
      visible: false,
      is_default_close: false,
      position: { x: 100, y: 100 },
      size: { width: 600, height: 500 }
    },
    tag: {
      visible: false,
      is_default_close: false,
      position: { x: 150, y: 150 },
      size: { width: 800, height: 600 }
    },
    history: {
      visible: false,
      is_default_close: false,
      position: { x: 300, y: 300 },
      size: { width: 800, height: 600 }
    },
    node_list_window: {
      visible: false,
      is_default_close: false,
      position: { x: 100, y: 100 },
      size: { width: 300, height: 600 }
    },
    cloud_window: {
      visible: false,
      is_default_close: false,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 }
    },
    danbooru_manager_window: {
      visible: false,
      is_default_close: true,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 }
    }
  }

  // 从 localStorage 获取窗口状态
  const getInitialWindowState = () => {
    try {
      const savedState = localStorage.getItem(`${STORAGE_PREFIX}windowStates`)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        const mergedState = { ...DEFAULT_WINDOWS }

        // 将保存的状态合并到默认配置中
        Object.keys(parsedState).forEach((key) => {
          if (key in mergedState) {
            mergedState[key] = {
              ...DEFAULT_WINDOWS[key],
              ...parsedState[key],
              // 如果is_default_close为true，则强制visible为false
              visible: parsedState[key].is_default_close ? false : parsedState[key].visible
            }
          }
        })

        return mergedState
      }
    } catch (error) {
      console.error('Error loading window states:', error)
    }

    return { ...DEFAULT_WINDOWS }
  }

  // 窗口状态管理
  const windows = ref(getInitialWindowState())

  // 监听窗口状态变化并保存 - 优化：使用防抖减少写入频率
  let saveWindowStateTimer = null
  watch(
    windows,
    (newState) => {
      // 使用防抖，500ms后才保存
      if (saveWindowStateTimer) {
        clearTimeout(saveWindowStateTimer)
      }
      saveWindowStateTimer = setTimeout(() => {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}windowStates`, JSON.stringify(newState))
        } catch (error) {
          console.error('Error saving window states:', error)
        }
        saveWindowStateTimer = null
      }, 500)
    },
    { deep: true }
  )

  // 组件挂载时注册所有窗口
  onMounted(() => {
    Object.keys(windows.value).forEach((windowName) => {
      // console.log(windowName)
      windowManager.registerWindow(windowName)
    })

    initTheme()
    // 添加消息监听
    window.addEventListener('message', handleMessage)
    localStorage.removeItem('aiChatHistory')
    windows.value.prompt.visible = true
  })

  // 初始化主题
  const initTheme = () => {
    let savedTheme = localStorage.getItem(THEME_KEY)
    if (!savedTheme) {
      localStorage.setItem(THEME_KEY, 'dark')
      savedTheme = 'dark'
      isDark.value = true
    }
    isDark.value = savedTheme === 'dark'
    // 初始化主题
    const container = document.getElementById('weilin_comfyui_tools_prompt_ui_div')
    if (container) {
      // console.log(isDark.value)
      container.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }
  }

  // 组件卸载时注销所有窗口
  onUnmounted(() => {
    Object.keys(windows.value).forEach((windowName) => {
      windowManager.unregisterWindow(windowName)
    })

    // 移除消息监听
    window.removeEventListener('message', handleMessage)
  })

  // 关闭窗口
  const closeWindow = (windowName) => {
    if (windowName === 'prompt') {
      thisEditPromptId.value = ''
    }
    windows.value[windowName].visible = false
  }

  // 更新窗口位置
  const updatePosition = (windowName, newPosition) => {
    if (windows.value[windowName]) {
      windows.value[windowName].position = { ...newPosition }
    }
  }

  // 更新窗口大小
  const updateSize = (windowName, newSize) => {
    if (windows.value[windowName]) {
      windows.value[windowName].size = { ...newSize }
    }
  }

  // 复原所有窗口到默认位置和大小
  const restoreWindowsToDefault = () => {
    const DEFAULT_GOL_WINDOWS = {
      prompt: {
        visible: true,
        is_default_close: false,
        position: { x: 100, y: 100 },
        size: { width: 600, height: 400 }
      },
      tag: {
        visible: false,
        is_default_close: false,
        position: { x: 150, y: 150 },
        size: { width: 800, height: 600 }
      },
      history: {
        visible: false,
        is_default_close: false,
        position: { x: 300, y: 300 },
        size: { width: 800, height: 600 }
      },
      node_list_window: {
        visible: false,
        is_default_close: false,
        position: { x: 100, y: 100 },
        size: { width: 400, height: 800 }
      },
      cloud_window: {
        visible: false,
        is_default_close: false,
        position: { x: 100, y: 100 },
        size: { width: 800, height: 600 }
      },
      danbooru_manager_window: {
        visible: false,
        is_default_close: true,
        position: { x: 100, y: 100 },
        size: { width: 800, height: 600 }
      }
    }

    localStorage.setItem(`${STORAGE_PREFIX}windowStates`, JSON.stringify(DEFAULT_GOL_WINDOWS))

    windows.value = getInitialWindowState()
  }

  const getTranslaterSetting = () => {
    translatorApi
      .getTranslateSetting()
      .then((res) => {
        // console.log(res)
        localStorage.setItem('weilin_prompt_ui_translater_setting', res.data)
      })
      .catch(() => {
        message({ type: 'warn', str: 'message.getTranslaterFail' })
      })
  }

  getTranslaterSetting()

  const promptBoxRef = ref()
  const danbooruManagerRef = ref()

  // 等待组件 ref 准备好的辅助函数
  const waitForRef = (refValue, callback, maxAttempts = 50) => {
    let attempts = 0
    const check = () => {
      attempts++
      if (refValue.value) {
        callback(refValue.value)
      } else if (attempts < maxAttempts) {
        nextTick(check)
      } else {
        console.warn('[WeiLin] Ref not ready after', maxAttempts, 'attempts')
      }
    }
    nextTick(check)
  }

  // 处理消息
  const handleMessage = (event) => {
    // 防止处理来自其他源的消息
    if (!event.data || !event.data.type) {
      return
    }

    // 只处理我们自己的消息类型
    if (!event.data.type.startsWith('weilin_prompt_ui_')) {
      return
    }

    if (event.data.type === 'weilin_prompt_ui_openTagManager') {
      tagManager.value = 'manager'
      windows.value.tag.visible = true
      windowManager.setActiveWindow('tag')
    } else if (event.data.type === 'weilin_prompt_ui_openTagManager_prompt') {
      tagManager.value = 'prompt'
      windows.value.tag.visible = true
      windowManager.setActiveWindow('tag')
    } else if (event.data.type === 'weilin_prompt_ui_openPromptBox') {
      // 按钮点击打开promptBox

      thisEditPromptId.value = event.data.id
      promptManager.value = 'prompt'
      windows.value.prompt.visible = true
      // 等待组件 ref 准备好
      waitForRef(promptBoxRef, (ref) => {
        ref.setPromptText(event.data.prompt)
        ref.setCurrentEditNodeId(event.data.id)
      })
      windowManager.setActiveWindow('prompt')
    } else if (event.data.type === 'weilin_prompt_ui_openHistoryManager') {
      windows.value.history.visible = true
      windowManager.setActiveWindow('history')
    } else if (event.data.type === 'weilin_prompt_ui_open_node_list_window') {
      windows.value.node_list_window.visible = true
      windowManager.setActiveWindow('node_list_window')
    } else if (event.data.type === 'weilin_prompt_ui_prompt_finish_prompt') {
      window.postMessage(
        {
          type: `weilin_prompt_ui_prompt_update_prompt_${thisEditPromptId.value}`,
          data: event.data.data
        },
        '*'
      )
    } else if (event.data.type === 'weilin_prompt_ui_open_global_prompt_box') {
      promptManager.value = 'prompt_global'
      thisEditPromptId.value = 'global'
      windows.value.prompt.visible = true
      waitForRef(promptBoxRef, (ref) => {
        ref.setPromptText(globalPrompt.value)
      })
      windowManager.setActiveWindow('prompt')
    } else if (event.data.type === 'weilin_prompt_ui_open_global_tag_manager') {
      tagManager.value = 'manager'
      windows.value.tag.visible = true
      windowManager.setActiveWindow('tag')
    } else if (event.data.type === 'weilin_prompt_ui_prompt_update_prompt_global') {
      globalPrompt.value = event.data.data
    } else if (event.data.type === 'weilin_prompt_ui_restore_window') {
      restoreWindowsToDefault()
    } else if (event.data.type === 'weilin_prompt_ui_open_cloud_window') {
      windows.value.cloud_window.visible = true
      windowManager.setActiveWindow('cloud_window')
    } else if (event.data.type === 'weilin_prompt_ui_open_danbooru_manager_window') {
      windows.value.danbooru_manager_window.visible = true
      windowManager.setActiveWindow('danbooru_manager_window')
    } else if (event.data.type === 'weilin_prompt_ui_prompt_inner_get_node_tag_template_id') {
      window.postMessage(
        {
          type: `weilin_prompt_ui_get_template_${thisEditPromptId.value}`,
          data: event.data.data
        },
        '*'
      )
    } else if (event.data.type === 'weilin_prompt_ui_get_template_response') {
      if (thisEditPromptId.value === event.data.id) {
        window.postMessage(
          {
            type: 'weilin_prompt_ui_prompt_inner_get_node_tag_template_id_response',
            data: event.data.data
          },
          '*'
        )
      }
    } else if (event.data.type === 'weilin_prompt_ui_prompt_inner_update_node_tag_template_id') {
      window.postMessage(
        {
          type: `weilin_prompt_ui_update_template_${thisEditPromptId.value}`,
          data: event.data.data
        },
        '*'
      )
    } else if (
      event.data.type === 'weilin_prompt_ui_prompt_inner_get_node_tag_template_id_gorandom'
    ) {
      window.postMessage(
        {
          type: `weilin_prompt_ui_get_template_go_random_${thisEditPromptId.value}`,
          data: event.data.data
        },
        '*'
      )
    } else if (event.data.type === 'weilin_prompt_ui_get_template_go_random_response') {
      if (thisEditPromptId.value === event.data.id) {
        window.postMessage(
          {
            type: 'weilin_prompt_ui_prompt_inner_get_node_tag_template_id_go_random_response',
            data: event.data.data
          },
          '*'
        )
      }
    }
  }
</script>

<style scoped></style>

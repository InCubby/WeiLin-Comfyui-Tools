<template>
  <div class="main-label-manager">
    <div class="mlm-header">
      <input v-model="search" class="mlm-search" type="text" placeholder="搜索标签…" />
      <button class="mlm-add" @click="createNew">+ 新建标签</button>

      <!-- 导入导出按钮区域 -->
      <div class="mlm-io-grid">
        <button class="mlm-export" @click="exportToJSON" title="导出提示词数据到JSON文件">
          导出数据
        </button>
        <button class="mlm-import" @click="triggerImport" title="从JSON文件导入提示词数据">
          导入数据
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="importFromJSON"
      />

      <!-- 排序和编辑按钮区域 -->
      <div class="mlm-grid">
        <button class="mlm-sort" @click="toggleTimeSort">
          按时间 {{ sortTimeDesc ? '后→先' : '先→后' }}
        </button>
        <button class="mlm-sort" @click="toggleNameSort">
          按名称 {{ sortNameAsc ? 'A→Z' : 'Z→A' }}
        </button>
        <button class="mlm-edit" :disabled="!current" @click="renameSelected">编辑</button>
        <button class="mlm-delete" :disabled="!current" @click="deleteSelected">删除</button>
      </div>
    </div>

    <transition-group name="mlm" tag="div" class="mlm-list">
      <div
        v-for="(item, idx) in sortedList"
        :key="item.id"
        :class="[
          'mlm-item',
          {
            active: item.id === internalSelectedId,
            highlighted: !!item.highlighted
          },
          { dragging: draggingId === item.id, 'drag-over': dragOverId === item.id }
        ]"
        @click="selectItem(item)"
        :title="item.updatedAt ? formatTime(item.updatedAt) : ''"
        draggable="true"
        @dragstart="onDragStart(item, idx, $event)"
        @dragenter.prevent="onDragEnter(item)"
        @dragover.prevent
        @drop.prevent="onDrop(item)"
        @dragend="onDragEnd"
      >
        <div class="mlm-item-main">
          <span class="mlm-name">{{ item.name }}</span>
        </div>

        <div class="mlm-item-actions">
          <!-- 高亮：实心星星 -->
          <button
            :class="['mini-btn', 'highlight', { active: item.highlighted }]"
            :title="item.highlighted ? '取消高亮' : '高亮'"
            @click.stop="toggleHighlight(item)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path
                d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, defineExpose } from 'vue'
  import axios from 'axios'

  const API_BASE = '/weilin/prompt_ui/api/'

  const props = defineProps({ selectedId: { type: String, default: null } })
  const emit = defineEmits(['select'])

  const fileInput = ref(null)

  const search = ref('')
  const items = ref([]) // { id, name, content, createdAt, updatedAt, highlighted, order }
  const internalSelectedId = ref(props.selectedId)

  const sortTimeDesc = ref(true)
  const sortNameAsc = ref(true)
  const sortMode = ref('time') // 'time' | 'name' | 'manual'

  // drag state
  const draggingId = ref(null)
  const dragOverId = ref(null)

  /** ---------------- 持久化 ---------------- **/
  async function save() {
    const payload = {
      items: items.value,
      settings: {
        sortMode: sortMode.value,
        sortTimeDesc: sortTimeDesc.value,
        sortNameAsc: sortNameAsc.value,
        selectedId: internalSelectedId.value
      }
    }

    try {
      await axios.post(`${API_BASE}labels/save`, payload)
    } catch (error) {
      console.error('保存标签数据失败:', error)
      alert(`保存失败: ${error.message}`)
    }
  }

  async function load() {
    try {
      const response = await axios.get(`${API_BASE}labels/get`)
      const parsed = response.data?.data

      if (!parsed) {
        throw new Error('no data')
      }

      // 兼容旧数据（纯数组）与新数据（带 settings）
      const loadedItems = Array.isArray(parsed) ? parsed : (parsed?.items ?? [])
      const settings = Array.isArray(parsed) ? {} : (parsed?.settings ?? {})

      items.value = loadedItems.map((i, idx) => ({
        id: i.id ?? genId(),
        name: i.name ?? '未命名',
        content: i.content ?? '',
        createdAt: i.createdAt ?? i.updatedAt ?? Date.now(),
        updatedAt: i.updatedAt ?? i.createdAt ?? Date.now(),
        highlighted: !!i.highlighted,
        order: typeof i.order === 'number' ? i.order : idx
      }))

      if (settings.sortMode) {
        sortMode.value = settings.sortMode
      }
      if (typeof settings.sortTimeDesc === 'boolean') {
        sortTimeDesc.value = settings.sortTimeDesc
      }
      if (typeof settings.sortNameAsc === 'boolean') {
        sortNameAsc.value = settings.sortNameAsc
      }
      if (typeof settings.selectedId === 'string' || settings.selectedId === null) {
        internalSelectedId.value = settings.selectedId
      }
    } catch (error) {
      console.error('加载标签数据失败:', error)
      items.value = []
    }
  }

  /** ---------------- 生命周期 ---------------- **/
  onMounted(async () => {
    // 等待数据加载完成
    await load()
  })

  // 外部 selectedId 改变时同步内部
  watch(
    () => props.selectedId,
    (v) => {
      internalSelectedId.value = v
    }
  )

  // 排序设置变化时立即保存
  watch([sortMode, sortTimeDesc, sortNameAsc], () => {
    save()
  })

  // items 的任何变化（包含 order、highlight、name、content）都持久化
  watch(
    items,
    () => {
      save()
    },
    { deep: true }
  )

  // 选中项变化也一并保存，保证恢复到上次选中
  watch(internalSelectedId, (v) => {
    save()
    const node = v ? getById(v) : null
    // 向父组件同步"真正的选中项"（修复：刷新后父组件不知情）
    emit('select', node ? { ...node } : null)
  })

  /** ---------------- 计算属性 ---------------- **/
  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) {
      return items.value
    }
    return items.value.filter((i) => (i.name || '').toLowerCase().includes(q))
  })

  const sortedList = computed(() => {
    const arr = [...filtered.value]

    // 手动排序：仅按 order
    if (sortMode.value === 'manual') {
      return arr.sort((a, b) => {
        const ao = a.order ?? 0
        const bo = b.order ?? 0
        if (ao !== bo) {
          return ao - bo
        }
        // fallback by created time 保持稳定
        return (a.createdAt ?? 0) - (b.createdAt ?? 0)
      })
    }

    // 按名称/时间排序
    const cmpName = (a, b) => {
      const na = a.name || ''
      const nb = b.name || ''
      let cmp = na.localeCompare(nb, undefined, { numeric: true, sensitivity: 'base' })
      if (!sortNameAsc.value) {
        cmp = -cmp
      }
      return cmp
    }

    const cmpTime = (a, b) => {
      let cmp = a.createdAt - b.createdAt
      if (sortTimeDesc.value) {
        cmp = -cmp
      }
      return cmp
    }

    arr.sort((a, b) => {
      if (sortMode.value === 'name') {
        const n = cmpName(a, b)
        if (n !== 0) {
          return n
        }
        return cmpTime(a, b)
      }
      const t = cmpTime(a, b)
      if (t !== 0) {
        return t
      }
      return cmpName(a, b)
    })

    return arr
  })

  const current = computed(() => getById(internalSelectedId.value))

  /** ---------------- 工具函数 ---------------- **/
  function genId() {
    return `mlm_${Math.random().toString(36).slice(2)}_${Date.now()}`
  }

  function getById(id) {
    return items.value.find((i) => i.id === id) || null
  }

  function selectItem(item) {
    internalSelectedId.value = item.id
    emit('select', { ...item })
  }

  function createNew() {
    const name = window.prompt('新建标签名称：', '')
    if (!name) {
      return
    }

    // ① 先把“当前视觉顺序”播种到 order；再切到手动模式
    ensureManualOrderSeed()
    sortMode.value = 'manual'

    const id = genId()
    const now = Date.now()

    // ② 找到当前最小的 order，新项取 minOrder - 1，确保排在最上方
    const minOrder = items.value.reduce(
      (m, x) => (typeof x.order === 'number' ? Math.min(m, x.order) : m),
      0
    )

    const obj = {
      id,
      name: name.trim(),
      content: '',
      createdAt: now,
      updatedAt: now,
      highlighted: false,
      order: minOrder - 1
    }

    items.value.push(obj)
    save()
    internalSelectedId.value = id
    emit('select', { ...obj })
  }

  function renameSelected() {
    const node = current.value
    if (!node) {
      return
    }
    const name = window.prompt('重命名标签：', node.name || '')
    if (!name) {
      return
    }
    node.name = name.trim()
    node.updatedAt = Date.now()
    save()
  }

  function deleteSelected() {
    const node = current.value
    if (!node) {
      return
    }
    if (!window.confirm(`确定删除标签"${node.name}"吗？`)) {
      return
    }
    const idx = items.value.findIndex((i) => i.id === node.id)
    if (idx >= 0) {
      items.value.splice(idx, 1)
    }
    save()
    if (items.value.length) {
      internalSelectedId.value = items.value[0].id
      emit('select', { ...items.value[0] })
    } else {
      internalSelectedId.value = null
      emit('select', null)
    }
  }

  function toggleTimeSort() {
    sortMode.value = 'time'
    sortTimeDesc.value = !sortTimeDesc.value
  }
  function toggleNameSort() {
    sortMode.value = 'name'
    sortNameAsc.value = !sortNameAsc.value
  }

  function toggleHighlight(item) {
    item.highlighted = !item.highlighted
    item.updatedAt = Date.now()
    save()
  }

  function updateSelectedContent(newContent) {
    const n = current.value
    if (!n) {
      return
    }
    n.content = newContent ?? ''
    n.updatedAt = Date.now()
    clearTimeout(updateTimer)
    updateTimer = setTimeout(() => save(), 400)
  }

  let updateTimer = null

  function formatTime(ts) {
    try {
      const d = new Date(ts)
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    } catch {
      return ''
    }
  }

  // ===== Drag-and-drop manual sort =====
  function ensureManualOrderSeed() {
    // 将"当前视觉顺序"写入 order；之后 manual 模式只看 order，不再受分组影响
    const list = sortedList.value
    list.forEach((it, i) => {
      it.order = i
    })
  }

  function onDragStart(item, idx, ev) {
    try {
      ev.dataTransfer.effectAllowed = 'move'
    } catch (e) {
      // 忽略错误
    }
    draggingId.value = item.id
    dragOverId.value = null
    // 先根据当前视觉顺序播种 order，再切换到手动模式
    ensureManualOrderSeed()
    sortMode.value = 'manual'
  }

  function onDragEnter(item) {
    if (!draggingId.value) {
      return
    }
    dragOverId.value = item.id
  }

  function onDrop(targetItem) {
    if (!draggingId.value) {
      return
    }
    const fromId = draggingId.value
    const toId = targetItem?.id
    if (!toId || fromId === toId) {
      return onDragEnd()
    }

    const list = [...sortedList.value] // manual 下这里已经是按 order 排的
    const from = list.findIndex((x) => x.id === fromId)
    const to = list.findIndex((x) => x.id === toId)
    if (from < 0 || to < 0) {
      return onDragEnd()
    }
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    list.forEach((it, i) => {
      it.order = i
    })
    save()
    onDragEnd()
  }

  function onDragEnd() {
    draggingId.value = null
    dragOverId.value = null
  }

  /** ---------------- 导出/导入功能 ---------------- **/
  function exportToJSON() {
    try {
      // 获取完整的数据
      const payload = {
        items: items.value,
        settings: {
          sortMode: sortMode.value,
          sortTimeDesc: sortTimeDesc.value,
          sortNameAsc: sortNameAsc.value,
          selectedId: internalSelectedId.value
        },
        exportTime: new Date().toISOString(),
        version: 'v1'
      }

      // 转换为JSON字符串
      const jsonStr = JSON.stringify(payload, null, 2)

      // 创建Blob对象
      const blob = new Blob([jsonStr], { type: 'application/json' })

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // 生成文件名：weilin_prompt_labels_YYYYMMDD_HHMMSS.json
      const now = new Date()
      const dateStr =
        now.getFullYear() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0')
      const timeStr =
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0')
      a.download = `weilin_prompt_labels_${dateStr}_${timeStr}.json`

      // 触发下载
      document.body.appendChild(a)
      a.click()

      // 清理
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert(`导出成功！共导出 ${items.value.length} 个标签`)
    } catch (error) {
      console.error('导出失败:', error)
      alert(`导出失败: ${error.message}`)
    }
  }

  function triggerImport() {
    // 触发隐藏的文件选择器
    fileInput.value?.click()
  }

  function importFromJSON(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const content = e.target?.result
        if (typeof content !== 'string') {
          throw new Error('文件读取失败')
        }

        const parsed = JSON.parse(content)

        // 验证数据格式
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('JSON格式不正确')
        }

        // 兼容旧格式（纯数组）和新格式（带settings）
        const importedItems = Array.isArray(parsed) ? parsed : (parsed?.items ?? [])
        const importedSettings = Array.isArray(parsed) ? {} : (parsed?.settings ?? {})

        if (!Array.isArray(importedItems)) {
          throw new Error('数据格式错误：未找到items数组')
        }

        // 询问用户是合并还是替换
        const mode = window.confirm(
          `检测到 ${importedItems.length} 个标签\n\n` +
            '点击"确定"将替换当前所有数据\n' +
            '点击"取消"将合并导入（保留现有数据）'
        )
          ? 'replace'
          : 'merge'

        if (mode === 'replace') {
          // 替换模式：直接替换所有数据
          items.value = importedItems.map((i, idx) => ({
            id: i.id ?? genId(),
            name: i.name ?? '未命名',
            content: i.content ?? '',
            createdAt: i.createdAt ?? i.updatedAt ?? Date.now(),
            updatedAt: i.updatedAt ?? i.createdAt ?? Date.now(),
            highlighted: !!i.highlighted,
            order: typeof i.order === 'number' ? i.order : idx
          }))

          // 恢复设置
          if (importedSettings.sortMode) {
            sortMode.value = importedSettings.sortMode
          }
          if (typeof importedSettings.sortTimeDesc === 'boolean') {
            sortTimeDesc.value = importedSettings.sortTimeDesc
          }
          if (typeof importedSettings.sortNameAsc === 'boolean') {
            sortNameAsc.value = importedSettings.sortNameAsc
          }

          // 选中第一个或导入的selectedId
          const targetId =
            importedSettings.selectedId &&
            items.value.find((i) => i.id === importedSettings.selectedId)
              ? importedSettings.selectedId
              : (items.value[0]?.id ?? null)
          internalSelectedId.value = targetId
        } else {
          // 合并模式：检查ID冲突，重新生成ID
          const existingIds = new Set(items.value.map((i) => i.id))
          const maxOrder = items.value.reduce(
            (m, x) => Math.max(m, typeof x.order === 'number' ? x.order : m),
            -1
          )

          let addedCount = 0
          importedItems.forEach((i, idx) => {
            let finalId = i.id
            // 如果ID冲突，重新生成
            if (existingIds.has(finalId)) {
              finalId = genId()
            }
            existingIds.add(finalId)

            items.value.push({
              id: finalId,
              name: i.name ?? '未命名',
              content: i.content ?? '',
              createdAt: i.createdAt ?? i.updatedAt ?? Date.now(),
              updatedAt: i.updatedAt ?? i.createdAt ?? Date.now(),
              highlighted: !!i.highlighted,
              order: typeof i.order === 'number' ? maxOrder + 1 + idx : maxOrder + 1 + idx
            })
            addedCount++
          })

          alert(`合并成功！新增 ${addedCount} 个标签，当前共 ${items.value.length} 个标签`)
        }

        // 保存到服务器（tag_labels.json）
        await save()

        if (mode === 'replace') {
          alert(`导入成功！已替换为 ${items.value.length} 个标签`)
        }
      } catch (error) {
        console.error('导入失败:', error)
        alert(`导入失败: ${error.message}`)
      } finally {
        // 清空文件选择器，允许重复导入同一文件
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      }
    }

    reader.onerror = () => {
      alert('文件读取失败')
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    reader.readAsText(file)
  }

  defineExpose({ updateSelectedContent })
</script>

<style scoped>
  .main-label-manager {
    width: 280px;
    min-width: 280px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 12px 8px 12px 4px;
    border-right: 1px solid var(--weilin-prompt-ui-border-color);
    background: var(--weilin-prompt-ui-primary-bg);
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .mlm-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mlm-search {
    width: 100%;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--weilin-prompt-ui-border-color);
    background: var(--weilin-prompt-ui-input-bg);
    color: var(--weilin-prompt-ui-primary-text);
    padding: 0 8px;
  }

  .mlm-add {
    background: #28a745;
    color: #fff;
    border: none;
    border-radius: 6px;
    height: 32px;
    width: 100%;
    cursor: pointer;
  }

  .mlm-io-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }

  .mlm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }

  .mlm-list {
    margin-top: 8px;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
  }

  .mlm-list::-webkit-scrollbar {
    width: 6px;
  }

  .mlm-list::-webkit-scrollbar-thumb {
    background: var(--weilin-prompt-ui-scrollbar-thumb);
    border-radius: 3px;
  }

  /* ========== 列表项样式 ========== */
  .mlm-item {
    position: relative; /* 方便子元素绝对定位时参照 */
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 38px;
    padding: 10px;
    margin: 6px 0;
    background: var(--weilin-prompt-ui-secondary-bg);
    color: var(--weilin-prompt-ui-primary-text);
    border-radius: 10px;
    border: 1px solid var(--weilin-prompt-ui-border-color);
    transition:
      background 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease,
      transform 0.1s ease;
  }

  .mlm-item.dragging {
    opacity: 0.6;
  }

  .mlm-item.drag-over {
    outline: 2px dashed var(--weilin-prompt-ui-primary-color);
    outline-offset: 2px;
    box-shadow: none !important;
  }

  .mlm-item:hover {
    background: color-mix(in srgb, var(--weilin-prompt-ui-secondary-bg) 90%, #fff 10%);
    border-color: color-mix(in srgb, var(--weilin-prompt-ui-border-color) 40%, #fff 20%);
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);
    transform: translateY(-1px);
  }

  /* .mlm-item.active:not(.drag-over) {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, #5cb85c 100%, transparent);
} */
  .mlm-item.active:not(.drag-over) {
    outline: none;
    border-color: transparent; /* 清除原边框颜色 */
    box-shadow: inset 0 0 0 2px #22c55e; /* 内描边，不会被裁掉 */
  }

  /* 高亮行：浅蓝底 + 左侧色条 + 阴影 */
  .mlm-item.highlighted {
    background: color-mix(
      in srgb,
      var(--weilin-prompt-ui-primary-color) 12%,
      var(--weilin-prompt-ui-secondary-bg)
    );
    border-left: 4px solid var(--weilin-prompt-ui-primary-color);
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.2);
  }

  .mlm-item.highlighted:hover {
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.3);
  }

  .mlm-item-main {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .mlm-name {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .mlm-item-actions {
    display: flex;
    gap: 6px;
  }

  /* ========== 操作按钮样式 ========== */
  .mini-btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #000;
    background: transparent;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      transform 0.1s ease;
  }

  .mini-btn:hover {
    background: rgb(255 255 255 / 0.06);
  }

  .mini-btn:active {
    transform: translateY(1px);
  }

  .mini-btn:focus-visible {
    outline: 2px solid color-mix(in srgb, #fff 50%, transparent);
    outline-offset: 2px;
  }

  .mini-btn svg {
    width: 18px;
    height: 18px;
  }

  /* 激活态：高亮=蓝底白图标 */
  .mini-btn.highlight.active {
    background: var(--weilin-prompt-ui-primary-color);
    border-color: var(--weilin-prompt-ui-primary-color);
    color: #fff;
  }

  /* ========== 排序/编辑/删除按钮 ========== */
  .mlm-sort,
  .mlm-edit,
  .mlm-delete,
  .mlm-export,
  .mlm-import {
    height: 32px;
    width: 100%;
    font-size: 12px;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--weilin-prompt-ui-border-color) 70%, transparent);
    background: color-mix(in srgb, var(--weilin-prompt-ui-button-bg) 90%, #000 10%);
    color: var(--weilin-prompt-ui-button-text);
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
    cursor: pointer;
  }

  .mlm-sort:hover,
  .mlm-edit:hover,
  .mlm-delete:hover,
  .mlm-export:hover,
  .mlm-import:hover {
    background: color-mix(in srgb, var(--weilin-prompt-ui-button-bg) 80%, #fff 20%);
  }

  .mlm-delete {
    color: #ff6b6b;
    background: color-mix(in srgb, #ff6b6b 10%, transparent);
    border-color: color-mix(in srgb, #ff6b6b 30%, transparent);
  }

  .mlm-export {
    color: #3b82f6;
    background: color-mix(in srgb, #3b82f6 10%, transparent);
    border-color: color-mix(in srgb, #3b82f6 30%, transparent);
  }

  .mlm-export:hover {
    background: color-mix(in srgb, #3b82f6 20%, transparent);
  }

  .mlm-import {
    color: #10b981;
    background: color-mix(in srgb, #10b981 10%, transparent);
    border-color: color-mix(in srgb, #10b981 30%, transparent);
  }

  .mlm-import:hover {
    background: color-mix(in srgb, #10b981 20%, transparent);
  }

  .mlm-grid button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* transition-group move animation */
  .mlm-move {
    transition: transform 0.18s ease;
  }

  .mlm-enter-active,
  .mlm-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .mlm-enter-from,
  .mlm-leave-to {
    opacity: 0.01;
    transform: scale(0.98);
  }
</style>

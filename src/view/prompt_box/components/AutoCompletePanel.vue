<template>
  <div
    ref="containerRef"
    class="autocomplete-container"
    :style="{
      top: `${top}px`,
      left: `${left}px`,
      display: visible ? 'block' : 'none',
      width: `${width}px`,
      maxHeight: `${maxHeight}px`
    }"
  >
    <button class="close-autocomplete-btn" @click.stop="emit('close')">x</button>
    <div
      v-for="(item, index) in results"
      :key="index"
      class="autocomplete-item"
      :class="{ selected: index === selectedIndex }"
      @click.stop="emitSelect(index)"
      :ref="(el) => setItemRef(el, index)"
    >
      <span class="tag">{{ item.text }}</span>
      <span class="desc">{{ item.desc }}</span>
    </div>
    <div v-if="visible && !isLoading && results.length === 0" class="autocomplete-empty">
      No results
    </div>
    <div v-if="visible && isLoading" class="autocomplete-empty">Loading...</div>
  </div>
</template>

<script setup>
  import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import { autocompleteApi } from '@/api/autocomplete'

  const emit = defineEmits(['select', 'close', 'results-change'])

  const props = defineProps({
    visible: { type: Boolean, default: false },
    query: { type: String, default: '' },
    selectedIndex: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    width: { type: [Number, String], default: 450 },
    maxHeight: { type: [Number, String], default: 350 },
    registerContainerRef: { type: Function, default: null }
  })

  const containerRef = ref(null)
  const itemRefs = ref([])
  const results = ref([])
  const isLoading = ref(false)
  const requestId = ref(0)

  const numericValue = (value, fallback) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const top = ref(0)
  const left = ref(0)
  const width = ref(450)
  const maxHeight = ref(350)

  watch(
    () => props.top,
    (value) => {
      top.value = numericValue(value, 0)
    },
    { immediate: true }
  )

  watch(
    () => props.left,
    (value) => {
      left.value = numericValue(value, 0)
    },
    { immediate: true }
  )

  watch(
    () => props.width,
    (value) => {
      width.value = numericValue(value, 450)
    },
    { immediate: true }
  )

  watch(
    () => props.maxHeight,
    (value) => {
      maxHeight.value = numericValue(value, 350)
    },
    { immediate: true }
  )

  const setItemRef = (el, index) => {
    if (el) {
      itemRefs.value[index] = el
    }
  }

  const syncContainerRef = () => {
    props.registerContainerRef?.(containerRef.value || null)
  }

  const clearResults = () => {
    results.value = []
    itemRefs.value = []
    emit('results-change', [])
  }

  const fetchAutocomplete = async () => {
    const query = String(props.query || '').trim().toLowerCase()
    if (!props.visible || !query || query.length > 20) {
      clearResults()
      isLoading.value = false
      return
    }

    const currentRequestId = ++requestId.value
    isLoading.value = true

    try {
      const res = await autocompleteApi.getAutocomplete(query)
      if (currentRequestId !== requestId.value) return
      results.value = Array.isArray(res?.data) ? res.data : []
      itemRefs.value = []
      emit('results-change', results.value)
    } catch {
      if (currentRequestId !== requestId.value) return
      clearResults()
    } finally {
      if (currentRequestId === requestId.value) {
        isLoading.value = false
      }
    }
  }

  const emitSelect = (index) => {
    const item = results.value[index]
    if (!item) return
    emit('select', { index, item })
  }

  const scrollToSelected = () => {
    nextTick(() => {
      const container = containerRef.value
      if (!container) return
      const selected = itemRefs.value[props.selectedIndex]
      if (!selected) return

      const containerRect = container.getBoundingClientRect()
      const selectedRect = selected.getBoundingClientRect()
      const isAbove = selectedRect.top < containerRect.top
      const isBelow = selectedRect.bottom > containerRect.bottom

      if (isAbove) {
        container.scrollTop += selectedRect.top - containerRect.top
      } else if (isBelow) {
        container.scrollTop += selectedRect.bottom - containerRect.bottom
      }
    })
  }

  watch(() => props.query, fetchAutocomplete)
  watch(() => props.visible, fetchAutocomplete)
  watch(() => props.selectedIndex, scrollToSelected)
  watch(results, scrollToSelected)

  onMounted(() => {
    syncContainerRef()
    fetchAutocomplete()
  })

  onUnmounted(() => {
    props.registerContainerRef?.(null)
  })
</script>

<style scoped>
  .autocomplete-container {
    position: absolute;
    z-index: 12000;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
    padding: 8px 0;
    margin-top: 4px;
    background-color: var(--weilin-prompt-ui-primary-bg);
    max-width: calc(100% - 16px);
  }

  .close-autocomplete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--weilin-prompt-ui-primary-bg);
    border: 1px solid var(--weilin-prompt-ui-border-color);
    border-radius: 50%;
    color: var(--weilin-prompt-ui-primary-text);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .close-autocomplete-btn:hover {
    background-color: var(--weilin-prompt-ui-danger-color);
  }

  .autocomplete-item {
    display: flex;
    flex-direction: row;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    align-items: center;
  }

  .autocomplete-item:hover {
    color: var(--weilin-prompt-ui-primary-text);
    background-color: var(--weilin-prompt-ui-hover-bg-color);
  }

  .autocomplete-item.selected {
    color: var(--weilin-prompt-ui-primary-text);
    background-color: var(--weilin-prompt-ui-primary-color);
  }

  .tag {
    width: 65%;
    font-weight: 500;
    color: var(--weilin-prompt-ui-primary-text);
    font-size: 14px;
  }

  .desc {
    width: 35%;
    padding-left: 20px;
    color: var(--weilin-prompt-ui-primary-text);
    font-size: 14px;
    box-sizing: border-box;
  }

  .autocomplete-empty {
    padding: 8px 12px;
    color: var(--weilin-prompt-ui-primary-text);
    font-size: 13px;
    opacity: 0.85;
  }
</style>

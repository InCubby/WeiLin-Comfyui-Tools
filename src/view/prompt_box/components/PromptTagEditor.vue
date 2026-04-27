<template>
  <div class="prompt-tag-editor">
    <div style="position: relative" ref="parentCenterBoxRef">
      <textarea
        :value="inputText"
        class="input-area"
        @input="handleInput"
        :placeholder="t('promptBox.placeholder')"
        @keydown="handleKeydown"
        @blur="onBlur"
        rows="6"
        :ref="setInputAreaRef"
        @mouseup="saveTextareaHeight"
        @resize="saveTextareaHeight"
      ></textarea>

      <div class="token-counter">{{ tokenCount }} tokens</div>

      <AutoCompletePanel
        :visible="showAutocomplete"
        :query="autocompleteQuery"
        :top="autocompletePosition.top"
        :left="adjustedAutocompletePosition.left"
        :width="saveAutoCompleteWidth"
        :max-height="saveAutoCompleteHeight"
        :selected-index="selectedAutocompleteIndex"
        :register-container-ref="setAutocompleteContainerRef"
        @select="handleAutocompleteSelect"
        @close="closeAutocomplete"
        @results-change="handleAutocompleteResultsChange"
      />
    </div>

    <div class="prompt-input-translate-area">
      <button
        v-if="isTranslateTagEnabled"
        class="translate-btn random-tag-settings-btn"
        @click="oneClickTranslatePrompt"
        :title="t('promptBox.oneClickTranslate')"
      >
        <svg
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          class="token-item-icon"
          width="24"
          height="24"
        >
          <path
            d="M677.676657 294.6142c19.165116 57.5433 44.715939 102.2992 89.431879 147.0551 38.322239-38.3622 63.873063-89.5118 83.038178-147.0551h-172.470057z m-421.56861 319.685h166.076358l-83.038179-223.7795-83.038179 223.7795z"
            p-id="2419"
          />
          <path
            d="M894.854661 0.504H128.353929C58.095158 0.504 0.607803 58.0473 0.607803 128.378v767.244c0 70.3307 57.487355 127.874 127.746126 127.874h766.500733c70.258771 0 127.746126-57.5433 127.746126-127.874V128.378c0-70.3307-51.101647-127.874-127.746126-127.874zM581.867062 825.2913c-12.771416 12.7874-25.550824 12.7874-38.322239 12.7874-6.3937 0-19.165116 0-25.550824-6.3937-6.3937-6.3937-12.779408 0-12.779408-6.3937s-6.385708-12.7874-12.771415-25.5748c-6.3937-12.7874-6.3937-19.1811-12.779408-31.9685l-25.542832-70.3307H230.557224L205.0064 767.748c-12.771416 25.5748-19.165116 44.7559-25.550824 57.5433-6.3937 12.7874-19.165116 12.7874-38.322239 12.7874-12.779408 0-25.550824-6.3937-38.330231-12.7874-12.771416-12.7874-19.157124-19.1811-19.157124-31.9685 0-6.3937 0-12.7874 6.385708-25.5748 6.3937-12.7874 6.3937-19.1811 12.771416-31.9685l140.525533-358.0472c6.3937-12.7874 6.3937-25.5748 12.779408-38.3622 6.385708-12.7874 12.771416-25.5748 19.157124-31.9685 6.3937-6.3937 12.779408-19.1811 25.550823-25.5748 12.779408-6.3937 25.550824-6.3937 38.330232-6.3937 12.771416 0 25.542832 0 38.322239 6.3937 12.771416 6.3937 19.165116 12.7874 25.550824 25.5748 6.385708 6.3937 12.771416 19.1811 19.157124 31.9685 6.3937 12.7874 12.779408 25.5748 19.165115 44.7559l140.525534 351.6535c12.771416 25.5748 19.165116 44.7559 19.165116 57.5433-6.3937 6.3937-12.779408 19.1811-19.165116 31.9685zM933.176901 575.937c-70.258771-25.5748-121.360418-57.5433-166.076358-95.9055-44.707947 44.7559-102.195302 76.7244-172.462065 95.9055l-19.157124-31.9685c70.258771-19.1811 127.746126-44.7559 172.462066-89.5118C703.22748 409.7008 664.905241 352.1575 652.125833 288.2205h-63.873063v-25.5748h172.470058c-12.7874-19.1811-25.558816-44.7559-38.330232-63.937l19.157124-6.3937c12.779408 19.1811 31.944524 44.7559 44.715939 70.3307h159.682658v31.9685h-63.873063c-19.157124 63.937-51.093655 121.4803-89.423887 159.8425 44.715939 38.3622 95.809594 70.3307 166.076358 89.5118l-25.550824 31.9685z"
            p-id="2420"
          />
        </svg>
        <span style="margin-left: 5px" class="action-text">{{
          t('promptBox.oneClickTranslate')
        }}</span>
      </button>

      <button
        v-if="isDeleteButtonEnabled"
        class="translate-btn toggle-delete-btn"
        @click="toggleDeleteButton"
        :title="
          showDeleteButton ? t('promptBox.hideDeleteButton') : t('promptBox.showDeleteButton')
        "
        :class="{ active: showDeleteButton }"
      >
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          class="utils-item-icon"
          width="24"
          height="24"
        >
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            fill="currentColor"
          />
        </svg>
        <span class="action-text">{{
          showDeleteButton ? t('promptBox.hideDeleteButton') : t('promptBox.showDeleteButton')
        }}</span>
      </button>

      <button
        v-if="isClearAllEnabled"
        class="translate-btn clear-all-btn"
        @click="emit('clear-all')"
        :title="t('promptBox.oneClickCleanAll')"
      >
        <svg
          class="utils-item-icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1605"
          width="24"
          height="24"
        >
          <path
            d="M716.8 338.944H307.2v-102.4a76.8 76.8 0 0 1 76.8-76.8h256a77.312 77.312 0 0 1 76.8 76.8z m-358.4-51.2h307.2v-51.2a26.112 26.112 0 0 0-25.6-25.6h-256a25.6 25.6 0 0 0-25.6 25.6zM702.464 856.576H321.536A65.024 65.024 0 0 1 256 791.04V406.528a25.6 25.6 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v384.512a14.336 14.336 0 0 0 13.824 14.336h380.928a14.848 14.848 0 0 0 14.336-14.336V406.528a25.6 25.6 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v384.512a65.536 65.536 0 0 1-65.024 65.536z"
          />
          <path
            d="M432.128 678.912a25.6 25.6 0 0 1-25.6-25.6v-220.16a25.6 25.6 0 0 1 25.6-25.6 26.112 26.112 0 0 1 25.6 25.6v220.16a25.6 25.6 0 0 1-25.6 25.6z"
          />
          <path
            d="M593.408 678.912a25.6 25.6 0 0 1-25.6-25.6v-220.16a26.112 26.112 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v220.16a25.6 25.6 0 0 1-25.6 25.6z"
          />
          <path
            d="M828.416 338.944H196.096a25.6 25.6 0 0 1-25.6-25.6 25.6 25.6 0 0 1 25.6-25.6h632.32a25.6 25.6 0 0 1 25.6 25.6 25.6 25.6 0 0 1-25.6 25.6z"
          />
        </svg>
        <span class="action-text">{{ t('promptBox.oneClickCleanAll') }}</span>
      </button>

      <button
        v-if="isClearDisabledEnabled"
        class="translate-btn clear-disabled-btn"
        @click="emit('clear-disabled')"
        :title="t('promptBox.oneClickClearDisabled')"
      >
        <svg
          class="utils-item-icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1605"
          width="24"
          height="24"
        >
          <path
            d="M716.8 338.944H307.2v-102.4a76.8 76.8 0 0 1 76.8-76.8h256a77.312 77.312 0 0 1 76.8 76.8z m-358.4-51.2h307.2v-51.2a26.112 26.112 0 0 0-25.6-25.6h-256a25.6 25.6 0 0 0-25.6 25.6zM702.464 856.576H321.536A65.024 65.024 0 0 1 256 791.04V406.528a25.6 25.6 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v384.512a14.336 14.336 0 0 0 13.824 14.336h380.928a14.848 14.848 0 0 0 14.336-14.336V406.528a25.6 25.6 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v384.512a65.536 65.536 0 0 1-65.024 65.536z"
          />
          <path
            d="M432.128 678.912a25.6 25.6 0 0 1-25.6-25.6v-220.16a25.6 25.6 0 0 1 25.6-25.6 26.112 26.112 0 0 1 25.6 25.6v220.16a25.6 25.6 0 0 1-25.6 25.6z"
          />
          <path
            d="M593.408 678.912a25.6 25.6 0 0 1-25.6-25.6v-220.16a26.112 26.112 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v220.16a25.6 25.6 0 0 1-25.6 25.6z"
          />
          <path
            d="M828.416 338.944H196.096a25.6 25.6 0 0 1-25.6-25.6 25.6 25.6 0 0 1 25.6-25.6h632.32a25.6 25.6 0 0 1 25.6 25.6 25.6 25.6 0 0 1-25.6 25.6z"
          />
        </svg>
        <span class="action-text">{{ t('promptBox.oneClickClearDisabled') }}</span>
      </button>
    </div>

    <div class="tokens-container" v-if="tokens.length > 0">
      <template v-for="(token, index) in tokens" :key="'tag-wrapper-' + index">
        <PromptTagItem
          :token="token"
          :index="index"
          :is-drag-source="isDragSource(index)"
          :is-dragging="isDragging"
          :show-drop-indicator="shouldShowDropIndicator(index)"
          :show-delete-button="showDeleteButton"
          :is-text-translatable="isTextTranslatable"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @drag-over="handleDragOver"
          @drop="handleDrop"
          @toggle-hidden="toggleHidden"
          @show-controls="showControls"
          @mouse-leave="handleMouseLeave"
          @start-editing="startEditing"
          @token-edit="handleTokenEdit"
          @finish-editing="finishEditing"
          @delete-token="deleteToken"
          @translate-click="translateFunction"
          @register-input-ref="registerTokenInputRef"
        />
      </template>
      <div
        v-if="isDragging"
        class="token-drop-end-zone"
        @dragover.prevent="handleSlotDragOver(tokens.length, $event)"
        @drop.prevent="handleSlotDrop(tokens.length, $event)"
      ></div>
    </div>

    <div v-if="showTagTipsBox" class="tag-tips-box" :style="tagTipsPosition">
      <div class="tag-tips-content">
        <p v-html="t('promptBox.tagTips')"></p>
      </div>
    </div>

    <div
      v-show="activeControls !== null && tokens[activeControls]"
      class="token-controls"
      :style="controlsPosition"
      @mouseenter="isOverControls = true"
      @mouseleave="
        isOverControls = false;
        handleMouseLeave()
      "
    >
      <div class="weight-control">
        <input
          type="number"
          v-model.number="weightValue"
          step="0.1"
          class="weight-input"
          @change="applyWeight"
        />
        <span class="weight-label">{{ t('promptBox.weight') }}</span>
      </div>

      <button
        class="favour-btn"
        @click="openFavourTag(tokens[activeControls])"
        :title="t('promptBox.favour')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="#FFD700"
          />
        </svg>
      </button>

      <button @click="handleDelete" class="delete-btn" :title="t('promptBox.delete')">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>

      <div class="bracket-btn-group">
        <div class="bracket-btn-container">
          <div class="bracket-btn">()</div>
          <div class="vertical-btn-group">
            <button class="vertical-btn" @click="wrapWith('(')" :title="t('promptBox.addBracket')">
              +
            </button>
            <button
              class="vertical-btn"
              @click="removeLayer('(')"
              :title="t('promptBox.removeLayer')"
            >
              -
            </button>
          </div>
        </div>

        <div class="bracket-btn-container">
          <div class="bracket-btn">[]</div>
          <div class="vertical-btn-group">
            <button class="vertical-btn" @click="wrapWith('[')" :title="t('promptBox.addBracket')">
              +
            </button>
            <button
              class="vertical-btn"
              @click="removeLayer('[')"
              :title="t('promptBox.removeLayer')"
            >
              -
            </button>
          </div>
        </div>

        <div class="bracket-btn-container">
          <div class="bracket-btn">{}</div>
          <div class="vertical-btn-group">
            <button class="vertical-btn" @click="wrapWith('{')" :title="t('promptBox.addBracket')">
              +
            </button>
            <button
              class="vertical-btn"
              @click="removeLayer('{')"
              :title="t('promptBox.removeLayer')"
            >
              -
            </button>
          </div>
        </div>
      </div>

      <button
        class="line-token-btn"
        @click="handelLineToken"
        :title="t('promptBox.addLineToken')"
        style="margin-left: 8px"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 19h14v-2H5v2zm0-7h14v-2H5v2zm0-7v2h14V5H5z" fill="#888" />
          <path d="M7 17v-2h2v2H7zm0-7V8h2v2H7zm0-7V3h2v2H7z" fill="#4285f4" />
        </svg>
      </button>
    </div>

    <favourItem ref="favourItemRef" />
  </div>
</template>

<script setup>
  import {
    computed,
    nextTick,
    onBeforeUpdate,
    onMounted,
    onUnmounted,
    ref,
    watch
  } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { translatorApi } from '@/api/translator'
  import message from '@/utils/message'
  import AutoCompletePanel from './AutoCompletePanel.vue'
  import PromptTagItem from './PromptTagItem.vue'
  import favourItem from './favour.vue'
  import {
    convertChinesePunctuation,
    escapeTagBrackets,
    replaceUnderscoreWithSpace
  } from '../utils/promptStringUtils'

  const { t } = useI18n()

  const emit = defineEmits(['clear-all', 'clear-disabled'])

  const props = defineProps({
    onCommit: { type: Function, default: null },
    tokens: { type: Array, default: () => [] },
    isTextTranslatable: { type: Function, required: true }
  })

  const parentCenterBoxRef = ref(null)
  const inputAreaRef = ref(null)
  const autocompleteContainerRef = ref(null)
  const autocompletePosition = ref({ top: 0, left: 0 })
  const showAutocomplete = ref(false)
  const autocompleteResults = ref([])
  const selectedAutocompleteIndex = ref(0)
  const saveAutoCompleteWidth = ref(localStorage.getItem('weilin_prompt_ui_auto_box_width') || 450)
  const saveAutoCompleteHeight = ref(
    localStorage.getItem('weilin_prompt_ui_auto_box_height') || 350
  )
  const inputText = ref('')
  const tokenCount = ref(0)
  const autocompleteQuery = ref('')

  const setInputAreaRef = (el) => {
    inputAreaRef.value = el
  }

  const setAutocompleteContainerRef = (el) => {
    autocompleteContainerRef.value = el
  }

  const adjustedAutocompletePosition = computed(() => {
    if (!parentCenterBoxRef.value) return { left: autocompletePosition.value.left }

    const parentWidth = parentCenterBoxRef.value.offsetWidth
    const autocompleteWidth = Number(saveAutoCompleteWidth.value) || 450
    let left = autocompletePosition.value.left

    if (left + autocompleteWidth > parentWidth) {
      left = parentWidth - autocompleteWidth
    }
    if (left < 0) {
      left = 0
    }
    return { left }
  })

  const closeAutocomplete = () => {
    showAutocomplete.value = false
    autocompleteQuery.value = ''
  }

  const saveTextareaHeight = () => {
    if (inputAreaRef.value) {
      const height = inputAreaRef.value.style.height || `${inputAreaRef.value.offsetHeight}px`
      localStorage.setItem('weilinPromptTextAreaHeight', height)
    }
  }

  const restoreTextareaHeight = () => {
    const savedHeight = localStorage.getItem('weilinPromptTextAreaHeight')
    if (savedHeight && inputAreaRef.value) {
      inputAreaRef.value.style.height = savedHeight
    }
  }

  let autocompletePositionDebounceTimer = null
  const calculateAutocompletePosition = async () => {
    if (autocompletePositionDebounceTimer) {
      clearTimeout(autocompletePositionDebounceTimer)
    }
    autocompletePositionDebounceTimer = setTimeout(async () => {
      if (!inputAreaRef.value) return

      const textarea = inputAreaRef.value
      const cursorPos = textarea.selectionStart
      const container = textarea.parentNode
      if (!container) return

      await nextTick()

      const text = textarea.value.substring(0, cursorPos)
      const mirror = document.createElement('div')
      mirror.style.position = 'absolute'
      mirror.style.top = '0'
      mirror.style.left = '0'
      mirror.style.visibility = 'hidden'
      mirror.style.whiteSpace = 'pre-wrap'
      mirror.style.wordWrap = 'break-word'
      mirror.style.width = window.getComputedStyle(textarea).width
      mirror.style.font = window.getComputedStyle(textarea).font
      mirror.style.padding = window.getComputedStyle(textarea).padding

      const textNode = document.createTextNode(text)
      const cursorNode = document.createElement('span')
      cursorNode.textContent = '|'
      mirror.appendChild(textNode)
      mirror.appendChild(cursorNode)
      container.appendChild(mirror)

      const cursorRect = cursorNode.getBoundingClientRect()
      const parentRect = container.getBoundingClientRect()
      let top = cursorRect.top - parentRect.top + cursorRect.height
      let left = cursorRect.left - parentRect.left

      await nextTick()

      if (autocompleteContainerRef.value) {
        const autocompleteWidth = autocompleteContainerRef.value.offsetWidth
        const textareaWidth = textarea.offsetWidth
        const textareaLeft = textarea.getBoundingClientRect().left - parentRect.left
        if (left + autocompleteWidth > textareaLeft + textareaWidth) {
          left = textareaLeft + textareaWidth - autocompleteWidth
        }
        if (left < textareaLeft) {
          left = textareaLeft
        }
        left = Math.max(0, Math.min(left, parentRect.width - autocompleteWidth))
      }

      container.removeChild(mirror)
      autocompletePosition.value = { top, left }
      autocompletePositionDebounceTimer = null
    }, 50)
  }

  const updateAutocompletePosition = () => {
    if (showAutocomplete.value) {
      calculateAutocompletePosition()
    }
  }

  const setupCursorTracking = () => {
    const textarea = inputAreaRef.value
    if (!textarea) return
    textarea.addEventListener('keyup', updateAutocompletePosition)
    textarea.addEventListener('click', updateAutocompletePosition)
    textarea.addEventListener('input', updateAutocompletePosition)
  }

  const cleanupCursorTracking = () => {
    const textarea = inputAreaRef.value
    if (!textarea) return
    textarea.removeEventListener('keyup', updateAutocompletePosition)
    textarea.removeEventListener('click', updateAutocompletePosition)
    textarea.removeEventListener('input', updateAutocompletePosition)
  }

  const handleClickOutside = (event) => {
    if (
      showAutocomplete.value &&
      autocompleteContainerRef.value?.contains &&
      inputAreaRef.value?.contains &&
      !autocompleteContainerRef.value.contains(event.target) &&
      !inputAreaRef.value.contains(event.target)
    ) {
      showAutocomplete.value = false
    }
  }

  const calculateTokenCount = (text) => {
    if (!text || !text.trim()) return 0
    return text.trim().split(/\s+/).length
  }

  const applyPunctuationBySettings = (text) => {
    if (typeof text !== 'string' || !text) return text || ''
    let value = text
    if (localStorage.getItem('weilin_prompt_ui_comma_conversion') !== 'false') {
      value = value.replace(/，/g, ',')
    }
    if (localStorage.getItem('weilin_prompt_ui_period_conversion') !== 'false') {
      value = value.replace(/。/g, '.')
    }
    if (localStorage.getItem('weilin_prompt_ui_bracket_conversion') !== 'false') {
      value = value.replace(/【/g, '[').replace(/】/g, ']').replace(/（/g, '(').replace(/）/g, ')')
    }
    if (localStorage.getItem('weilin_prompt_ui_angle_bracket_conversion') !== 'false') {
      value = value.replace(/《/g, '<').replace(/》/g, '>')
    }
    return value
  }

  const publishPromptChange = (reason, prompt, tokenList = props.tokens) => {
    props.onCommit?.({
      reason,
      prompt,
      tokens: tokenList,
      errors: [],
      warnings: []
    })
  }

  let inputDebounceTimer = null

  const triggerAutocomplete = (inputValue) => {
    const cleaned = inputValue.replace(/[\[\]{}]/g, '').trim()
    if (!cleaned || cleaned.length > 20) {
      autocompleteQuery.value = ''
      autocompleteResults.value = []
      showAutocomplete.value = false
      return
    }

    autocompleteQuery.value = cleaned.toLowerCase()
    autocompleteResults.value = []
    selectedAutocompleteIndex.value = 0
    saveAutoCompleteWidth.value = localStorage.getItem('weilin_prompt_ui_auto_box_width') || 450
    saveAutoCompleteHeight.value = localStorage.getItem('weilin_prompt_ui_auto_box_height') || 350
    showAutocomplete.value = true
    calculateAutocompletePosition()
  }

  const handleAutocompleteResultsChange = (results) => {
    const normalized = Array.isArray(results) ? results : []
    autocompleteResults.value = normalized
    if (!normalized.length) {
      showAutocomplete.value = false
      selectedAutocompleteIndex.value = 0
      return
    }

    const nextIndex = Math.min(
      Math.max(0, selectedAutocompleteIndex.value),
      Math.max(0, normalized.length - 1)
    )
    selectedAutocompleteIndex.value = nextIndex
    showAutocomplete.value = true
  }

  const handleAutocompleteSelect = ({ index }) => {
    selectAutocomplete(index, null)
  }

  const handleInput = (event) => {
    if (!event?.target) return

    const originalValue = String(event.target.value || '')
    const cursorStart = Number(event.target.selectionStart ?? originalValue.length)
    const cursorEnd = Number(event.target.selectionEnd ?? cursorStart)

    const processedValue = applyPunctuationBySettings(originalValue)
    const processedBeforeCursor = applyPunctuationBySettings(originalValue.slice(0, cursorStart))

    inputText.value = processedValue
    tokenCount.value = calculateTokenCount(processedValue)
    publishPromptChange('input', processedValue, props.tokens)

    const selectionDiff = cursorEnd - cursorStart
    const nextCursorStart = processedBeforeCursor.length
    const nextCursorEnd = nextCursorStart + selectionDiff

    nextTick(() => {
      if (!inputAreaRef.value) return
      inputAreaRef.value.setSelectionRange(nextCursorStart, nextCursorEnd)
      inputAreaRef.value.focus()
    })

    const textBeforeCursor = processedValue.slice(0, nextCursorStart)
    const lastChar = textBeforeCursor[textBeforeCursor.length - 1] || ''
    const closeAutocompleteOnDelimiter =
      localStorage.getItem('weilin_prompt_ui_comma_close_autocomplete') === 'true'
    const justTypedDelimiter = lastChar === ',' || lastChar === ' '

    if (justTypedDelimiter && closeAutocompleteOnDelimiter) {
      showAutocomplete.value = false
    }

    let wordStart = nextCursorStart
    while (wordStart > 0 && !/[,\s]/.test(textBeforeCursor[wordStart - 1])) {
      wordStart--
    }
    const currentWord = textBeforeCursor.substring(wordStart, nextCursorStart).trim()

    if (inputDebounceTimer) {
      clearTimeout(inputDebounceTimer)
    }
    inputDebounceTimer = setTimeout(() => {
      if (currentWord) {
        triggerAutocomplete(currentWord)
      } else {
        closeAutocomplete()
        autocompleteResults.value = []
      }
    }, 250)
  }

  const onBlur = () => {
    setTimeout(() => {
      if (showAutocomplete.value) return
      commitPromptChange('blur-input', inputText.value, {
        source: 'string',
        convertPunctuation: true
      })
    }, 100)
  }

  const selectAutocomplete = (index, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const picked = autocompleteResults.value[index]
    if (!picked) return

    showAutocomplete.value = false
    autocompleteQuery.value = ''

    const cursorPosition = inputAreaRef.value?.selectionStart ?? inputText.value.length
    const cursorEnd = inputAreaRef.value?.selectionEnd ?? cursorPosition
    const currentText = inputText.value

    let tagText = applyPunctuationBySettings(String(picked.text || ''))
    if (localStorage.getItem('weilin_prompt_ui_underscore_to_bracket') === 'true') {
      tagText = replaceUnderscoreWithSpace(tagText)
    }
    if (localStorage.getItem('weilin_prompt_ui_bracket_escape') === 'true') {
      tagText = escapeInnerBracketContent(tagText)
    }

    let replaceStart = cursorPosition
    while (replaceStart > 0 && !/[,\s]/.test(currentText[replaceStart - 1])) {
      replaceStart--
    }

    const newText =
      currentText.substring(0, replaceStart) + tagText + ', ' + currentText.substring(cursorEnd)
    const newCursorPosition = replaceStart + tagText.length + 2

    inputText.value = newText
    tokenCount.value = calculateTokenCount(newText)
    commitPromptChange('autocomplete', newText, {
      source: 'string',
      convertPunctuation: false
    })

    nextTick(() => {
      if (!inputAreaRef.value) return
      inputAreaRef.value.selectionStart = newCursorPosition
      inputAreaRef.value.selectionEnd = newCursorPosition
    })
  }

  const handleKeydown = (event) => {
    if (!showAutocomplete.value) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = Math.min(
        selectedAutocompleteIndex.value + 1,
        autocompleteResults.value.length - 1
      )
      selectedAutocompleteIndex.value = nextIndex
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = Math.max(selectedAutocompleteIndex.value - 1, 0)
      selectedAutocompleteIndex.value = nextIndex
      return
    }

    if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault()
      selectAutocomplete(selectedAutocompleteIndex.value, null)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeAutocomplete()
    }
  }

  const activeControls = ref(null)
  const isOverControls = ref(false)
  const controlsPosition = ref({ top: '0px', left: '0px' })
  const showTagTipsBox = ref(false)
  const tagTipsPosition = ref({ top: '0px', left: '0px' })
  const weightValue = ref(1)
  const hideTimeout = ref(null)
  const tokenInputRefs = {}
  const tokenIdCounter = ref(0)
  const favourItemRef = ref(null)

  const BRACKET_MAP = Object.freeze({
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>'
  })
  const BRACKET_PAIRS = Object.freeze(
    Object.entries(BRACKET_MAP).map(([open, close]) => ({ open, close }))
  )
  const BRACKET_CLOSE_SET = new Set(Object.values(BRACKET_MAP))

  const showDeleteButton = ref(
    localStorage.getItem('weilin_prompt_ui_show_delete_button') !== 'false'
  )
  const isTranslateTagEnabled = ref(
    localStorage.getItem('weilin_function_toggles_translateTag') !== 'false'
  )
  const isDeleteButtonEnabled = ref(
    localStorage.getItem('weilin_function_toggles_deleteButton') !== 'false'
  )
  const isClearAllEnabled = ref(
    localStorage.getItem('weilin_function_toggles_clearAll') !== 'false'
  )
  const isClearDisabledEnabled = ref(
    localStorage.getItem('weilin_function_toggles_clearDisabled') !== 'false'
  )

  const toggleDeleteButton = () => {
    showDeleteButton.value = !showDeleteButton.value
    localStorage.setItem('weilin_prompt_ui_show_delete_button', String(showDeleteButton.value))
  }

  const handleStorageChange = (e) => {
    if (e.key === 'weilin_prompt_ui_show_delete_button') {
      showDeleteButton.value = e.newValue !== 'false'
    } else if (e.key === 'weilin_function_toggles_translateTag') {
      isTranslateTagEnabled.value = e.newValue !== 'false'
    } else if (e.key === 'weilin_function_toggles_deleteButton') {
      isDeleteButtonEnabled.value = e.newValue !== 'false'
    } else if (e.key === 'weilin_function_toggles_clearAll') {
      isClearAllEnabled.value = e.newValue !== 'false'
    } else if (e.key === 'weilin_function_toggles_clearDisabled') {
      isClearDisabledEnabled.value = e.newValue !== 'false'
    }
  }

  const translateTextByMode = async (sourceText) => {
    const trimmed = sourceText?.trim()
    if (!trimmed) return ''
    const res = await translatorApi.translaterText('', trimmed)
    return typeof res?.data === 'string' ? res.data.trim() : ''
  }

  const generateUniqueId = () => {
    tokenIdCounter.value++
    return `token_${tokenIdCounter.value}_${Date.now()}`
  }

  const createToken = (text, base = null) => {
    return {
      ...(base || {}),
      id: base?.id || generateUniqueId(),
      text,
      translate: typeof base?.translate === 'string' ? base.translate : '',
      isPunctuation: !!base?.isPunctuation,
      isEditing: !!base?.isEditing,
      isHidden: !!base?.isHidden,
      color: base?.color || ''
    }
  }

  const buildPromptTextFromTokens = (tokenList = props.tokens) => {
    if (!tokenList.length) return ''

    const visibleTokens = []
    for (const token of tokenList) {
      if (!token.isHidden) visibleTokens.push(token)
    }
    if (!visibleTokens.length) return ''

    let result = ''
    for (let i = 0; i < visibleTokens.length; i++) {
      const token = visibleTokens[i]
      const prevToken = i > 0 ? visibleTokens[i - 1] : null
      const nextToken = i < visibleTokens.length - 1 ? visibleTokens[i + 1] : null

      if (token.text === '\n') {
        result += token.text
        continue
      }

      const shouldAddComma = !nextToken || nextToken.text === '\n'
      if (!result || prevToken?.text === '\n') {
        result += token.text + (shouldAddComma ? ',' : '')
      } else {
        result += ', ' + token.text + (shouldAddComma ? ',' : '')
      }
    }

    return result
  }

  const escapeInnerBracketContent = (text) => {
    if (!text) return text
    const open = text[0]
    const close = text[text.length - 1]
    const pair = BRACKET_MAP[open]
    if (pair && pair === close && text.length > 2) {
      const inner = text.slice(1, -1)
      return `${open}${escapeTagBrackets(inner)}${close}`
    }
    return escapeTagBrackets(text)
  }

  const formatPrompt = (input, options = {}) => {
    const merged = {
      source: Array.isArray(input) ? 'array' : 'string',
      convertPunctuation: true,
      underscoreToSpace: false,
      escapeBracketInner: false,
      ...options
    }

    const normalizeTagText = (rawText) => {
      let text = rawText
      if (merged.convertPunctuation) {
        text = convertChinesePunctuation(text)
      }
      if (merged.underscoreToSpace) {
        text = replaceUnderscoreWithSpace(text)
      }
      if (merged.escapeBracketInner) {
        text = escapeInnerBracketContent(text)
      }
      return text
    }

    if (merged.source === 'array') {
      const sourceTokens = Array.isArray(input) ? input : []
      const normalizedTokens = sourceTokens.map((token) => {
        const sourceText = typeof token?.text === 'string' ? token.text : ''
        if (sourceText === '\n' || sourceText === '\t') {
          return createToken(sourceText, token)
        }
        return createToken(normalizeTagText(sourceText), token)
      })

      return {
        tokens: normalizedTokens,
        prompt: buildPromptTextFromTokens(normalizedTokens),
        errors: [],
        warnings: []
      }
    }

    const sourceText = typeof input === 'string' ? input : ''
    const convertedText = merged.convertPunctuation
      ? convertChinesePunctuation(sourceText)
      : sourceText
    const rows = convertedText.split('\n')
    const normalizedTokens = []

    for (let i = 0; i < rows.length; i++) {
      const parts = rows[i]
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
      for (const part of parts) {
        normalizedTokens.push(createToken(normalizeTagText(part)))
      }
      if (i < rows.length - 1) {
        normalizedTokens.push(createToken('\n'))
      }
    }

    return {
      tokens: normalizedTokens,
      prompt: buildPromptTextFromTokens(normalizedTokens),
      errors: [],
      warnings: []
    }
  }

  const commitPromptChange = (reason, input, options = {}) => {
    const result = formatPrompt(input, options)
    props.tokens.splice(0, props.tokens.length, ...result.tokens)
    inputText.value = result.prompt
    const count = result.prompt ? result.prompt.trim().split(/\s+/).length : 0
    tokenCount.value = count
    publishPromptChange(reason, result.prompt, result.tokens)
    return result
  }

  const isBracketComplete = (text) => {
    const stack = []

    for (const char of text) {
      if (BRACKET_MAP[char]) {
        stack.push(char)
      } else if (BRACKET_CLOSE_SET.has(char)) {
        if (stack.length === 0 || BRACKET_MAP[stack.pop()] !== char) {
          return false
        }
      }
    }

    return stack.length === 0
  }

  const findInnerWeight = (content) => {
    for (const pair of BRACKET_PAIRS) {
      if (content.startsWith(pair.open) && content.endsWith(pair.close)) {
        return findInnerWeight(content.slice(1, -1))
      }
    }

    const weightMatch = content.match(/:(\d+(\.\d+)?)$/)
    return weightMatch ? parseFloat(weightMatch[1]) : 1
  }

  const showControls = (index, event) => {
    if (!props.tokens[index]) return

    if (hideTimeout.value) {
      clearTimeout(hideTimeout.value)
      hideTimeout.value = null
    }

    const rect = event.target.getBoundingClientRect()
    controlsPosition.value = {
      top: `${rect.top - 50}px`,
      left: `${rect.left + rect.width / 2}px`
    }
    activeControls.value = index
    weightValue.value = findInnerWeight(props.tokens[index].text)

    tagTipsPosition.value = {
      top: `${rect.bottom + window.scrollY + rect.height + 10}px`,
      left: `${rect.left + rect.width / 2}px`
    }
    showTagTipsBox.value = true
  }

  const handleMouseLeave = () => {
    if (hideTimeout.value) {
      clearTimeout(hideTimeout.value)
    }

    hideTimeout.value = setTimeout(() => {
      if (!isOverControls.value) {
        activeControls.value = null
      }
      hideTimeout.value = null
    }, 100)

    showTagTipsBox.value = false
  }

  const registerTokenInputRef = (index, el) => {
    if (el) tokenInputRefs[index] = el
  }

  const adjustInputWidth = (input) => {
    const span = document.createElement('span')
    span.style.visibility = 'hidden'
    span.style.position = 'absolute'
    span.style.whiteSpace = 'pre'
    const computedStyle = window.getComputedStyle(input)
    span.style.font = computedStyle.font
    span.style.fontSize = computedStyle.fontSize
    span.style.fontFamily = computedStyle.fontFamily
    span.style.padding = computedStyle.padding
    span.style.border = computedStyle.border
    span.textContent = input.value || input.placeholder || ''

    document.body.appendChild(span)
    const width = span.offsetWidth
    input.style.width = `${Math.max(width + 4, 20)}px`
    document.body.removeChild(span)
  }

  const startEditing = (index) => {
    if (!props.tokens[index] || props.tokens[index].isPunctuation) return
    props.tokens[index].isEditing = true

    setTimeout(() => {
      const input = tokenInputRefs[index]
      if (input) {
        input.focus()
        const len = input.value.length
        input.setSelectionRange(len, len)
        adjustInputWidth(input)
        input.addEventListener('input', () => adjustInputWidth(input))
      }
    })
  }

  const finishEditing = (index) => {
    if (props.tokens[index]) {
      props.tokens[index].isEditing = false
      commitPromptChange('finish-editing', props.tokens, {
        source: 'array',
        convertPunctuation: false
      })
    }
  }

  const handleTokenEdit = (index, event) => {
    if (!props.tokens[index]) return
    props.tokens[index] = {
      ...props.tokens[index],
      text: event.target.value
    }
  }

  const deleteToken = (index) => {
    if (index < 0 || index >= props.tokens.length) return
    props.tokens.splice(index, 1)
    if (activeControls.value === index) {
      activeControls.value = null
    }
    commitPromptChange('delete-token', props.tokens, {
      source: 'array',
      convertPunctuation: false
    })
  }

  const handleDelete = () => {
    if (activeControls.value === null) return
    deleteToken(activeControls.value)
    activeControls.value = null
    isOverControls.value = false
  }

  const handelLineToken = () => {
    if (activeControls.value === null || !props.tokens[activeControls.value]) return
    props.tokens.splice(activeControls.value + 1, 0, {
      id: generateUniqueId(),
      text: '\n',
      translate: '',
      isPunctuation: false,
      isEditing: false,
      isHidden: false,
      color: ''
    })
    commitPromptChange('add-line-token', props.tokens, {
      source: 'array',
      convertPunctuation: false
    })
  }

  const toggleHidden = (index) => {
    if (index < 0 || index >= props.tokens.length) return
    if (props.tokens[index].text === '\n' || props.tokens[index].text === '\t') return
    props.tokens[index].isHidden = !props.tokens[index].isHidden
    props.tokens[index].hiddenHint = props.tokens[index].isHidden ? t('promptBox.hiddenHint') : ''
    commitPromptChange('toggle-hidden', props.tokens, {
      source: 'array',
      convertPunctuation: false
    })
  }

  const applyWeight = () => {
    if (activeControls.value === null || !props.tokens[activeControls.value]) return
    const token = props.tokens[activeControls.value]
    const text = token.text

    if (!isBracketComplete(text)) {
      message({ type: 'warn', str: 'message.noFinishKuo' })
      return
    }

    const hasOnlySingleParentheses = (value) => {
      return (
        value.startsWith('(') &&
        value.endsWith(')') &&
        !value.slice(1, -1).includes('(') &&
        !value.slice(1, -1).includes(')') &&
        !value.slice(1, -1).includes('[') &&
        !value.slice(1, -1).includes(']') &&
        !value.slice(1, -1).includes('{') &&
        !value.slice(1, -1).includes('}') &&
        !value.slice(1, -1).includes('<') &&
        !value.slice(1, -1).includes('>')
      )
    }

    let newText = text
    const hasTrailingWeight = /:(-?\d+(\.\d+)?)$/.test(text)
    const weightedFormatMatch = text.match(/^\((.*?):(-?\d+(\.\d+)?)\)$/)

    if (hasTrailingWeight || weightedFormatMatch) {
      if (weightValue.value === 1) {
        if (text.startsWith('(') && text.endsWith(')')) {
          newText = text.slice(1, -1).replace(/:(\d+(\.\d+)?)$/, '')
        } else {
          newText = text.replace(/:(\d+(\.\d+)?)$/, '')
        }
      } else if (weightedFormatMatch) {
        newText = `(${weightedFormatMatch[1]}:${weightValue.value})`
      } else {
        newText = text.replace(/:(-?\d+(\.\d+)?)$/, `:${weightValue.value}`)
      }
    } else if (!/[\(\[\{\<\)\]\}\>]/.test(text)) {
      newText = weightValue.value === 1 ? text : `(${text}:${weightValue.value})`
    } else if (weightValue.value === 1 && hasOnlySingleParentheses(text)) {
      newText = text.slice(1, -1)
    } else if (weightValue.value !== 1) {
      if (text.startsWith('(') && text.endsWith(')')) {
        newText = text.replace(/\)$/, `:${weightValue.value})`)
      } else {
        newText = `(${text}:${weightValue.value})`
      }
    }

    props.tokens[activeControls.value].text = newText
    commitPromptChange('apply-weight', props.tokens, {
      source: 'array',
      convertPunctuation: false
    })
  }

  const wrapWith = (bracketType) => {
    if (activeControls.value === null || !props.tokens[activeControls.value]) return
    const bracketPair = BRACKET_MAP[bracketType]
    props.tokens[activeControls.value].text =
      `${bracketType}${props.tokens[activeControls.value].text}${bracketPair}`
    commitPromptChange('wrap-with-bracket', props.tokens, {
      source: 'array',
      convertPunctuation: false
    })
  }

  const removeLayer = (bracketType) => {
    if (activeControls.value === null || !props.tokens[activeControls.value]) return
    const text = props.tokens[activeControls.value].text
    if (text.startsWith(bracketType) && text.endsWith(BRACKET_MAP[bracketType])) {
      props.tokens[activeControls.value].text = text.slice(1, -1)
      commitPromptChange('remove-bracket-layer', props.tokens, {
        source: 'array',
        convertPunctuation: false
      })
    }
  }

  const openFavourTag = (tokenInfo) => {
    if (favourItemRef.value && tokenInfo) {
      favourItemRef.value.open(tokenInfo.text, tokenInfo.translate)
    }
  }

  const isDragging = ref(false)
  const dragStartIndex = ref(null)
  const draggedTokens = ref([])
  const dropSlotIndex = ref(null)
  const didDrop = ref(false)

  const normalizeDragIndices = (indices) => {
    const len = props.tokens.length
    const unique = new Set()
    const normalized = []
    for (const rawIndex of indices) {
      const index = Number(rawIndex)
      if (!Number.isInteger(index) || index < 0 || index >= len || unique.has(index)) continue
      unique.add(index)
      normalized.push(index)
    }
    normalized.sort((a, b) => a - b)
    return normalized
  }

  const isDragSource = (index) => {
    if (!isDragging.value) return false
    if (draggedTokens.value.length > 0) {
      return draggedTokens.value.includes(index)
    }
    return dragStartIndex.value === index
  }

  const buildDropResult = (slotIndex) => {
    const draggedIndices =
      draggedTokens.value.length > 0
        ? draggedTokens.value
        : dragStartIndex.value === null
          ? []
          : normalizeDragIndices([dragStartIndex.value])
    if (!draggedIndices.length) return null

    const sourceTokens = props.tokens
    const boundedSlot = Math.max(0, Math.min(slotIndex, sourceTokens.length))
    const draggedSet = new Set(draggedIndices)
    const draggedItems = draggedIndices.map((index) => sourceTokens[index]).filter(Boolean)
    if (!draggedItems.length) return null

    const remainingTokens = sourceTokens.filter((_, index) => !draggedSet.has(index))
    const removedBeforeTarget = draggedIndices.filter((index) => index < boundedSlot).length
    let insertIndex = boundedSlot - removedBeforeTarget
    insertIndex = Math.max(0, Math.min(insertIndex, remainingTokens.length))

    const nextTokens = [...remainingTokens]
    nextTokens.splice(insertIndex, 0, ...draggedItems)
    const moved = nextTokens.some((token, index) => token !== sourceTokens[index])

    return {
      moved,
      nextTokens
    }
  }

  const shouldShowDropIndicator = (index) => {
    if (!isDragging.value || dropSlotIndex.value !== index) return false
    const result = buildDropResult(dropSlotIndex.value)
    return !!result?.moved
  }

  const initializeDragState = (index, draggedIndices) => {
    isDragging.value = true
    dragStartIndex.value = index
    draggedTokens.value = normalizeDragIndices(draggedIndices)
    dropSlotIndex.value = null
    didDrop.value = false
  }

  const resetDragState = () => {
    isDragging.value = false
    dragStartIndex.value = null
    draggedTokens.value = []
    dropSlotIndex.value = null
  }

  const resolvePointerSlot = (index, event) => {
    const currentTarget = event?.currentTarget
    if (!currentTarget || typeof currentTarget.querySelector !== 'function') return index
    const tokenBox = currentTarget.querySelector('.token-item-box')
    const rectTarget = tokenBox || currentTarget
    if (!rectTarget || typeof rectTarget.getBoundingClientRect !== 'function') return index
    const rect = rectTarget.getBoundingClientRect()
    return event.clientX > rect.left + rect.width / 2 ? index + 1 : index
  }

  const commitDrop = (slotIndex) => {
    if (!isDragging.value || dragStartIndex.value === null) {
      resetDragState()
      return
    }

    const result = buildDropResult(slotIndex)
    if (!result || !result.moved) {
      resetDragState()
      return
    }

    props.tokens.splice(0, props.tokens.length, ...result.nextTokens)
    commitPromptChange('drag-drop', props.tokens, {
      source: 'array',
      convertPunctuation: false
    })
    didDrop.value = true
    resetDragState()
  }

  const handleDragStart = (index, event) => {
    if (!props.tokens[index]) {
      event.preventDefault()
      return
    }
    initializeDragState(index, [index])
    try {
      // Some browsers require setData to start native HTML5 drag behavior.
      event.dataTransfer.setData('text/plain', String(index))
    } catch {
      // Ignore and continue for browsers that do not require/allow this.
    }
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (index, event) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    if (!isDragging.value) return
    const slotIndex = resolvePointerSlot(index, event)
    dropSlotIndex.value = Math.max(0, Math.min(slotIndex, props.tokens.length))
  }

  const handleDrop = (index, event) => {
    event.preventDefault()
    commitDrop(resolvePointerSlot(index, event))
  }

  const handleSlotDragOver = (slotIndex, event) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    if (!isDragging.value) return
    dropSlotIndex.value = Math.max(0, Math.min(slotIndex, props.tokens.length))
  }

  const handleSlotDrop = (slotIndex, event) => {
    event.preventDefault()
    commitDrop(slotIndex)
  }

  const handleDragEnd = () => {
    // Dropped case is already committed in handleDrop/handleSlotDrop.
    if (!didDrop.value) {
      resetDragState()
    }
    didDrop.value = false
  }

  const oneClickTranslatePrompt = async () => {
    const tokenList = props.tokens
    const batchSize = 50
    let currentIndex = 0
    let processedCount = 0
    let totalCount = 0

    for (let i = 0; i < tokenList.length; i++) {
      const token = tokenList[i]
      if (token.translate && (token.translate === token.text || /[a-zA-Z]/.test(token.translate))) {
        totalCount++
      }
    }

    while (currentIndex < tokenList.length) {
      const endIndex = Math.min(currentIndex + batchSize, tokenList.length)
      const batchData = []
      const tokenIndices = []

      for (let i = currentIndex; i < endIndex; i++) {
        const token = tokenList[i]
        if (
          token.translate &&
          (token.translate === token.text || /[a-zA-Z]/.test(token.translate))
        ) {
          batchData.push(token.text)
          tokenIndices.push(i)
        }
      }

      if (batchData.length > 0) {
        const combinedText = batchData.join('\n')
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('translate timeout')), 30000)
          )

          const res = await Promise.race([
            translatorApi.translaterText('', combinedText),
            timeoutPromise
          ])

          if (res.data && res.data.length > 0) {
            const translatedResults = res.data.split('\n')

            if (translatedResults.length === batchData.length) {
              for (let j = 0; j < tokenIndices.length; j++) {
                const tokenIndex = tokenIndices[j]
                if (j < translatedResults.length && translatedResults[j].trim()) {
                  const targetToken = tokenList[tokenIndex]
                  if (targetToken) {
                    targetToken.translate = translatedResults[j].trim()
                  }
                  processedCount++
                }
              }
            } else {
              throw new Error('translate result count mismatch')
            }
          } else {
            throw new Error('empty translate result')
          }
        } catch {
          for (let j = 0; j < tokenIndices.length; j++) {
            const tokenIndex = tokenIndices[j]
            const textToTranslate = batchData[j]
            try {
              const res = await translatorApi.translaterText('', textToTranslate)
              if (res.data && res.data.length > 0) {
                const targetToken = tokenList[tokenIndex]
                if (targetToken) {
                  targetToken.translate = res.data
                }
                processedCount++
              }
            } catch {
              // Ignore single item translation failure and continue.
            }
          }
        }
      }

      currentIndex = endIndex
    }

    return processedCount >= 0 && totalCount >= 0
  }

  const translateFunction = async (texts, token) => {
    try {
      const translated = await translateTextByMode(texts)
      if (translated) {
        token.translate = translated
      }
    } catch {
      // Ignore single item translation failure and keep current token text.
    }
  }

  const getPromptText = () => {
    return props.tokens.length > 0 ? buildPromptTextFromTokens() : inputText.value
  }

  watch(
    () => props.tokens.length,
    (len) => {
      if (activeControls.value !== null && activeControls.value >= len) {
        activeControls.value = null
      }
    }
  )

  onBeforeUpdate(() => {
    for (const key in tokenInputRefs) {
      delete tokenInputRefs[key]
    }
  })

  onMounted(() => {
    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('click', handleClickOutside)
    setupCursorTracking()
    restoreTextareaHeight()
    inputText.value = buildPromptTextFromTokens(props.tokens)
    tokenCount.value = calculateTokenCount(inputText.value)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
    document.removeEventListener('click', handleClickOutside)
    cleanupCursorTracking()
    if (inputDebounceTimer) {
      clearTimeout(inputDebounceTimer)
      inputDebounceTimer = null
    }
    if (autocompletePositionDebounceTimer) {
      clearTimeout(autocompletePositionDebounceTimer)
      autocompletePositionDebounceTimer = null
    }
    if (hideTimeout.value) {
      clearTimeout(hideTimeout.value)
      hideTimeout.value = null
    }
  })

  defineExpose({
    getPromptText,
    formatPrompt,
    commitPromptChange
  })
</script>

<style scoped>
  @import '../prompt_index.css';

  .token-counter {
    position: absolute;
    right: 8px;
    bottom: 8px;
    left: auto;
    z-index: 10;
    color: #aaa;
    background-color: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    user-select: none;
  }

  .tokens-container {
    position: relative;
    column-gap: 9px;
    row-gap: 8px;
  }

  .token-drop-end-zone {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 16px;
    opacity: 0;
  }
</style>

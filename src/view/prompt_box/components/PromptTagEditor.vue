<template>
  <div class="prompt-tag-editor">
    <div style="position: relative;" :ref="setParentCenterBoxRef">
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

      <div class="token-counter">
        {{ tokenCount }} tokens
      </div>

      <div
        class="autocomplete-container"
        :ref="setAutocompleteContainerRef"
        :style="{
          top: `${autocompletePosition.top}px`,
          left: `${adjustedAutocompletePosition.left}px`,
          display: showAutocomplete ? 'block' : 'none',
          width: `${saveAutoCompleteWidth}px`,
          maxHeight: `${saveAutoCompleteHeight}px`
        }"
      >
        <button class="close-autocomplete-btn" @click.stop="closeAutocomplete">×</button>
        <div
          v-for="(item, index) in autocompleteResults"
          :key="index"
          class="autocomplete-item"
          :class="{ selected: index === selectedAutocompleteIndex }"
          @click.stop="selectAutocomplete(index, $event)"
          :ref="el => setSelectedItemRef(el, index)"
        >
          <span class="tag">{{ item.text }}</span>
          <span class="desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>

    <div class="prompt-input-translate-area">
      <button
        v-if="isTranslateTagEnabled"
        class="translate-btn random-tag-settings-btn"
        @click="oneClickTranslatePrompt"
        :title="t('promptBox.oneClickTranslate')"
      >
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="token-item-icon" width="24" height="24">
          <path
            d="M677.676657 294.6142c19.165116 57.5433 44.715939 102.2992 89.431879 147.0551 38.322239-38.3622 63.873063-89.5118 83.038178-147.0551h-172.470057z m-421.56861 319.685h166.076358l-83.038179-223.7795-83.038179 223.7795z"
            p-id="2419"
          />
          <path
            d="M894.854661 0.504H128.353929C58.095158 0.504 0.607803 58.0473 0.607803 128.378v767.244c0 70.3307 57.487355 127.874 127.746126 127.874h766.500733c70.258771 0 127.746126-57.5433 127.746126-127.874V128.378c0-70.3307-51.101647-127.874-127.746126-127.874zM581.867062 825.2913c-12.771416 12.7874-25.550824 12.7874-38.322239 12.7874-6.3937 0-19.165116 0-25.550824-6.3937-6.3937-6.3937-12.779408 0-12.779408-6.3937s-6.385708-12.7874-12.771415-25.5748c-6.3937-12.7874-6.3937-19.1811-12.779408-31.9685l-25.542832-70.3307H230.557224L205.0064 767.748c-12.771416 25.5748-19.165116 44.7559-25.550824 57.5433-6.3937 12.7874-19.165116 12.7874-38.322239 12.7874-12.779408 0-25.550824-6.3937-38.330231-12.7874-12.771416-12.7874-19.157124-19.1811-19.157124-31.9685 0-6.3937 0-12.7874 6.385708-25.5748 6.3937-12.7874 6.3937-19.1811 12.771416-31.9685l140.525533-358.0472c6.3937-12.7874 6.3937-25.5748 12.779408-38.3622 6.385708-12.7874 12.771416-25.5748 19.157124-31.9685 6.3937-6.3937 12.779408-19.1811 25.550823-25.5748 12.779408-6.3937 25.550824-6.3937 38.330232-6.3937 12.771416 0 25.542832 0 38.322239 6.3937 12.771416 6.3937 19.165116 12.7874 25.550824 25.5748 6.385708 6.3937 12.771416 19.1811 19.157124 31.9685 6.3937 12.7874 12.779408 25.5748 19.165115 44.7559l140.525534 351.6535c12.771416 25.5748 19.165116 44.7559 19.165116 57.5433-6.3937 6.3937-12.779408 19.1811-19.165116 31.9685zM933.176901 575.937c-70.258771-25.5748-121.360418-57.5433-166.076358-95.9055-44.707947 44.7559-102.195302 76.7244-172.462065 95.9055l-19.157124-31.9685c70.258771-19.1811 127.746126-44.7559 172.462066-89.5118C703.22748 409.7008 664.905241 352.1575 652.125833 288.2205h-63.873063v-25.5748h172.470058c-12.7874-19.1811-25.558816-44.7559-38.330232-63.937l19.157124-6.3937c12.779408 19.1811 31.944524 44.7559 44.715939 70.3307h159.682658v31.9685h-63.873063c-19.157124 63.937-51.093655 121.4803-89.423887 159.8425 44.715939 38.3622 95.809594 70.3307 166.076358 89.5118l-25.550824 31.9685z"
            p-id="2420"
          />
        </svg>
        <span style="margin-left: 5px;" class="action-text">{{ t('promptBox.oneClickTranslate') }}</span>
      </button>

      <button
        v-if="isDeleteButtonEnabled"
        class="translate-btn toggle-delete-btn"
        @click="toggleDeleteButton"
        :title="showDeleteButton ? t('promptBox.hideDeleteButton') : t('promptBox.showDeleteButton')"
        :class="{ active: showDeleteButton }"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="utils-item-icon" width="24" height="24">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            fill="currentColor"
          />
        </svg>
        <span class="action-text">{{ showDeleteButton ? t('promptBox.hideDeleteButton') : t('promptBox.showDeleteButton') }}</span>
      </button>

      <button
        v-if="isClearAllEnabled"
        class="translate-btn clear-all-btn"
        @click="handleClearAllClick"
        :title="t('promptBox.oneClickCleanAll')"
      >
        <svg class="utils-item-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1605" width="24" height="24">
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
        @click="handleClearDisabledClick"
        :title="t('promptBox.oneClickClearDisabled')"
      >
        <svg class="utils-item-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1605" width="24" height="24">
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

    <div
      ref="tokensContainerRef"
      class="tokens-container"
      v-if="tokens.length > 0"
      @mousedown="handleSelectionMouseDown"
      @mousemove="handleSelectionMouseMove"
      @mouseup="handleSelectionMouseUp"
      @mouseleave="handleSelectionMouseUp"
    >
      <div v-if="isSelecting" class="selection-box" :style="selectionBoxStyle"></div>
      <template v-for="(token, index) in tokens" :key="'tag-wrapper-' + index">
        <PromptTagItem
          :token="token"
          :index="index"
          :is-drag-source="isDragging && dragStartIndex === index"
          :is-dragging="isDragging"
          :is-selected="isTokenSelected(index)"
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

    <div
      v-show="showSelectionActions"
      class="token-controls selection-actions-controls"
      :style="selectionActionsPosition"
      @mouseenter="isOverSelectionActions = true"
      @mouseleave="handleSelectionActionsLeave"
    >
      <div class="weilin-comfyui-selection-actions-content">
        <div class="weilin-comfyui-selection-actions-count">选中 {{ selectedTokens.length }} 个标签</div>
        <div class="weilin-comfyui-selection-actions-buttons">
          <button class="delete-btn copy-btn" @click="copySelectedTokens" title="复制">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          </button>
          <button class="delete-btn" @click="disableSelectedTokens" title="禁用">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#ff4d4f" stroke-width="2" />
              <path d="M8.5 8.5l7 7" stroke="#ff4d4f" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <button class="delete-btn enable-btn" @click="enableSelectedTokens" title="启用">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </button>
          <button class="delete-btn" @click="deleteSelectedTokens" title="删除">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>
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
      @mouseleave="handleControlsLeave"
    >
      <div class="weight-control">
        <input type="number" v-model.number="weightValue" step="0.1" class="weight-input" @change="applyWeight" />
        <span class="weight-label">{{ t('promptBox.weight') }}</span>
      </div>

      <button class="favour-btn" @click="openFavourTag(tokens[activeControls])" :title="t('promptBox.favour')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#FFD700" />
        </svg>
      </button>

      <button @click="handleDelete" class="delete-btn" :title="t('promptBox.delete')">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>

      <div class="bracket-btn-group">
        <div class="bracket-btn-container">
          <div class="bracket-btn">()</div>
          <div class="vertical-btn-group">
            <button class="vertical-btn" @click="wrapWith('(')" :title="t('promptBox.addBracket')">+</button>
            <button class="vertical-btn" @click="removeLayer('(')" :title="t('promptBox.removeLayer')">-</button>
          </div>
        </div>

        <div class="bracket-btn-container">
          <div class="bracket-btn">[]</div>
          <div class="vertical-btn-group">
            <button class="vertical-btn" @click="wrapWith('[')" :title="t('promptBox.addBracket')">+</button>
            <button class="vertical-btn" @click="removeLayer('[')" :title="t('promptBox.removeLayer')">-</button>
          </div>
        </div>

        <div class="bracket-btn-container">
          <div class="bracket-btn">{}</div>
          <div class="vertical-btn-group">
            <button class="vertical-btn" @click="wrapWith('{')" :title="t('promptBox.addBracket')">+</button>
            <button class="vertical-btn" @click="removeLayer('{')" :title="t('promptBox.removeLayer')">-</button>
          </div>
        </div>
      </div>

      <button class="line-token-btn" @click="handelLineToken" :title="t('promptBox.addLineToken')" style="margin-left: 8px;">
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
import { computed, onBeforeUpdate, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { translatorApi } from '@/api/translator'
import message from '@/utils/message'
import PromptTagItem from './PromptTagItem.vue'
import favourItem from './favour.vue'

const { t } = useI18n()

const emit = defineEmits(['clear-all', 'clear-disabled'])

const props = defineProps({
  setParentCneterBoxRef: { type: Function, required: true },
  setInputAreaRef: { type: Function, required: true },
  setAutocompleteContainerRef: { type: Function, required: true },
  setSelectedItemRef: { type: Function, required: true },
  inputText: { type: String, default: '' },
  tokenCount: { type: Number, default: 0 },
  autocompletePosition: { type: Object, required: true },
  adjustedAutocompletePosition: { type: Object, required: true },
  showAutocomplete: { type: Boolean, default: false },
  saveAutoCompleteWidth: { type: Number, default: 450 },
  saveAutoCompleteHeight: { type: Number, default: 350 },
  autocompleteResults: { type: Array, default: () => [] },
  selectedAutocompleteIndex: { type: Number, default: 0 },
  isTranslateTagEnabled: { type: Boolean, default: false },
  isDeleteButtonEnabled: { type: Boolean, default: false },
  isClearAllEnabled: { type: Boolean, default: false },
  isClearDisabledEnabled: { type: Boolean, default: false },
  tokens: { type: Array, default: () => [] },
  handleInput: { type: Function, required: true },
  handleKeydown: { type: Function, required: true },
  onBlur: { type: Function, required: true },
  saveTextareaHeight: { type: Function, required: true },
  closeAutocomplete: { type: Function, required: true },
  selectAutocomplete: { type: Function, required: true },
  isTextTranslatable: { type: Function, required: true }
})

const setParentCenterBoxRef = (el) => {
  props.setParentCneterBoxRef(el)
}

const setInputAreaRef = (el) => {
  props.setInputAreaRef(el)
}

const setAutocompleteContainerRef = (el) => {
  props.setAutocompleteContainerRef(el)
}

const setSelectedItemRef = (el, index) => {
  if (el && index === props.selectedAutocompleteIndex) {
    props.setSelectedItemRef(el)
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
const tokensContainerRef = ref(null)

const isPotentialSelection = ref(false)
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })
const selectedTokens = ref([])
const showSelectionActions = ref(false)
const selectionActionsPosition = ref({ top: '0px', left: '0px' })
const isOverSelectionActions = ref(false)
const suppressNextOutsideClick = ref(false)

const selectedTokenSet = computed(() => new Set(selectedTokens.value))
const selectionBoxStyle = computed(() => {
  const left = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const top = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const width = Math.abs(selectionEnd.value.x - selectionStart.value.x)
  const height = Math.abs(selectionEnd.value.y - selectionStart.value.y)
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  }
})

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

const showDeleteButton = ref(localStorage.getItem('weilin_prompt_ui_show_delete_button') !== 'false')

const saveShowDeleteButtonSetting = () => {
  localStorage.setItem('weilin_prompt_ui_show_delete_button', String(showDeleteButton.value))
}

const toggleDeleteButton = () => {
  showDeleteButton.value = !showDeleteButton.value
  saveShowDeleteButtonSetting()
}

const handleStorageChange = (e) => {
  if (e.key === 'weilin_prompt_ui_show_delete_button') {
    showDeleteButton.value = e.newValue !== 'false'
  }
}

const handleClearAllClick = () => {
  emit('clear-all')
}

const handleClearDisabledClick = () => {
  emit('clear-disabled')
}

const extractTranslatedText = (res) => {
  const translated = typeof res?.data === 'string' ? res.data.trim() : ''
  return translated
}

const translateTextByMode = async (sourceText) => {
  const trimmed = sourceText?.trim()
  if (!trimmed) return ''
  const res = await translatorApi.translaterText('', trimmed)
  return extractTranslatedText(res)
}

const generateUniqueId = () => {
  tokenIdCounter.value++
  return `token_${tokenIdCounter.value}_${Date.now()}`
}

const buildPromptTextFromTokens = () => {
  if (!props.tokens.length) return ''

  const visibleTokens = []
  for (const token of props.tokens) {
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

const hideControls = () => {
  if (!isOverControls.value) {
    activeControls.value = null
  }
}

const handleMouseLeave = () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
  }

  hideTimeout.value = setTimeout(() => {
    if (!isOverControls.value) {
      hideControls()
    }
    hideTimeout.value = null
  }, 100)

  showTagTipsBox.value = false
}

const handleControlsLeave = () => {
  isOverControls.value = false
  handleMouseLeave()
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
}

const toggleHidden = (index) => {
  if (index < 0 || index >= props.tokens.length) return
  if (props.tokens[index].text === '\n' || props.tokens[index].text === '\t') return
  props.tokens[index].isHidden = !props.tokens[index].isHidden
  props.tokens[index].hiddenHint = props.tokens[index].isHidden ? t('promptBox.hiddenHint') : ''
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
    return value.startsWith('(') && value.endsWith(')') &&
      !value.slice(1, -1).includes('(') &&
      !value.slice(1, -1).includes(')') &&
      !value.slice(1, -1).includes('[') &&
      !value.slice(1, -1).includes(']') &&
      !value.slice(1, -1).includes('{') &&
      !value.slice(1, -1).includes('}') &&
      !value.slice(1, -1).includes('<') &&
      !value.slice(1, -1).includes('>')
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
}

const wrapWith = (bracketType) => {
  if (activeControls.value === null || !props.tokens[activeControls.value]) return
  const bracketPair = BRACKET_MAP[bracketType]
  props.tokens[activeControls.value].text = `${bracketType}${props.tokens[activeControls.value].text}${bracketPair}`
}

const removeLayer = (bracketType) => {
  if (activeControls.value === null || !props.tokens[activeControls.value]) return
  const text = props.tokens[activeControls.value].text
  if (text.startsWith(bracketType) && text.endsWith(BRACKET_MAP[bracketType])) {
    props.tokens[activeControls.value].text = text.slice(1, -1)
  }
}

const openFavourTag = (tokenInfo) => {
  if (favourItemRef.value && tokenInfo) {
    favourItemRef.value.open(tokenInfo.text, tokenInfo.translate)
  }
}

const isTokenSelected = (index) => selectedTokenSet.value.has(index)

const getContainerPointer = (event) => {
  const container = tokensContainerRef.value
  if (!container) return { x: 0, y: 0 }
  const rect = container.getBoundingClientRect()
  return {
    x: Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
    y: Math.min(Math.max(event.clientY - rect.top, 0), rect.height)
  }
}

const getSelectionBounds = () => {
  const left = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const top = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const right = Math.max(selectionStart.value.x, selectionEnd.value.x)
  const bottom = Math.max(selectionStart.value.y, selectionEnd.value.y)
  return { left, top, right, bottom }
}

const updateSelectedTokensFromBox = () => {
  const container = tokensContainerRef.value
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  const scrollLeft = container.scrollLeft || 0
  const scrollTop = container.scrollTop || 0
  const bounds = getSelectionBounds()
  const nextSelected = []

  const tokenBoxes = container.querySelectorAll('.token-item-box')
  tokenBoxes.forEach((box, index) => {
    const rect = box.getBoundingClientRect()
    const boxLeft = rect.left - containerRect.left + scrollLeft
    const boxTop = rect.top - containerRect.top + scrollTop
    const boxRight = boxLeft + rect.width
    const boxBottom = boxTop + rect.height
    const isIntersecting = (
      boxRight >= bounds.left &&
      boxLeft <= bounds.right &&
      boxBottom >= bounds.top &&
      boxTop <= bounds.bottom
    )
    if (isIntersecting) {
      nextSelected.push(index)
    }
  })

  selectedTokens.value = nextSelected
}

const clearSelectedTokens = () => {
  selectedTokens.value = []
  showSelectionActions.value = false
}

const closeSelectionActions = () => {
  showSelectionActions.value = false
  selectedTokens.value = []
}

const showSelectionActionsMenu = () => {
  if (!selectedTokens.value.length) {
    showSelectionActions.value = false
    return
  }
  const containerRect = tokensContainerRef.value?.getBoundingClientRect()
  if (!containerRect) {
    showSelectionActions.value = false
    return
  }
  const bounds = getSelectionBounds()
  selectionActionsPosition.value = {
    top: `${Math.max(containerRect.top + bounds.top - 50, 0)}px`,
    left: `${containerRect.left + (bounds.left + bounds.right) / 2}px`
  }
  showSelectionActions.value = true
}

const handleSelectionMouseDown = (event) => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || isDragging.value) return

  // 规则收敛：
  // 1. 光标在 Tag 上 -> 只走拖拽逻辑（由子组件阻止冒泡到这里）
  // 2. 光标不在 Tag 上 -> 走框选逻辑
  const isOnTag = !!event.target.closest('.token-item-box')
  if (isOnTag) return

  const blockedTarget = event.target.closest(
    '.delete-btn, .weight-control, .bracket-btn, .translate-button, .tag-tips-box, .token-controls, .selection-actions-controls'
  )
  if (blockedTarget) return

  const point = getContainerPointer(event)
  selectionStart.value = point
  selectionEnd.value = point
  isPotentialSelection.value = true
  isSelecting.value = false
  closeSelectionActions()
}

const handleSelectionMouseMove = (event) => {
  if (!isPotentialSelection.value && !isSelecting.value) return

  const point = getContainerPointer(event)
  if (isPotentialSelection.value && !isSelecting.value) {
    const dx = point.x - selectionStart.value.x
    const dy = point.y - selectionStart.value.y
    if (Math.sqrt(dx * dx + dy * dy) <= 3) return
    isSelecting.value = true
    selectedTokens.value = []
  }

  if (!isSelecting.value) return
  event.preventDefault()
  selectionEnd.value = point
  updateSelectedTokensFromBox()
}

const handleSelectionMouseUp = () => {
  if (isPotentialSelection.value && !isSelecting.value) {
    clearSelectedTokens()
  }
  isPotentialSelection.value = false

  if (!isSelecting.value) return
  isSelecting.value = false
  // 框选抬起后浏览器会紧跟触发一次 click，忽略这一次避免选中态被立即清空。
  suppressNextOutsideClick.value = true
  showSelectionActionsMenu()
}

const handleSelectionActionsLeave = () => {
  isOverSelectionActions.value = false
}

const handleSelectionActionsOutsideClick = (event) => {
  if (suppressNextOutsideClick.value) {
    suppressNextOutsideClick.value = false
    return
  }
  if (!showSelectionActions.value) return
  const isInsideActions = event.target.closest('.selection-actions-controls')
  if (isInsideActions) return
  const isInsideTokensContainer = tokensContainerRef.value?.contains?.(event.target)
  if (!isInsideTokensContainer) {
    clearSelectedTokens()
  }
}

const copySelectedTokens = async () => {
  if (!selectedTokens.value.length) return
  const text = [...selectedTokens.value]
    .sort((a, b) => a - b)
    .map(index => props.tokens[index]?.text || '')
    .filter(Boolean)
    .join(', ')

  if (!text) {
    closeSelectionActions()
    return
  }

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Ignore clipboard failure and keep behavior non-blocking.
  }
  closeSelectionActions()
}

const disableSelectedTokens = () => {
  if (!selectedTokens.value.length) return
  for (const index of selectedTokens.value) {
    const token = props.tokens[index]
    if (!token || token.text === '\n' || token.text === '\t') continue
    token.isHidden = true
    token.hiddenHint = t('promptBox.hiddenHint')
  }
  closeSelectionActions()
}

const enableSelectedTokens = () => {
  if (!selectedTokens.value.length) return
  for (const index of selectedTokens.value) {
    const token = props.tokens[index]
    if (!token) continue
    token.isHidden = false
    token.hiddenHint = ''
  }
  closeSelectionActions()
}

const deleteSelectedTokens = () => {
  if (!selectedTokens.value.length) return
  if (!confirm(`确定要删除选中的 ${selectedTokens.value.length} 个标签吗？`)) {
    clearSelectedTokens()
    return
  }

  const selectedSet = new Set(selectedTokens.value)
  const sortedIndices = [...selectedTokens.value].sort((a, b) => b - a)
  for (const index of sortedIndices) {
    if (index >= 0 && index < props.tokens.length) {
      props.tokens.splice(index, 1)
    }
  }

  if (activeControls.value !== null && selectedSet.has(activeControls.value)) {
    activeControls.value = null
  }
  closeSelectionActions()
}

const isDragging = ref(false)
const dragStartIndex = ref(null)
const dropSlotIndex = ref(null)
const didDrop = ref(false)

const shouldShowDropIndicator = (index) => {
  if (!isDragging.value || dropSlotIndex.value !== index) return false
  if (dragStartIndex.value === null) return false
  return dropSlotIndex.value !== dragStartIndex.value && dropSlotIndex.value !== dragStartIndex.value + 1
}

const initializeDragState = (index) => {
  isDragging.value = true
  dragStartIndex.value = index
  dropSlotIndex.value = null
  didDrop.value = false
}

const resetDragState = () => {
  isDragging.value = false
  dragStartIndex.value = null
  dropSlotIndex.value = null
}

const setTokensInPlace = (newTokens) => {
  props.tokens.splice(0, props.tokens.length, ...newTokens)
}

const setDropSlot = (slotIndex) => {
  if (!isDragging.value) return
  const safeIndex = Math.max(0, Math.min(slotIndex, props.tokens.length))
  dropSlotIndex.value = safeIndex
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

  const fromIndex = dragStartIndex.value
  const toBeforeIndex = Math.max(0, Math.min(slotIndex, props.tokens.length))

  // Same visual position: before itself or before immediate next token.
  if (toBeforeIndex === fromIndex || toBeforeIndex === fromIndex + 1) {
    resetDragState()
    return
  }

  const movingToken = props.tokens[fromIndex]
  if (!movingToken) {
    resetDragState()
    return
  }

  const nextTokens = [...props.tokens]
  nextTokens.splice(fromIndex, 1)

  let insertIndex = toBeforeIndex
  if (toBeforeIndex > fromIndex) {
    insertIndex = toBeforeIndex - 1
  }

  insertIndex = Math.max(0, Math.min(insertIndex, nextTokens.length))
  nextTokens.splice(insertIndex, 0, movingToken)
  setTokensInPlace(nextTokens)

  didDrop.value = true
  resetDragState()
}

const handleDragStart = (index, event) => {
  if (!props.tokens[index]) {
    event.preventDefault()
    return
  }
  clearSelectedTokens()
  initializeDragState(index)
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
  setDropSlot(resolvePointerSlot(index, event))
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
  setDropSlot(slotIndex)
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
    if (
      token.translate &&
      (token.translate === token.text || /[a-zA-Z]/.test(token.translate))
    ) {
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
  return props.tokens.length > 0 ? buildPromptTextFromTokens() : props.inputText
}

watch(() => props.tokens.length, (len) => {
  if (activeControls.value !== null && activeControls.value >= len) {
    activeControls.value = null
  }
  if (selectedTokens.value.some(index => index >= len)) {
    clearSelectedTokens()
  }
})

onBeforeUpdate(() => {
  for (const key in tokenInputRefs) {
    delete tokenInputRefs[key]
  }
})

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
  document.addEventListener('click', handleSelectionActionsOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  document.removeEventListener('click', handleSelectionActionsOutsideClick)
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
})

defineExpose({
  getPromptText
})
</script>

<style scoped>
@import "../prompt_index.css";

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

.selection-box {
  position: absolute;
  border: 2px dashed #4285f4;
  background-color: rgb(66 133 244 / 0.2);
  box-shadow: 0 0 8px rgb(66 133 244 / 0.3);
  pointer-events: none;
  z-index: 20;
}

.selection-actions-controls {
  z-index: 1200;
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


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
      <div style="display: flex; align-items: center;">
        <input
          type="text"
          :value="localTranslateText"
          class="prompt-input-translate-area-textarea"
          @input="localTranslateText = $event.target.value"
          @keyup.enter="handleTranslateEnter()"
          :placeholder="t('promptBox.translatePlaceholder')"
        />
        <button class="translate-btn" style="margin-left: 8px;" @click="handleTranslateEnter()">翻译</button>
      </div>

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
        v-if="isRandomTagSettingsEnabled"
        class="translate-btn random-tag-settings-btn"
        @click="openRandomTagSettings"
        :title="t('promptBox.randomTagSettings')"
      >
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="utils-item-icon" width="24" height="24">
          <path
            d="M512 409.6c-56.32 0-102.4 46.08-102.4 102.4s46.08 102.4 102.4 102.4 102.4-46.08 102.4-102.4-46.08-102.4-102.4-102.4z m0 153.6c-28.16 0-51.2-23.04-51.2-51.2s23.04-51.2 51.2-51.2 51.2 23.04 51.2 51.2-23.04 51.2-51.2 51.2z"
          />
          <path
            d="M512 204.8c-25.6 0-51.2 2.56-76.8 7.68l-15.36-61.44c-2.56-10.24-10.24-17.92-20.48-20.48-10.24-2.56-20.48 0-28.16 7.68l-76.8 76.8c-5.12 5.12-7.68 12.8-7.68 20.48s2.56 15.36 7.68 20.48l76.8 76.8c5.12 5.12 12.8 7.68 20.48 7.68 2.56 0 5.12 0 7.68-2.56 10.24-2.56 17.92-10.24 20.48-20.48l15.36-61.44c25.6-5.12 51.2-7.68 76.8-7.68 140.8 0 256 115.2 256 256s-115.2 256-256 256-256-115.2-256-256c0-25.6 2.56-51.2 7.68-76.8l61.44-15.36c10.24-2.56 17.92-10.24 20.48-20.48 2.56-10.24 0-20.48-7.68-28.16l-76.8-76.8c-5.12-5.12-12.8-7.68-20.48-7.68s-15.36 2.56-20.48 7.68l-76.8 76.8c-7.68 7.68-10.24 17.92-7.68 28.16 2.56 10.24 10.24 17.92 20.48 20.48l61.44 15.36c-5.12 25.6-7.68 51.2-7.68 76.8 0 168.96 138.24 307.2 307.2 307.2s307.2-138.24 307.2-307.2-138.24-307.2-307.2-307.2z"
          />
        </svg>
        <span class="action-text">{{ t('promptBox.randomTagSettings') }}</span>
      </button>

      <button
        v-if="isRandomTagEnabled"
        class="translate-btn random-tag-btn"
        @click="oneClickRandomTag"
        :title="t('promptBox.oneClickRandomTag')"
      >
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="utils-item-icon" width="24" height="24">
          <path
            d="M832 512c0-176-144-320-320-320S192 336 192 512s144 320 320 320 320-144 320-320z m-384 0c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z m128-128c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z m-256 0c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z m128-128c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z m256 256c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z m-256 0c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z m-128 128c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z m256 0c0-35.2 28.8-64 64-64s64 28.8 64 64-28.8 64-64 64-64-28.8-64-64z"
          />
        </svg>
        <span class="action-text">{{ t('promptBox.oneClickRandomTag') }}</span>
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

    <div class="tokens-container" v-if="tokens.length > 0" ref="tokensContainerRef">
      <div
        v-if="isDragging && dropIndicatorStyle.display === 'block'"
        class="token-drop-indicator"
        :style="dropIndicatorStyle"
      ></div>
      <template v-for="(token, index) in tokens" :key="'tag-wrapper-' + index">
        <PromptTagItem
          :token="token"
          :index="index"
          :is-drag-source="isDragging && dragStartIndex === index"
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
      @mouseleave="handleControlsLeave"
    >
      <div class="weight-control" v-if="!tokens[activeControls]?.isLoraTag">
        <input type="number" v-model.number="weightValue" step="0.1" class="weight-input" @change="applyWeight" />
        <span class="weight-label">{{ t('promptBox.weight') }}</span>
      </div>

      <div class="lora-weight-controls" v-if="tokens[activeControls]?.isLoraTag">
        <div class="weight-control">
          <input type="number" v-model.number="loraModelWeight" step="0.1" class="weight-input" @change="applyLoraWeights" />
          <span class="weight-label">{{ t('promptBox.modelWeight') }}</span>
        </div>
        <div class="weight-control">
          <input type="number" v-model.number="loraTextWeight" step="0.1" class="weight-input" @change="applyLoraWeights" />
          <span class="weight-label">{{ t('promptBox.textWeight') }}</span>
        </div>
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

      <div class="bracket-btn-group" v-if="!tokens[activeControls]?.isLoraTag">
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
import { onBeforeUpdate, onMounted, onUnmounted, ref, watch } from 'vue'
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
  isRandomTagSettingsEnabled: { type: Boolean, default: false },
  isRandomTagEnabled: { type: Boolean, default: false },
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
  openRandomTagSettings: { type: Function, required: true },
  oneClickRandomTag: { type: Function, required: true },
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
const loraModelWeight = ref(0.5)
const loraTextWeight = ref(0.5)
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

const showDeleteButton = ref(localStorage.getItem('weilin_prompt_ui_show_delete_button') !== 'false')
const localTranslateText = ref('')

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
  localTranslateText.value = ''
  emit('clear-all')
}

const handleClearDisabledClick = () => {
  emit('clear-disabled')
}

const extractTranslatedText = (res) => {
  const translated = typeof res?.data === 'string' ? res.data.trim() : ''
  return translated
}

const translateTextByMode = async (sourceText, useInputEndpoint = false) => {
  const trimmed = sourceText?.trim()
  if (!trimmed) return ''
  const res = useInputEndpoint
    ? await translatorApi.translaterInputText('', trimmed)
    : await translatorApi.translaterText('', trimmed)
  return extractTranslatedText(res)
}

const handleTranslateEnter = async () => {
  const sourceText = localTranslateText.value.trim()
  if (!sourceText) return
  try {
    const translated = await translateTextByMode(sourceText, true)
    if (!translated) return
    props.tokens.push({
      text: translated,
      translate: sourceText,
      isPunctuation: false,
      isEditing: false,
      isHidden: false,
      color: ''
    })
    localTranslateText.value = ''
  } catch {
    // Keep current behavior: ignore failed request and keep user input.
  }
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
  if (!props.tokens[index].isLoraTag) {
    showTagTipsBox.value = true
  }
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
  props.tokens[index].hiddenHint = props.tokens[index].isHidden ? props.t('promptBox.hiddenHint') : ''
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

const applyLoraWeights = () => {
  if (activeControls.value === null || !props.tokens[activeControls.value]?.isLoraTag) return
  const token = props.tokens[activeControls.value]
  const match = token.text.match(/<wlr:([^:]+):([^:]+):([^>]+)>/)
  if (!match) return

  const loraName = match[1]
  token.text = `<wlr:${loraName}:${loraModelWeight.value}:${loraTextWeight.value}>`
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

const isDragging = ref(false)
const dragStartIndex = ref(null)
const dropSlotIndex = ref(null)
const didDrop = ref(false)
const tokensContainerRef = ref(null)
const dropIndicatorStyle = ref({
  display: 'none',
  left: '0px',
  top: '0px',
  height: '24px'
})
let dragVisualRafId = 0
let pendingDropVisual = null

const hideDropIndicator = () => {
  dropIndicatorStyle.value.display = 'none'
}

const getEventElement = (event, selector) => {
  const current = event?.currentTarget
  if (current && typeof current.closest === 'function') {
    const matchedCurrent = current.closest(selector)
    if (matchedCurrent) return matchedCurrent
  }
  const target = event?.target
  if (target && typeof target.closest === 'function') {
    return target.closest(selector)
  }
  return null
}

const getDropIndicatorXBySlot = (slotIndex, fallbackRect, preferCenter = false) => {
  const container = tokensContainerRef.value
  if (!container) return null

  const tokenElements = Array.from(container.querySelectorAll('.token-item-box'))
  const prevRect = slotIndex > 0 ? tokenElements[slotIndex - 1]?.getBoundingClientRect() : null
  const nextRect = slotIndex < tokenElements.length ? tokenElements[slotIndex]?.getBoundingClientRect() : null

  if (prevRect && nextRect) {
    return (prevRect.right + nextRect.left) / 2
  }
  if (nextRect) {
    return nextRect.left - 6
  }
  if (prevRect) {
    return prevRect.right + 6
  }
  if (fallbackRect) {
    return preferCenter ? fallbackRect.left + fallbackRect.width / 2 : fallbackRect.left
  }
  return null
}

const updateDropIndicatorByRect = (slotIndex, rect, preferCenter = false) => {
  const container = tokensContainerRef.value
  if (!container || !rect) return
  const containerRect = container.getBoundingClientRect()
  const indicatorX = getDropIndicatorXBySlot(slotIndex, rect, preferCenter)
  if (indicatorX === null) return
  const indicatorHeight = Math.max(18, rect.height - 8)
  const left = indicatorX - containerRect.left - 1
  const top = rect.top - containerRect.top + (rect.height - indicatorHeight) / 2
  dropIndicatorStyle.value = {
    display: 'block',
    left: `${left}px`,
    top: `${top}px`,
    height: `${indicatorHeight}px`
  }
}

const scheduleDropVisualUpdate = (slotIndex, element, preferCenter = false) => {
  pendingDropVisual = { slotIndex, element, preferCenter }
  if (dragVisualRafId) return

  dragVisualRafId = requestAnimationFrame(() => {
    dragVisualRafId = 0
    if (!pendingDropVisual) return
    const { slotIndex: nextSlot, element: nextElement, preferCenter: center } = pendingDropVisual
    pendingDropVisual = null
    setDropSlot(nextSlot)
    if (nextElement) {
      updateDropIndicatorByRect(nextSlot, nextElement.getBoundingClientRect(), center)
    }
  })
}

const initializeDragState = (index) => {
  isDragging.value = true
  dragStartIndex.value = index
  dropSlotIndex.value = null
  didDrop.value = false
  hideDropIndicator()
}

const resetDragState = () => {
  isDragging.value = false
  dragStartIndex.value = null
  dropSlotIndex.value = null
  pendingDropVisual = null
  if (dragVisualRafId) {
    cancelAnimationFrame(dragVisualRafId)
    dragVisualRafId = 0
  }
  hideDropIndicator()
}

const setTokensInPlace = (newTokens) => {
  props.tokens.splice(0, props.tokens.length, ...newTokens)
}

const setDropSlot = (slotIndex) => {
  if (!isDragging.value) return
  const safeIndex = Math.max(0, Math.min(slotIndex, props.tokens.length))
  dropSlotIndex.value = safeIndex
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
  const tokenEl = getEventElement(event, '.token-item-box')
  if (tokenEl) {
    scheduleDropVisualUpdate(index, tokenEl, false)
  } else {
    scheduleDropVisualUpdate(index, null, false)
  }
}

const handleDrop = (index, event) => {
  event.preventDefault()
  commitDrop(index)
}

const handleSlotDragOver = (slotIndex, event) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  const endZone = getEventElement(event, '.token-drop-end-zone')
  if (endZone) {
    scheduleDropVisualUpdate(slotIndex, endZone, true)
  } else {
    scheduleDropVisualUpdate(slotIndex, null, true)
  }
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
      (token.translate === token.text || /[a-zA-Z]/.test(token.translate)) &&
      !(typeof token.text === 'string' && token.text.startsWith('<wlr'))
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
        (token.translate === token.text || /[a-zA-Z]/.test(token.translate)) &&
        !(typeof token.text === 'string' && token.text.startsWith('<wlr'))
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
    const translated = await translateTextByMode(texts, false)
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

watch(activeControls, (newVal) => {
  if (newVal !== null && props.tokens[newVal]?.isLoraTag) {
    const text = props.tokens[newVal].text
    const match = text.match(/<wlr:([^:]+):([^:]+):([^>]+)>/)
    if (match) {
      loraModelWeight.value = parseFloat(match[2])
      loraTextWeight.value = parseFloat(match[3])
    }
  }
})

watch(() => props.tokens.length, (len) => {
  if (activeControls.value !== null && activeControls.value >= len) {
    activeControls.value = null
  }
})

onBeforeUpdate(() => {
  for (const key in tokenInputRefs) {
    delete tokenInputRefs[key]
  }
})

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  pendingDropVisual = null
  if (dragVisualRafId) {
    cancelAnimationFrame(dragVisualRafId)
    dragVisualRafId = 0
  }
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
}

.token-drop-indicator {
  position: absolute;
  z-index: 20;
  width: 2px;
  background: #58b8ff;
  border-radius: 2px;
  box-shadow: 0 0 8px rgb(88 184 255 / 45%);
  pointer-events: none;
}

.token-drop-end-zone {
  display: inline-block;
  width: 16px;
  min-height: 34px;
  vertical-align: middle;
  opacity: 0;
}
</style>


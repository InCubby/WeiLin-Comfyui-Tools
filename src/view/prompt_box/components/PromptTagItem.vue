<template>
  <div
    class="token-item-wrapper"
    @dragover.prevent="emit('drag-over', index, $event)"
    @drop="emit('drop', index, $event)"
  >
    <div
      class="token-item-box"
      :draggable="!token.isEditing"
      :style="{ backgroundColor: token.color }"
      :class="{
        'token-item-box-disabled': token.isHidden,
        'token-item-box-drag-source': isDragSource,
        'token-item-box-dragging': isDragging,
        'token-item-box-drop-target': showDropIndicator,
        'token-item-box-selected': isSelected
      }"
      @mousedown.stop
      @dragstart="emit('drag-start', index, $event)"
      @dragend="emit('drag-end', index, $event)"
      @dblclick="emit('toggle-hidden', index)"
    >
    <div
      v-if="token.text === '\n'"
      class="newline-token"
    >
      <span class="token-symbol" :title="t('promptBox.newline')">↵</span>
    </div>

    <div
      v-else-if="token.text === '\t'"
      class="token-item tab-token"
      @mouseenter="emit('show-controls', index, $event)"
      @mouseleave="emit('mouse-leave', index)"
    >
      <span class="token-symbol" :title="t('promptBox.tab')">→</span>
    </div>

    <div
      v-else-if="token.text"
      class="token-item"
      :class="{ punctuation: token.isPunctuation }"
      @mouseenter="emit('show-controls', index, $event)"
      @mouseleave="emit('mouse-leave', index)"
    >
      <span v-if="!token.isEditing || token.isPunctuation" @click="!token.isPunctuation && emit('start-editing', index)">
        {{ token.text }}
      </span>
      <input
        v-else-if="!token.isPunctuation"
        :value="token.text"
        @input="emit('token-edit', index, $event)"
        @blur="emit('finish-editing', index)"
        @keyup.enter="emit('finish-editing', index)"
        :ref="setInputRef"
      />
      <button
        v-if="showDeleteButton"
        class="quick-delete-btn"
        @click.stop="emit('delete-token', index)"
        :title="t('promptBox.delete')"
        style="margin-left: 4px;"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            fill="#ff4d4f70"
          />
        </svg>
      </button>
    </div>

      <div
        class="translation-result"
        v-if="token.text !== '\n' && token.text !== '\t'"
      >
      <div
        v-if="isTextTranslatable(token.text)"
        @click="emit('translate-click', token.text, token)"
        class="translate-button"
        :title="t('promptBox.translate')"
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
      </div>
      <span class="translated-text">{{ token.translate ? token.translate : '' }}</span>
      </div>
    </div>
  </div>

  <div v-if="token.text === '\n'" class="line-break"></div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const props = defineProps({
    token: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    showDeleteButton: {
      type: Boolean,
      default: true
    },
    isDragSource: {
      type: Boolean,
      default: false
    },
    isDragging: {
      type: Boolean,
      default: false
    },
    showDropIndicator: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isTextTranslatable: {
      type: Function,
      required: true
    }
  })

  const emit = defineEmits([
    'drag-start',
    'drag-end',
    'drag-over',
    'drop',
    'toggle-hidden',
    'show-controls',
    'mouse-leave',
    'start-editing',
    'token-edit',
    'finish-editing',
    'delete-token',
    'translate-click',
    'register-input-ref'
  ])

  const setInputRef = (el) => {
    emit('register-input-ref', props.index, el)
  }
</script>

<style scoped>
  .token-item-wrapper {
    display: inline-block;
  }

  .token-item {
    overflow: visible;
    color: var(--weilin-prompt-ui-primary-text);
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    align-items: center;
  }

  .token-item-icon {
    width: 12px;
    height: 12px;
    fill: var(--weilin-prompt-ui-icon-color);
  }

  .token-item input {
    width: auto;
    min-width: 20px;
    padding: 4px 8px;
    border: 2px solid var(--weilin-prompt-ui-primary-color);
    border-radius: 4px;
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;
    margin: -4px 0;
    box-sizing: border-box;
    background: var(--weilin-prompt-ui-input-bg);
    color: var(--weilin-prompt-ui-primary-text);
    box-shadow: 0 0 0 2px rgb(24 144 255 / 0.1);
    transition: all 0.2s ease;
  }

  .token-item input:focus {
    outline: none;
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgb(24 144 255 / 0.2);
  }

  .line-break {
    display: block;
    width: 100%;
    height: 1px;
    clear: both;
  }

  .newline-token {
    color: var(--weilin-prompt-ui-secondary-text);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    font-size: 14px;
    display: inline-block;
  }

  .newline-token::after {
    content: '';
    width: 100%;
    order: 1;
  }

  .newline-token ~ .token-item-box {
    order: 2;
  }

  .tab-token {
    color: var(--weilin-prompt-ui-secondary-text);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    font-size: 14px;
  }

  .newline-token:hover,
  .tab-token:hover {
    transform: translateY(-1px);
  }

  .token-symbol {
    font-family: monospace;
    user-select: none;
    font-size: 14px;
    opacity: 0.8;
  }

  .token-item.punctuation {
    cursor: default;
    color: var(--weilin-prompt-ui-secondary-text);
  }

  .token-item.punctuation:hover {
    transform: none;
    box-shadow: none;
    background-color: var(--weilin-prompt-ui-secondary-bg);
  }

  .translation-result {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.2;
  }

  .translation-result .translate-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    padding: 0;
    margin: 0;
    line-height: 1;
    border: none;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .translation-result .translate-button .token-item-icon {
    width: 12px;
    height: 12px;
    display: block;
  }

  .translation-result button:hover {
    background-color: var(--weilin-prompt-ui-primary-color-hover);
  }

  .translated-text {
    display: inline-flex;
    align-items: center;
    min-height: 14px;
    color: var(--weilin-prompt-ui-primary-text);
    font-weight: 500;
    font-size: 12px;
    line-height: 1.2;
  }

  .token-item-box {
    display: inline-block;
    flex-direction: column;
    padding: 3px 6px;
    background-color: var(--weilin-prompt-ui-token-bg);
    border-radius: 6px;
    overflow: hidden;
    color: var(--weilin-prompt-ui-primary-text);
    transition: all 0.2s ease;
    border: 1px solid transparent;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 1px 2px var(--weilin-prompt-ui-shadow-color);
    cursor: grab;
  }

  .token-item-box-drop-target {
    position: relative;
  }

  .token-item-box-drop-target::after {
    content: '';
    position: absolute;
    left: 0;
    top: 3px;
    bottom: 3px;
    width: 3px;
    border-radius: 999px;
    background: #58b8ff;
    pointer-events: none;
    z-index: 3;
  }

  .token-item-box:active {
    cursor: grabbing;
  }

  .token-item-box:hover {
    background-color: var(--weilin-prompt-ui-hover-bg-color);
    border-color: var(--weilin-prompt-ui-border-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px var(--weilin-prompt-ui-shadow-color);
  }

  .token-item-box-dragging,
  .token-item-box-dragging:hover {
    transform: none;
    box-shadow: none;
  }

  .quick-delete-btn {
    opacity: 0.6;
    transition: opacity 0.2s;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    border-radius: 3px;
  }

  .quick-delete-btn:hover {
    opacity: 1;
    background: rgb(255 77 79 / 0.1);
  }

  .token-item-box-disabled {
    opacity: 0.5 !important;
    position: relative;
    border: 1px solid #ff4d4f !important;
  }

  .token-item-box-disabled::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent calc(50% - 1px),
      #ff4d4f calc(50% - 1px),
      #ff4d4f calc(50% + 1px),
      transparent calc(50% + 1px)
    );
    pointer-events: none;
    z-index: 1;
  }

  .token-item-box-disabled > * {
    position: relative;
    z-index: 2;
  }

  .token-item-box-selected {
    border: 2px solid #4285f4 !important;
    box-shadow: 0 0 8px #4285f455;
    background-color: rgb(66 133 244 / 0.08) !important;
    transition:
      border-color 0.2s,
      box-shadow 0.2s,
      background-color 0.2s;
    z-index: 2;
  }

  .token-item-box-drag-source {
    opacity: 1;
  }
</style>

<template>
  <div :class="`${prefix}node-list`">
    <div :class="`${prefix}node-list-content`">
      <div :class="`${prefix}node-list-body`">
        <div :class="`${prefix}node-list-items`">
          <div v-for="item in nodeLists" :key="item.id" class="node-item">
            <div class="node-info">
              <div class="node-header">
                <span class="node-name" :title="item.title">#{{ item.id }} - {{ item.title }}</span>
              </div>
              <div class="node-content">
                <div class="node-text" :title="item.text">
                  {{ item.text }}
                </div>
                <div class="node-actions">
                  <button @click="openPromptUI(item.seed)" class="open-button">
                    {{ t('nodeListWindow.openPromptUI') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const prefix = 'weilin_prompt_ui_'
  const { t } = useI18n()

  const nodeLists = ref([])

  window.addEventListener('message', (event) => {
    if (event.data.type === 'weilin_prompt_ui_update_node_list_info') {
      nodeLists.value = event.data.nodeList
    }
  })

  const openPromptUI = (seed) => {
    window.postMessage({ type: 'weilin_prompt_ui_prompt_open_node_wit_seed', seed: seed }, '*')
  }

  onMounted(() => {
    window.postMessage({ type: 'weilin_prompt_ui_prompt_get_node_list_info' }, '*')
  })
</script>

<style scoped>
  .weilin_prompt_ui_node-list {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    background: var(--weilin-prompt-ui-primary-bg);
  }

  .weilin_prompt_ui_node-list-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .weilin_prompt_ui_node-list-body {
    flex: 1;
    overflow-y: auto;
  }

  .weilin_prompt_ui_node-list-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .node-item {
    background: var(--weilin-prompt-ui-secondary-bg);
    border: 1px solid var(--weilin-prompt-ui-border-color);
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .node-item:hover {
    border-color: var(--weilin-prompt-ui-primary-color);
    box-shadow: 0 2px 8px var(--weilin-prompt-ui-shadow-color);
  }

  .node-info {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .node-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--weilin-prompt-ui-primary-bg);
    border-bottom: 1px solid var(--weilin-prompt-ui-border-color);
  }

  .node-name {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--weilin-prompt-ui-primary-text);
    font-size: 14px;
    font-weight: 500;
  }

  .node-content {
    padding: 12px;
    background: var(--weilin-prompt-ui-secondary-bg);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .node-text {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: var(--weilin-prompt-ui-primary-text);
  }

  .node-actions {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .open-button {
    width: fit-content;
    padding: 4px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: var(--weilin-prompt-ui-primary-color);
    color: #fff;
    font-size: 14px;
  }

  .open-button:hover {
    background-color: var(--weilin-prompt-ui-primary-color-hover);
  }
</style>

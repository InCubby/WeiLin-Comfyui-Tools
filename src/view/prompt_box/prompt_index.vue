<template>
  <div class="weilin_prompt_ui_prompt-box">
    <!-- 内部小提示框：更新标签 -->
    <transition name="weilin-fade">
      <div v-if="toastVisible" class="weilin-toast" role="status" aria-live="polite">已更新标签</div>
    </transition>

    <!-- 主标签管理器（左侧边栏） -->
    <!-- <MainLabelManager ref="mainLabelManagerRef" :selected-id="selectedMainLabelId" @select="onSelectMainLabel" /> -->
    <MainLabelManager v-if="isLabelManagerVisible" ref="mainLabelManagerRef" :selected-id="selectedMainLabelId"
      @select="onSelectMainLabel" />
    <!-- 主要内容容器 -->
    <div :class="`${prefix}main-content`"
      :style="{ width: mainContentWidth, paddingLeft: isLabelManagerVisible ? '8px' : '0px' }">
      <!-- 操作栏 -->
      <div class="center-container">

        <!-- <div class="action-item">
      <button class="tag-manager-btn" @click="toggleLabelManager" :title="t(isLabelManagerVisible ? 'controls.hideSidebar' : 'controls.showSidebar')">
        <svg class="sidebar-toggle-icon" :class="{ 'is-closed': !isLabelManagerVisible }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        <span class="action-text">{{ t('controls.sidebar') }}</span>
      </button>
    </div> -->
        <div class="action-item">
          <button class="tag-manager-btn" @click="toggleLabelManager"
            :title="isLabelManagerVisible ? '收起标签栏' : '展开标签栏'">

            <svg class="weilin-comfyui-sidebar-toggle-icon" :class="{ 'is-closed': !isLabelManagerVisible }"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>

            <span class="action-text">
              {{ isLabelManagerVisible ? '收起标签栏' : '展开标签栏' }}
            </span>
          </button>
        </div>
        <div class="action-item">
          <button class="language-switch-btn" @click.stop="toggleLanguageSelector" ref="langBtnRef"
            :title="t('controls.language')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="translate-icon">
              <path
                d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            <span class="action-text">{{ t('controls.language') }}</span>
          </button>
          <Transition name="fade">
            <LanguageSwitcher v-if="showLanguageSelector" ref="languageSwitcherRef" @close="closeLanguageSelector" />
          </Transition>
        </div>

        <div class="action-item">
          <ThemeSwitch :title="t('controls.switchTheme')">
            <template #default="{ isDark }">
              <span class="action-text">{{ t(isDark ? 'controls.darkMode' : 'controls.lightMode') }}</span>
            </template>
          </ThemeSwitch>
        </div>

        <div class="action-item">
          <button class="settings-btn" @click="openSettings" :title="t('controls.settings')">
            <svg class="settings-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span class="action-text">{{ t('controls.settings') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openTagManager" :title="t('controls.tagManager')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="tag-icon">
              <path
                d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
            </svg>
            <span class="action-text">{{ t('controls.tagManager') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openDanbooruManager" :title="t('controls.danbooruManager')">
            <svg class="tag-icon" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
            </svg>
            <span class="action-text">{{ t('controls.danbooruManager') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openHistoryBox" :title="t('controls.history')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="tag-icon" width="24" height="24">
              <path
                d="M653.7 85.83c-235.05 0-426.29 191.25-426.29 426.3s191.24 426.3 426.29 426.3c235.06 0 426.3-191.25 426.3-426.3S888.76 85.83 653.7 85.83z m0 779.98c-195.01 0-353.67-158.65-353.67-353.68S458.69 158.45 653.7 158.45c195.02 0 353.68 158.65 353.68 353.68S848.72 865.81 653.7 865.81z">
              </path>
              <path
                d="M866.78 634.19L695.93 533.61V302.59c0-20.06-16.26-36.31-36.31-36.31s-36.31 16.26-36.31 36.31v253.66c0 17.06 11.8 31.26 27.66 35.16l178.98 105.36c17.28 10.17 39.54 4.41 49.71-12.87 10.17-17.28 4.4-39.54-12.88-49.71zM44.76 324.51h186.42c20.05 0 36.31-16.26 36.31-36.31s-16.26-36.31-36.31-36.31H44.76c-20.05 0-36.31 16.26-36.31 36.31s16.26 36.31 36.31 36.31zM231.18 703.25H44.76c-20.05 0-36.31 16.26-36.31 36.31s16.26 36.31 36.31 36.31h186.42c20.05 0 36.31-16.26 36.31-36.31s-16.25-36.31-36.31-36.31zM36.31 550.19h118.8c20.05 0 36.31-16.26 36.31-36.31s-16.26-36.31-36.31-36.31H36.31c-20.05 0-36.31 16.26-36.31 36.31 0 20.06 16.26 36.31 36.31 36.31z">
              </path>
            </svg>
            <span class="action-text">{{ t('controls.history') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openGitHub" :title="t('controls.github')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="tag-icon" width="24" height="24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span class="action-text">{{ t('controls.github') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="shareCloudData" :title="t('controls.shareCloudData')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="tag-icon" width="24" height="24">
              <path
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
            </svg>
            <span class="action-text">{{ t('controls.shareCloudData') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openSponsor" :title="t('controls.sponsor')">
            <svg t="1745823985128" class="tag-icon" viewBox="0 0 1322 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path
                d="M495.899049 634.906371c-17.304811 0-31.251971 13.947161-31.251971 31.251971S478.594238 697.410314 495.899049 697.410314c17.304811 0 31.251971-13.947161 31.251971-31.251972 0-17.304811-13.947161-31.251971-31.251971-31.251971zM790.855671 728.662285c-17.304811 0-31.251971 13.947161-31.251972 31.251971s13.947161 31.251971 31.251972 31.251972 31.251971-13.947161 31.251971-31.251972c0-17.04653-13.947161-30.993691-31.251971-31.251971z">
              </path>
              <path
                d="M1262.99289 719.622459c-13.430599-8.264984-28.927445-13.430599-44.68257-14.980284 34.867902-84.974368 57.080047-196.293374-18.596215-306.837537-115.193217-168.657333-280.75118-256.73107-491.766556-260.863562-60.179416-1.291404-130.948343 1.549685-205.849762 4.649054-87.040614 3.35765-203.008673 8.006703-281.526023 1.549684 15.755126-8.523265 32.543375-16.788249 47.007098-23.761829 55.530362-27.119479 98.921529-48.04022 84.457807-85.232649-7.748423-21.695583-30.218848-33.059937-67.411277-34.09306C206.624604-1.755689 37.967271 43.443443 7.748423 119.636265c-17.04653 42.874605-19.887618 125.524447 152.902206 198.876182 71.027208 30.218848 271.969635 66.894715 349.453861 74.643138 17.563091 1.549685 34.867902 5.165615 51.397871 11.364353-17.821372 11.622634-35.901025 24.02011-54.238959 36.417586-31.768533-18.079653-83.941245-39.516955-122.683358-13.172318-14.463722 9.298107-23.503549 25.053233-24.02011 42.358044-0.516562 21.179022 12.397476 42.099763 26.861198 58.629731-57.080047 45.715694-103.312302 89.881703-119.84227 123.974762-18.337934 41.841482-25.828075 110.544163 8.523265 177.438879 43.391167 84.974368 138.955046 144.120661 284.625391 176.147474 190.352916 41.583202 354.619476 4.132492 463.355674-53.205835 60.437697-32.026814 103.570583-69.994085 124.233043-103.828864 6.457019 2.066246 12.914038 4.132492 19.629338 6.198738 9.298107 2.841088 18.596214 5.682177 27.37776 8.781546 28.669164 10.072949 60.695977 8.523265 85.232649-3.61593l1.291403-0.774843c17.821372-9.039826 31.510252-25.053233 37.708991-44.166009 15.238565-51.139589-29.444006-79.033911-56.563486-96.08044z m-811.776412-239.684541l-17.30481 12.655757c-5.165615-5.165615-9.814669-11.106072-13.430599-17.563091 6.7153-2.066246 18.337934 0.258281 30.735409 4.907334zM1262.99289 798.139808c-1.291404 3.874211-4.132492 6.97358-9.298107 9.814669-10.33123 5.165615-25.569795 5.423896-39.258675 0.774842-9.298107-3.35765-19.371057-6.457019-29.444006-9.556388-18.596214-5.682177-49.848186-15.238565-55.788643-22.470426-9.814669-12.914038-28.152602-15.755126-41.32492-5.940457s-15.755126 28.152602-5.940458 41.324921c3.615931 4.390773 7.490142 8.264984 12.139196 11.622634-44.940851 62.245662-242.267348 186.220424-521.468844 125.007885-125.782728-27.636041-210.498815-77.742507-244.850155-145.412065-24.794952-48.815063-19.112776-98.921529-7.231861-126.299289 34.09306-71.027208 280.75118-234.518925 438.30244-327.241716 13.947161-8.264984 18.596214-26.344637 10.33123-40.291798s-27.119479-19.629337-40.291797-10.33123c-12.655757 7.490142-55.788643 33.059937-111.060725 68.186119-18.596214-12.655757-50.881309-27.894322-102.537459-33.059936-81.874999-8.264984-270.936512-44.42429-332.149051-70.252366C139.471608 245.418993 40.033517 196.34565 61.987381 141.073568c5.165615-12.914038 29.185725-33.576498 81.100157-53.464116 35.384463-13.430599 72.318611-22.470426 109.769321-27.119479l-11.622634 5.682176c-35.384463 17.304811-73.868296 36.417586-99.954652 59.146293-1.807965-1.033123-3.615931-2.324527-5.165615-3.874211-10.847792-11.622634-29.185725-12.397476-41.06664-1.291404l-0.516562 0.516561c-11.880915 11.106072-12.139195 29.702287-1.033123 41.583202 10.589511 11.106072 26.086356 19.371057 45.715694 25.569795 0.774842 0.258281 1.291404 0.516562 2.066246 0.774842 68.702681 21.179022 190.611197 18.596214 362.367899 11.622634 74.126577-2.841088 144.120661-5.682177 202.492111-4.649054 193.710566 3.874211 339.122631 80.841876 444.75946 235.552049 64.828469 95.047318 41.583202 188.544951 4.390773 269.903388-4.649054-3.615931-9.039826-7.748423-12.655757-12.139195-10.33123-12.397476-28.669164-14.463722-41.324921-4.649054-12.655757 10.072949-14.722003 28.669164-4.649054 41.324921 5.940457 7.490142 36.675867 42.874605 74.643138 39.775236h2.066246c1.291404-0.258281 2.324527 0 3.615931-0.258281 25.828075-4.649054 42.358044-3.615931 57.596608 6.198738 20.40418 12.914038 30.218848 20.40418 28.410883 26.861199z">
              </path>
            </svg>
            <span class="action-text">{{ t('controls.sponsor') }}</span>
          </button>
        </div>



        <SettingDialog ref="settingDialog" />

        <!-- 把“更新标签”按钮放在操作栏最右侧 -->
        <div class="action-item weilin-comfyui-toolbar-right">
          <button class="update-label-btn" :class="{ 'is-dirty': unsavedChanges }"
            :disabled="!selectedMainLabelId || !unsavedChanges" @click="updateSelectedLabel">
            更新标签
          </button>
        </div>

      </div>

      <div class="weilin_prompt_ui_main-scroll">
        <PromptTagEditor
          ref="promptTagEditorRef"
          :editor-refs="editorRefs"
          :editor-state="editorState"
          :editor-handlers="editorHandlers"
          :is-translate-tag-enabled="isTranslateTagEnabled"
          :is-delete-button-enabled="isDeleteButtonEnabled"
          :is-clear-all-enabled="isClearAllEnabled"
          :is-clear-disabled-enabled="isClearDisabledEnabled"
          :tokens="tokens"
          :is-text-translatable="isTextTranslatable"
          @clear-all="clearAllPrompt"
          @clear-disabled="clearDisabledTags"
        />

      <!-- 标签管理器容器 -->
      <div class="tag-manager-section">
        <div class="tag-manager-header" @click="toggleTagManager">
          <div class="header-left">
            <svg class="tag-icon" viewBox="0 0 24 24">
              <path
                d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
            </svg>
            <span class="section-title">{{ t('controls.tagManager') }}</span>
          </div>
          <div class="header-right">
            <svg class="collapse-icon" :class="{ 'is-collapsed': !showTagManager }" viewBox="0 0 24 24">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
          </div>
        </div>
        <div class="tag-manager-container" v-show="showTagManager">
          <TagManager />
        </div>
      </div>
      </div>

    </div>
  </div>

  <RandomSetting ref="randomSettingItem" />
</template>

<script setup>
import { ref, watch, onBeforeUpdate, onMounted, onUnmounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SettingDialog from './components/setting_dialog.vue'
import ThemeSwitch from '@/components/ThemeSwitch.vue'
import TagManager from '@/view/tag_manager/tag_index.vue'  // 导入 TagManager 组件
import PromptTagEditor from './components/PromptTagEditor.vue'
import MainLabelManager from './components/main_label_manager.vue'
import { translatorApi } from '@/api/translator'
import { historyApi } from '@/api/history'
import message from '@/utils/message'
import { autocompleteApi } from '@/api/autocomplete'
import RandomSetting from './components/random_setting.vue'
import { randomTagApi } from '@/api/random_tag'
import pako from 'pako'

const randomSettingItem = ref(null)

const prefix = "weilin_prompt_ui_"
const { t } = useI18n()

const autocompleteContainerRef = ref()
const inputAreaRef = ref()
const autocompletePosition = ref({ top: 0, left: 0 })
const setInputAreaRef = (el) => {
  inputAreaRef.value = el
}
const setAutocompleteContainerRef = (el) => {
  autocompleteContainerRef.value = el
}

// 在data或ref部分添加
const tokenCount = ref(0)

const props = defineProps({
  promptManager: {
    type: String,
    default: 'prompt_global'
  },
})

const parentCneterBox = ref(null)
const setParentCneterBoxRef = (el) => {
  parentCneterBox.value = el
}

// 输入prompt信息
const inputText = ref('')
const tokens = ref([])
const tokenInputRefs = {}
const registerTokenInputRef = (index, el) => {
  if (el) tokenInputRefs[index] = el
}
const activeControls = ref(null)
const isOverControls = ref(false)
const setIsOverControls = (value) => {
  isOverControls.value = value
}
const controlsPosition = ref({
  top: '0px',
  left: '0px'
})
const showLanguageSelector = ref(false)
const settingDialog = ref(null)
const langBtnRef = ref(null)
const languageSwitcherRef = ref(null)

// 添加自动补全相关的 ref
const showAutocomplete = ref(false);
const autocompleteResults = ref([]);
const selectedAutocompleteIndex = ref(0);
const selectedItemRef = ref(null);
const setSelectedItemRef = (el) => {
  selectedItemRef.value = el
}
const saveAutoCompleteWidth = ref(localStorage.getItem('weilin_prompt_ui_auto_box_width') || 450);
const saveAutoCompleteHeight = ref(localStorage.getItem('weilin_prompt_ui_auto_box_height') || 350);

const editorRefs = {
  setParentCneterBoxRef,
  setInputAreaRef,
  setAutocompleteContainerRef,
  setSelectedItemRef
}

const editorState = computed(() => ({
  inputText,
  tokenCount,
  autocompletePosition,
  adjustedAutocompletePosition,
  showAutocomplete,
  saveAutoCompleteWidth,
  saveAutoCompleteHeight,
  autocompleteResults,
  selectedAutocompleteIndex
}))

const editorHandlers = computed(() => ({
  handleInput,
  onBlur,
  selectAutocomplete
}))

const showTagTipsBox = ref(false);
const tagTipsPosition = ref({
  top: '0px',
  left: '0px'
});

// 组件挂载时添加监听器
onMounted(() => {
  window.addEventListener('storage', handleFunctionTogglesStorageChange);
});

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('storage', handleFunctionTogglesStorageChange);
});


// 添加防抖相关的变量
const debounceTimeout = ref(null); // 用于存储 setTimeout 的 ID
const proceTimeout = ref(null);
const lastInputValue = ref(''); // 用于存储上一次的输入内容

// 在data或ref部分添加一个计数器用于生成唯一ID
const tokenIdCounter = ref(0);

// 控制左侧标签管理器是否可见的状态
const isLabelManagerVisible = ref(true);

// 用于本地存储的键名
const STORAGE_KEY_SIDEBAR_VISIBLE = 'weilin_prompt_ui_sidebar_visible';

// 功能开关状态变量 - 从localStorage读取初始值，默认值都为true
const isClearAllEnabled = ref(localStorage.getItem('weilin_function_toggles_clearAll') !== 'false');
const isDeleteButtonEnabled = ref(localStorage.getItem('weilin_function_toggles_deleteButton') !== 'false');
const isRandomTagEnabled = ref(localStorage.getItem('weilin_function_toggles_randomTag') !== 'false');
const isRandomTagSettingsEnabled = ref(localStorage.getItem('weilin_function_toggles_randomTagSettings') !== 'false');
const isTranslateTagEnabled = ref(localStorage.getItem('weilin_function_toggles_translateTag') !== 'false');
const isClearDisabledEnabled = ref(localStorage.getItem('weilin_function_toggles_clearDisabled') !== 'false');

// 监听功能开关变化并保存到 localStorage
watch([isClearAllEnabled, isDeleteButtonEnabled, isRandomTagEnabled, isRandomTagSettingsEnabled, isTranslateTagEnabled, isClearDisabledEnabled],
  ([clearAll, deleteButton, randomTag, randomTagSettings, translateTag, clearDisabled]) => {
    localStorage.setItem('weilin_function_toggles_clearAll', String(clearAll));
    localStorage.setItem('weilin_function_toggles_deleteButton', String(deleteButton));
    localStorage.setItem('weilin_function_toggles_randomTag', String(randomTag));
    localStorage.setItem('weilin_function_toggles_randomTagSettings', String(randomTagSettings));
    localStorage.setItem('weilin_function_toggles_translateTag', String(translateTag));
    localStorage.setItem('weilin_function_toggles_clearDisabled', String(clearDisabled));
  }
);

// 监听功能开关设置的存储变化
const handleFunctionTogglesStorageChange = (e) => {
  if (e.key === 'weilin_function_toggles_clearAll') {
    isClearAllEnabled.value = e.newValue !== 'false';
  } else if (e.key === 'weilin_function_toggles_deleteButton') {
    isDeleteButtonEnabled.value = e.newValue !== 'false';
  } else if (e.key === 'weilin_function_toggles_randomTag') {
    isRandomTagEnabled.value = e.newValue !== 'false';
  } else if (e.key === 'weilin_function_toggles_randomTagSettings') {
    isRandomTagSettingsEnabled.value = e.newValue !== 'false';
  } else if (e.key === 'weilin_function_toggles_translateTag') {
    isTranslateTagEnabled.value = e.newValue !== 'false';
  } else if (e.key === 'weilin_function_toggles_clearDisabled') {
    isClearDisabledEnabled.value = e.newValue !== 'false';
  }
};

// 切换标签管理器的显示状态
const toggleLabelManager = () => {
  isLabelManagerVisible.value = !isLabelManagerVisible.value;
};

// 监听状态变化并保存到 localStorage
watch(isLabelManagerVisible, (newValue) => {
  localStorage.setItem(STORAGE_KEY_SIDEBAR_VISIBLE, String(newValue));
});

// 组件挂载时，从 localStorage 读取并恢复状态
onMounted(() => {
  const savedState = localStorage.getItem(STORAGE_KEY_SIDEBAR_VISIBLE);
  // 默认值为 true (显示)，如果存储了 'false' 则为 false
  isLabelManagerVisible.value = savedState !== 'false';
  // ... 其他 onMounted 逻辑
});

// 生成唯一ID的函数
const generateUniqueId = () => {
  tokenIdCounter.value++;
  return `token_${tokenIdCounter.value}_${Date.now()}`;
};

// 左侧主标签管理器交互与主内容宽度计算
const mainLabelManagerRef = ref(null)
const promptTagEditorRef = ref(null)
const selectedMainLabelId = ref(null)
const unsavedChanges = ref(false)
// 记录/恢复最后选中的主标签
const LAST_LABEL_KEY = `weilin_prompt_ui_last_main_label_id_${props.promptManager || 'default'}`
const MAIN_LABELS_STORAGE_KEY = 'weilin_prompt_ui_main_labels_v1'
// --- 修改 mainContentWidth 计算属性 ---
const mainContentWidth = computed(() => {
  // 根据 isLabelManagerVisible 决定左侧标签管理器的宽度
  const labelManagerWidth = isLabelManagerVisible.value ? 280 : 0;
  const left = labelManagerWidth;
  return `calc(100% - ${left}px)`;
});

let suppressUnsavedOnce = false
const onSelectMainLabel = (item) => {
  // console.log('onSelectMainLabel', item)
  if (!item) {
    selectedMainLabelId.value = null
    inputText.value = ''
    nextTick(() => {
      if (inputAreaRef.value) {
        inputAreaRef.value.value = ''
        handleInput({ target: inputAreaRef.value })
      }
    })
    unsavedChanges.value = false
    return
  }
  selectedMainLabelId.value = item.id
  suppressUnsavedOnce = true
  inputText.value = item.content || ''
  nextTick(() => {
    if (inputAreaRef.value) {
      inputAreaRef.value.value = inputText.value
      // 模拟输入事件，触发 tokens 解析与渲染
      handleInput({ target: inputAreaRef.value })
    }
  })
  unsavedChanges.value = false
}

// 将输入框的变更回写到选中的主标签
// 仅做“有未保存变更”的标记，不再自动写回标签
watch(inputText, (v) => {
  if (suppressUnsavedOnce) { suppressUnsavedOnce = false; return }
  unsavedChanges.value = true
})
// 在标签 tokens 序列变更时标记为有未保存变更（初始化期间除外）
watch(tokens, () => {
  if (!suppressUnsavedOnce) unsavedChanges.value = true
}, { deep: true })


// 监听并持久化最后选中的主标签 ID
watch(selectedMainLabelId, (id) => {
  try { localStorage.setItem(LAST_LABEL_KEY, id || '') } catch { }
})

// 恢复最后一次选中的主标签
function restoreLastSelectedMainLabel() {
  try {
    const lastId = localStorage.getItem(LAST_LABEL_KEY)
    if (!lastId) return
    const raw = localStorage.getItem(MAIN_LABELS_STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    const node = Array.isArray(arr) ? arr.find(x => x && x.id === lastId) : null
    if (!node) return
    selectedMainLabelId.value = lastId
    suppressUnsavedOnce = true
    inputText.value = node.content || ''
    nextTick(() => {
      if (inputAreaRef.value) {
        inputAreaRef.value.value = inputText.value
        handleInput({ target: inputAreaRef.value })
      }

      // 初始化渲染完毕，解除一次性抑制
      suppressUnsavedOnce = false
    })
    unsavedChanges.value = false
  } catch { }
}

onMounted(() => {
  // 页面加载时尝试恢复上次的主标签选择
  restoreLastSelectedMainLabel()
  // 关闭页面前保存选中状态（兜底一次）
  const saveLast = () => { try { localStorage.setItem(LAST_LABEL_KEY, selectedMainLabelId.value || '') } catch { } }
  window.addEventListener('beforeunload', saveLast)
  onBeforeUnmount(() => window.removeEventListener('beforeunload', saveLast))
})

// 点击“更新标签”时才把文本写回当前标签
function updateSelectedLabel() {
  if (!selectedMainLabelId.value) return
  if (!mainLabelManagerRef.value?.updateSelectedContent) return
  const content = promptTagEditorRef.value?.getPromptText?.() ?? inputText.value
  mainLabelManagerRef.value.updateSelectedContent(content)
  unsavedChanges.value = false
  showUpdatedToast()
}

// 轻量提示框（toast）
const toastVisible = ref(false)
let toastTimer = null
function showUpdatedToast() {
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 1600)
}
onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})


const openSettings = () => {
  settingDialog.value.open()
}

// 在 script 中添加相关方法
const weightValue = ref(1);
const setWeightValue = (value) => {
  weightValue.value = value
}

const applyWeight = () => {
  if (activeControls.value === null) return;

  const token = tokens.value[activeControls.value];
  let text = token.text;

  // 检查括号是否完整
  if (!isBracketComplete(text)) {
    message({ type: "warn", str: 'message.noFinishKuo' });
    return;
  }

  // 辅助函数：检查是否只有一层圆括号
  const hasOnlySingleParentheses = (text) => {
    return text.startsWith('(') && text.endsWith(')') &&
      !text.slice(1, -1).includes('(') &&
      !text.slice(1, -1).includes(')') &&
      !text.slice(1, -1).includes('[') &&
      !text.slice(1, -1).includes(']') &&
      !text.slice(1, -1).includes('{') &&
      !text.slice(1, -1).includes('}') &&
      !text.slice(1, -1).includes('<') &&
      !text.slice(1, -1).includes('>');
  };

  // 辅助函数：查找文本中的现有权重值
  const getExistingWeight = (text) => {
    const weightMatch = text.match(/:(-?\d+(\.\d+)?)$/); // 支持负数
    return weightMatch ? parseFloat(weightMatch[1]) : null;
  };

  // 辅助函数：从嵌套括号中提取最内层内容
  const extractInnerContent = (text) => {
    // 查找最内层的内容，不包括权重
    const innerMatch = text.match(/^([\(\[\{\<]*)(.*?)(?::[\d.]+)?([\)\]\}\>]*)$/);
    if (!innerMatch) return text;

    let [, outerBrackets, content, outerCloseBrackets] = innerMatch;

    // 如果内容中还有括号，递归处理
    if (/[\(\[\{\<].*[\)\]\}\>]/.test(content) && !content.includes('\\(') && !content.includes('\\)')) {
      const innerContent = extractInnerContent(content);
      return outerBrackets + innerContent + outerCloseBrackets;
    }

    return content;
  };

  // 主要处理逻辑
  let newText = text;

  // 检查是否整个文本已经有权重值（在末尾）
  const hasTrailingWeight = /:(-?\d+(\.\d+)?)$/.test(text);

  // 检查是否已经是带权重的格式：(内容:权重)
  const weightedFormatMatch = text.match(/^\((.*?):(-?\d+(\.\d+)?)\)$/);

  if (hasTrailingWeight || weightedFormatMatch) {
    // 已经有权重的情况
    if (weightValue.value === 1) {
      // 权重为1时，移除权重标记和外层括号（如果有）
      if (text.startsWith('(') && text.endsWith(')')) {
        // 移除外层括号和权重
        newText = text.slice(1, -1).replace(/:(\d+(\.\d+)?)$/, '');
      } else {
        // 只有权重，没有外层括号，仅移除权重
        newText = text.replace(/:(\d+(\.\d+)?)$/, '');
      }
    } else {
      // 权重不为1，替换权重值
      // 确保只替换最外层的权重，不影响内部括号中的权重
      if (weightedFormatMatch) {
        // 完整的(内容:权重)格式
        newText = `(${weightedFormatMatch[1]}:${weightValue.value})`;
      } else {
        // 只有末尾有权重
        newText = text.replace(/:(-?\d+(\.\d+)?)$/, `:${weightValue.value}`);;
      }
    }
  } else {
    // 处理没有权重的情况

    // 处理ask_(askzy)格式 -> (ask (askzy):1.1)
    const underscoreBracketMatch = text.match(/^([^_]+)_(\([^)]+\))$/);
    if (underscoreBracketMatch && !text.includes('\\(') && !text.includes('\\)')) {
      const [, prefix, bracketContent] = underscoreBracketMatch;
      if (weightValue.value === 1) {
        newText = text; // 权重为1时保持原样
      } else {
        newText = `(${prefix} ${bracketContent}:${weightValue.value})`;
      }
    }
    // 处理ask_\(askzy\)格式 -> (ask_\(askzy\):1.1)
    else if (text.includes('\\(') && text.includes('\\)') && !/[\(\)\[\]\{\}<>]/.test(text.replace(/\\[\(\)\[\]\{\}<>]/g, ''))) {
      if (weightValue.value === 1) {
        newText = text; // 权重为1时保持原样
      } else {
        // 检查是否已经有外层括号
        if (text.startsWith('(') && text.endsWith(')')) {
          newText = text.replace(/\)$/, `:${weightValue.value})`);
        } else {
          newText = `(${text}:${weightValue.value})`;
        }
      }
    }
    // 处理没有任何括号的情况
    else if (!/[\(\[\{\<\)\]\}\>]/.test(text)) {
      if (weightValue.value === 1) {
        newText = text; // 权重为1时保持原样
      } else {
        newText = `(${text}:${weightValue.value})`;
      }
    }
    // 处理只有一层圆括号的情况，权重为1时移除括号
    else if (weightValue.value === 1 && hasOnlySingleParentheses(text)) {
      newText = text.slice(1, -1);
    }
    // 处理包含内部括号的情况，确保权重调整应用于整个文本
    else {
      if (weightValue.value === 1) {
        // 权重为1时，保持原样
        newText = text;
      } else {
        // 检查文本是否已经被括号包裹
        if (text.startsWith('(') && text.endsWith(')')) {
          // 已经有圆括号包裹，直接在末尾添加权重
          newText = text.replace(/\)$/, `:${weightValue.value})`);
        } else {
          // 添加圆括号并在内部末尾添加权重
          newText = `(${text}:${weightValue.value})`;
        }
      }
    }
  }

  tokens.value[activeControls.value].text = newText;
  updateInputText();
};

// 修改wrapWith函数
const wrapWith = (bracketType) => {
  if (activeControls.value === null) return;

  const token = tokens.value[activeControls.value];
  let text = token.text;

  // 定义括号对
  const bracketPair = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>'
  }[bracketType];

  text = `${bracketType}${text}${bracketPair}`;

  tokens.value[activeControls.value].text = text;

  finishPromptPutItHistory();
};

const removeLayer = (bracketType) => {
  if (activeControls.value === null) return;
  const token = tokens.value[activeControls.value];
  let text = token.text;

  // 移除最外层对应类型的括号
  const bracketPair = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>'
  };

  if (text.startsWith(bracketType) && text.endsWith(bracketPair[bracketType])) {
    text = text.slice(1, -1);
    tokens.value[activeControls.value].text = text;
    finishPromptPutItHistory();
  }
};

// 添加括号完整性检查函数
const isBracketComplete = (text) => {
  const stack = [];
  const bracketMap = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>'
  };

  for (let char of text) {
    if (bracketMap[char]) {
      stack.push(char);
    } else if (Object.values(bracketMap).includes(char)) {
      if (stack.length === 0 || bracketMap[stack.pop()] !== char) {
        return false;
      }
    }
  }

  return stack.length === 0;
};

const getClosingBracket = (bracketType) => {
  switch (bracketType) {
    case '(': return ')';
    case '[': return ']';
    case '{': return '}';
    default: return '';
  }
};


// 在更新前清除 refs
onBeforeUpdate(() => {
  for (const key in tokenInputRefs) {
    delete tokenInputRefs[key]
  }
})

// 添加判断是否为标点符号的函数
const isPunctuation = (char) => {
  // 匹配中文标点和英文标点
  return /[\u2000-\u206F\u3000-\u303F\uFF00-\uFFEF!-/:-@\[-`{-~]/.test(char);
};

// 添加判断是否为英文的函数
const isEnglish = (text) => {
  return /^[a-zA-Z]+$/.test(text);
};
// 添加选择分割方式的变量
const splitByPunctuation = ref(true); // 默认以标点符号分割
const replaceUnderscoreWithSpace = ref(false); // 默认不替换下划线

const isTextTranslatable = (text) => {
  // 匹配包含任何语言的字母或字符
  // 包括但不限于：中文、英文、日文、韩文、阿拉伯文、俄文等
  // 排除纯数字、标点符号和特殊符号
  return /[\p{L}]/u.test(text);
};

const extractText = (input) => {
  // 匹配任意字符序列，直到遇到冒号
  const match = input.match(/([^:]+):[\d.]+/);
  // 如果找到了匹配项，则返回第一个捕获组，否则返回原输入
  return match ? match[1] : input;
}

const replaceTagsWithDesc = (text, tagMap) => {
  // 确保 tagMap 是 Map 类型
  if (!(tagMap instanceof Map)) {
    throw new Error("tagMap 必须是 Map 类型");
  }

  // 将所有 tag 拼接成一个正则表达式
  const tagsPattern = Array.from(tagMap.keys())
    .map(tag => {
      // 确保 tag 是字符串
      const tagStr = typeof tag === 'string' ? tag : String(tag);
      // 转义正则表达式的特殊字符
      return tagStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    })
    .join('|'); // 用 | 连接所有 tag

  // 创建全局不区分大小写的正则表达式
  const regex = new RegExp(tagsPattern, 'gi');

  // 使用 replace 和回调函数进行一次性替换
  return text.replace(regex, matchedTag => {
    // 查找对应的 desc
    const tagInfo = tagMap.get(matchedTag.toLowerCase()); // 假设不区分大小写
    return tagInfo ? tagInfo.desc : matchedTag; // 如果找不到 desc，返回原 tag
  });
};


let debounceTimer = null;
const calculateAutocompletePosition = async () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(async () => {
    if (!inputAreaRef.value) return;

    const textarea = inputAreaRef.value;
    const cursorPos = textarea.selectionStart;
    // console.log(textarea,cursorPos)

    // 确保自动补全窗口已经渲染
    await nextTick();

    // 创建镜像元素计算光标位置
    const text = textarea.value.substring(0, cursorPos);
    const mirror = document.createElement('div');
    mirror.style.position = 'absolute';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.style.width = window.getComputedStyle(textarea).width;
    mirror.style.font = window.getComputedStyle(textarea).font;
    mirror.style.padding = window.getComputedStyle(textarea).padding;

    const textNode = document.createTextNode(text);
    const cursorNode = document.createElement('span');
    cursorNode.textContent = '|';

    mirror.appendChild(textNode);
    mirror.appendChild(cursorNode);
    textarea.parentNode.appendChild(mirror);

    // 获取光标相对于父容器的位置
    const cursorRect = cursorNode.getBoundingClientRect();
    const parentRect = textarea.parentNode.getBoundingClientRect();

    // 计算初始位置
    let top = cursorRect.top - parentRect.top + cursorRect.height;
    let left = cursorRect.left - parentRect.left;

    // 等待DOM更新完成
    await nextTick();

    if (autocompleteContainerRef.value) {
      const autocompleteWidth = autocompleteContainerRef.value.offsetWidth;
      const textareaWidth = textarea.offsetWidth;
      const textareaLeft = textarea.getBoundingClientRect().left - parentRect.left;

      // 检查右边界
      if (left + autocompleteWidth > textareaLeft + textareaWidth) {
        left = textareaLeft + textareaWidth - autocompleteWidth;
      }

      // 检查左边界
      if (left < textareaLeft) {
        left = textareaLeft;
      }

      // 确保不会超出父容器
      left = Math.max(0, Math.min(left, parentRect.width - autocompleteWidth));
    }

    // 清理临时元素
    textarea.parentNode.removeChild(mirror);

    autocompletePosition.value = { top, left };
    debounceTimer = null;
  }, 50); // 50ms防抖
};

// 添加一个 ref 用于存储定时器
const historyTimer = ref(null);


// 处理输入事件
const handleInput = (event) => {
  if (!event?.target) return;

  if (!inputAreaRef.value) return

  // 获取原始输入值和光标位置
  const originalValue = event.target.value;
  const cursorPosition = event.target.selectionStart;
  const cursorEnd = event.target.selectionEnd;


  // 1. 首先处理格式转换
  const formatConversions = {
    comma: { enabled: localStorage.getItem('weilin_prompt_ui_comma_conversion') !== 'false', pattern: /，/g, replace: ',' },
    period: { enabled: localStorage.getItem('weilin_prompt_ui_period_conversion') !== 'false', pattern: /。/g, replace: '.' },
    bracket: {
      enabled: localStorage.getItem('weilin_prompt_ui_bracket_conversion') !== 'false', patterns: [
        { pattern: /【/g, replace: '[' },
        { pattern: /】/g, replace: ']' },
        { pattern: /（/g, replace: '(' },
        { pattern: /）/g, replace: ')' }
      ]
    },
    angleBracket: {
      enabled: localStorage.getItem('weilin_prompt_ui_angle_bracket_conversion') !== 'false', patterns: [
        { pattern: /《/g, replace: '<' },
        { pattern: /》/g, replace: '>' }
      ]
    }
    // 下划线转换已移至补全确认时执行
  };

  // 记录每个替换操作前光标位置的字符
  let beforeCursor = originalValue.substring(0, cursorPosition);
  let processedValue = originalValue;

  // 应用所有转换
  Object.values(formatConversions).forEach(conversion => {
    if (conversion.enabled) {
      if (conversion.pattern) {
        // 处理单个模式的替换
        beforeCursor = beforeCursor.replace(conversion.pattern, conversion.replace);
        processedValue = processedValue.replace(conversion.pattern, conversion.replace);
      } else if (conversion.patterns) {
        // 处理多个模式的替换
        conversion.patterns.forEach(({ pattern, replace }) => {
          beforeCursor = beforeCursor.replace(pattern, replace);
          processedValue = processedValue.replace(pattern, replace);
        });
      }
    }
  });

  // 2. 直接更新输入框值
  inputText.value = processedValue;

  // 3. 立即计算并设置新的光标位置
  // 使用转换后的beforeCursor长度作为新的光标位置
  const newCursorPosition = beforeCursor.length;
  const selectionDiff = cursorEnd - cursorPosition;
  const newCursorEnd = newCursorPosition + selectionDiff;

  // 确保DOM更新后立即设置光标位置
  nextTick(() => {
    if (inputAreaRef.value) {
      inputAreaRef.value.setSelectionRange(newCursorPosition, newCursorEnd);
      // 确保输入框获得焦点
      inputAreaRef.value.focus();
    }
  });

  // 4. 精确获取当前输入内容用于补全
  const textBeforeCursor = processedValue.substring(0, newCursorPosition);

  // 检查是否启用了逗号关闭补全窗口功能
  const isCommaCloseAutocompleteEnabled = localStorage.getItem('weilin_prompt_ui_comma_close_autocomplete') === 'true';

  // 检查是否刚刚输入了逗号或空格
  const lastChar = newCursorPosition > 0 ? textBeforeCursor[newCursorPosition - 1] : '';
  const justTypedDelimiter = lastChar === ',' || lastChar === ' ';

  // 如果输入了逗号或空格，并且启用了该功能，立即关闭补全列表
  if (justTypedDelimiter && isCommaCloseAutocompleteEnabled) {
    showAutocomplete.value = false;
    // 防抖处理 - 用于在逗号或空格后开始输入新内容时触发补全
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value);
    }
    debounceTimeout.value = setTimeout(() => {
      // 获取当前光标位置
      const currentCursorPos = inputAreaRef.value?.selectionStart || 0;
      const currentText = inputText.value || '';
      const textBeforeCursor = currentText.substring(0, currentCursorPos);

      // 查找当前单词起始位置
      let wordStart = currentCursorPos;
      while (wordStart > 0 && !/[,\s]/.test(textBeforeCursor[wordStart - 1])) {
        wordStart--;
      }

      const currentWord = textBeforeCursor.substring(wordStart, currentCursorPos).trim();

      // 触发自动补全
      if (currentWord) {
        triggerAutocomplete(currentWord);
      }
      postMessageToWindowsPrompt();
    }, 300);
    // 计算token数量
    tokenCount.value = calculateTokens(inputText.value);
    return;
  }

  // 查找当前输入的单词起始位置
  let wordStart = newCursorPosition;
  while (wordStart > 0 && !/[,\s]/.test(textBeforeCursor[wordStart - 1])) {
    wordStart--;
  }


  const currentWord = textBeforeCursor.substring(wordStart, newCursorPosition).trim();

  // 5. 防抖处理
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }

  debounceTimeout.value = setTimeout(() => {
    if (currentWord) {
      triggerAutocomplete(currentWord);
    }
    postMessageToWindowsPrompt();
  }, 300);

  // 计算token数量（简单实现，可根据实际分词算法调整）
  tokenCount.value = calculateTokens(inputText.value)
};


// 添加计算token的方法
const calculateTokens = (text) => {
  if (!text) return 0
  // 简单实现：按空格分词
  // 注意：实际的token计算应该使用与您模型匹配的分词器
  return text.trim().split(/\s+/).length
}

// 处理输入事件 ========== 主事件处理 ==========
const processInput = async () => {

  // 预设设置
  let isCommaConversionEnabled = localStorage.getItem('weilin_prompt_ui_comma_conversion') === 'true';
  let isPeriodConversionEnabled = localStorage.getItem('weilin_prompt_ui_period_conversion') === 'true';
  let isBracketConversionEnabled = localStorage.getItem('weilin_prompt_ui_bracket_conversion') === 'true';
  let isAngleBracketConversionEnabled = localStorage.getItem('weilin_prompt_ui_angle_bracket_conversion') === 'true';
  let isUnderscoreToBracketEnabled = localStorage.getItem('weilin_prompt_ui_underscore_to_bracket') === 'true';

  if (!localStorage.getItem('weilin_prompt_ui_comma_conversion')) {
    localStorage.setItem('weilin_prompt_ui_comma_conversion', 'true')
    isCommaConversionEnabled = true
  }
  if (!localStorage.getItem('weilin_prompt_ui_period_conversion')) {
    localStorage.setItem('weilin_prompt_ui_period_conversion', 'true')
    isPeriodConversionEnabled = true
  }
  if (!localStorage.getItem('weilin_prompt_ui_bracket_conversion')) {
    localStorage.setItem('weilin_prompt_ui_bracket_conversion', 'true')
    isBracketConversionEnabled = true
  }
  if (!localStorage.getItem('weilin_prompt_ui_angle_bracket_conversion')) {
    localStorage.setItem('weilin_prompt_ui_angle_bracket_conversion', 'true')
    isAngleBracketConversionEnabled = true
  }
  if (!localStorage.getItem('weilin_prompt_ui_underscore_to_bracket')) {
    localStorage.setItem('weilin_prompt_ui_underscore_to_bracket', 'false')
    isUnderscoreToBracketEnabled = false
  }


  if (isCommaConversionEnabled) {
    inputText.value = inputText.value.replace(/，/g, ',');
  }
  if (isPeriodConversionEnabled) {
    inputText.value = inputText.value.replace(/。/g, '.');
  }
  if (isBracketConversionEnabled) {
    inputText.value = inputText.value
      .replace(/【/g, '[')  // 中文左方括号
      .replace(/】/g, ']')  // 中文右方括号
      .replace(/（/g, '(')  // 中文左圆括号
      .replace(/）/g, ')'); // 中文右圆括号
  }
  if (isAngleBracketConversionEnabled) {
    // 替换中文书名号为英文尖括号
    inputText.value = inputText.value
      .replace(/《/g, '<')  // 中文左书名号
      .replace(/》/g, '>'); // 中文右书名号
  }

  // 下划线转空格的逻辑已移至补全确认时执行

  // 处理文本分割
  const text = inputText.value;
  let segments = [];

  // 首先记录所有隐藏token的原始位置
  const hiddenTokensWithOriginalIndex = tokens.value
    .map((token, originalIndex) => ({
      token,
      originalIndex,  // 保存原始绝对位置
      currentIndex: originalIndex  // 初始时currentIndex与originalIndex相同
    }))
    .filter(({ token }) => token.isHidden);

  // 递归函数处理嵌套括号
  const parseNestedBrackets = (str, startIndex = 0) => {
    let segments = [];
    let i = startIndex;
    let buffer = '';
    let bracketStack = [];

    while (i < str.length) {
      const char = str[i];

      // 处理开括号
      // if ('([{<'.includes(char)) {
      //   // 检测前一个字符是否是逗号或空格，或者是否是字符串开头
      //   const prevChar = i > 0 ? str[i - 1] : '';
      //   const isValidStart = prevChar === '' || prevChar === ',' || prevChar === ' ';

      //   if (isValidStart) {
      //     if (bracketStack.length === 0 && buffer.trim()) {
      //       // 如果这是第一层括号且缓冲区不为空，按逗号分割并添加
      //       segments.push(...buffer.split(',').filter(Boolean).map(s => s.trim()));
      //       buffer = '';
      //     }
      //     bracketStack.push(char);
      //     buffer += char;
      //   } else {
      //     // 如果不是有效开始，按普通字符处理
      //     buffer += char;
      //   }
      // }
      // // 处理闭括号
      // else if (')]}>'.includes(char)) {
      //   const lastBracket = bracketStack[bracketStack.length - 1];
      //   if (('(' === lastBracket && ')' === char) ||
      //     ('[' === lastBracket && ']' === char) ||
      //     ('{' === lastBracket && '}' === char) ||
      //     ('<' === lastBracket && '>' === char)) {

      //     // 只有在存在对应的开括号时才进行后续检测
      //     if (bracketStack.length > 0) {
      //       // 检测后一个字符是否是逗号或空格，或者是否是字符串结尾
      //       const nextChar = i < str.length - 1 ? str[i + 1] : '';
      //       const isValidEnd = nextChar === '' || nextChar === ',' || nextChar === ' ';

      //       if (isValidEnd) {
      //         bracketStack.pop();
      //         buffer += char;

      //         // 如果括号全部匹配完成，添加整个括号内容
      //         if (bracketStack.length === 0) {
      //           segments.push(buffer.trim());
      //           buffer = '';
      //         }
      //       } else {
      //         // 如果不是有效结束，按普通字符处理
      //         buffer += char;
      //       }
      //     }
      //   }
      // }

      // 处理换行符
      if (char === '\n') {
        if (buffer.trim()) {
          segments.push(buffer.trim());
          buffer = '';
        }
        segments.push('\n');
        i++;
        continue;
      }

      // 处理普通字符   
      if (bracketStack.length === 0 && char === ',') {
        if (buffer.trim()) {
          segments.push(buffer.trim());
        }
        buffer = '';
      } else {
        buffer += char;
      }
      i++;
    }

    // 处理剩余的缓冲区内容
    if (buffer.trim()) {
      if (bracketStack.length === 0) {
        segments.push(...buffer.split(',').filter(Boolean).map(s => s.trim()));
      } else {
        segments.push(buffer.trim());
      }
    }

    return segments;
  };

  // 解析文本得到分段
  segments = parseNestedBrackets(text);

  // 处理每个片段
  const existingTokensMap = new Map();
  tokens.value.forEach((token, index) => {
    // 确保每个token都有唯一ID
    if (!token.id) {
      token.id = generateUniqueId();
    }
    existingTokensMap.set(index, token); // 使用索引作为key
  });

  const result = [];

  // 然后处理剩余的segments（新增的token）
  segments.forEach(segment => {
    if (segment === '\n') {
      // 保留换行符作为特殊token
      result.push({
        id: generateUniqueId(),
        text: '\n',
        translate: '',
        isPunctuation: false,
        isEditing: false,
        isHidden: false,
        color: ''
      });
    } else if (segment.trim()) {
      // 处理非空文本
      const trimmedSegment = segment.trim();

      // 优先匹配非隐藏的token
      let matched = false;
      for (const [index, token] of existingTokensMap) {
        if (token.text === trimmedSegment && !token.isHidden && !result.includes(token)) {
          result.push(token);
          existingTokensMap.delete(index);
          matched = true;
          break;
        }
      }

      // 如果没有匹配到非隐藏token，再尝试匹配隐藏token
      if (!matched) {
        for (const [index, token] of existingTokensMap) {
          if (token.text === trimmedSegment && !result.includes(token)) {
            result.push(token);
            existingTokensMap.delete(index);
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        result.push({
          id: generateUniqueId(),
          text: trimmedSegment,
          translate: '',
          isPunctuation: false,
          isEditing: false,
          isHidden: false,
          color: ''
        });
      }
    }

  });

  // 使用ID来跟踪已处理的隐藏token
  const processedHiddenTokenIds = new Set();

  //重新插入隐藏token到它们原来的位置
  hiddenTokensWithOriginalIndex.forEach(({ token, originalIndex }) => {
    // 如果这个token已经处理过，跳过
    if (processedHiddenTokenIds.has(token.id)) {
      return;
    }

    // 标记这个token已经处理
    processedHiddenTokenIds.add(token.id);

    // 检查结果中是否已经包含这个隐藏token
    const alreadyExists = result.some(t => t.id === token.id);

    // 如果已经存在，不再添加
    if (alreadyExists) {
      return;
    }

    let insertIndex = originalIndex;

    // 确保插入位置有效
    while (insertIndex > result.length) {
      insertIndex--;
    }

    // 如果所有尝试都失败，插入到最后
    if (insertIndex < 0) {
      result.push(token);
    } else {
      result.splice(insertIndex, 0, token);
    }
  });

  tokens.value = result;

  // 更新输入文本，保持原有格式，但排除隐藏的tokens
  inputText.value = tokens.value.length > 0
    ? tokens.value.reduce((acc, token, index) => {
      // 如果token是隐藏的，不添加到输入文本中
      if (token.isHidden) {
        return acc;
      }

      // 如果是换行符，不加逗号
      if (token.text === '\n') {
        // 查找前一个非隐藏token
        const prevNonHiddenIndex = findPrevNonHiddenIndex(index);
        const prevToken = prevNonHiddenIndex !== -1 ? tokens.value[prevNonHiddenIndex] : null;

        // 直接返回换行符，不添加额外的逗号
        // 因为前一个token在处理时已经根据shouldAddComma添加了逗号
        return acc + token.text;
      }

      // 第一个非隐藏token不加逗号前缀
      if (acc === '') {
        // 查找下一个非隐藏token
        let nextNonHiddenIndex = index + 1;
        while (nextNonHiddenIndex < tokens.value.length && tokens.value[nextNonHiddenIndex]?.isHidden) {
          nextNonHiddenIndex++;
        }

        // 判断是否是最后一个非隐藏token或者下一个是换行符
        const isLastToken = nextNonHiddenIndex >= tokens.value.length;
        const nextToken = nextNonHiddenIndex < tokens.value.length ? tokens.value[nextNonHiddenIndex] : null;
        const shouldAddComma = isLastToken || (nextToken && nextToken.text === '\n');

        return token.text + (shouldAddComma ? ',' : '');
      }

      // 查找下一个非隐藏token
      let nextNonHiddenIndex = index + 1;
      while (nextNonHiddenIndex < tokens.value.length && tokens.value[nextNonHiddenIndex]?.isHidden) {
        nextNonHiddenIndex++;
      }

      // 判断是否是最后一个非隐藏token
      const isLastToken = nextNonHiddenIndex >= tokens.value.length;
      const nextToken = nextNonHiddenIndex < tokens.value.length ? tokens.value[nextNonHiddenIndex] : null;

      // 如果是换行符前或者最后一个token，则添加逗号
      const shouldAddComma = (nextToken && nextToken.text === '\n') || isLastToken;

      // 前一个token是换行符，不加逗号前缀
      const prevNonHiddenIndex = findPrevNonHiddenIndex(index);
      if (prevNonHiddenIndex !== -1 && tokens.value[prevNonHiddenIndex].text === '\n') {
        return acc + token.text + (shouldAddComma ? ',' : '');
      }

      // 其他情况加逗号和空格前缀
      return acc + ', ' + token.text + (shouldAddComma ? ',' : '');
    }, '') : '';


  // 处理历史记录
  if (proceTimeout.value) {
    clearTimeout(proceTimeout.value);
  }
  // ✅ 修复：减少延迟时间从1000ms到100ms
  proceTimeout.value = setTimeout(() => {
    // console.log('处理历史记录');
    finishPromptPutItHistory();
  }, 100);  // 从1000改为100
  postMessageToWindowsPrompt();

  // 处理翻译
  const batchSize = 50; // 每批处理的数量
  let currentIndex = 0;

  while (currentIndex < tokens.value.length) {
    const endIndex = Math.min(currentIndex + batchSize, tokens.value.length);
    const promises = [];

    for (let i = currentIndex; i < endIndex; i++) {
      if (tokens.value[i].text.length > 0 && !tokens.value[i].translate) {
        let cleanedTrSegment = tokens.value[i].text;
        const text = extractText(cleanedTrSegment.trim());
        promises.push(
          translatorApi.getTranslateLocal(text).then(res => {
            const translate = res;
            tokens.value[i].translate = translate.translated.translate;
            tokens.value[i].color = translate.translated.color;
          })
        );
      }
    }

    await Promise.all(promises);
    currentIndex = endIndex;
  }

  // 处理翻译
  // for (let i = 0; i < tokens.value.length; i++) {
  //   if (tokens.value[i].text.length > 0 && !tokens.value[i].translate) {
  //     let cleanedTrSegment = tokens.value[i].text;
  //     const text = extractText(cleanedTrSegment.trim());
  //     translatorApi.getTranslateLocal(text).then(res => {
  //       const translate = res;
  //       tokens.value[i].translate = translate.translated.translate;
  //       tokens.value[i].color = translate.translated.color;
  //     });
  //   }
  // }

  // 计算token数量（简单实现，可根据实际分词算法调整）
  tokenCount.value = calculateTokens(inputText.value)
};

const tempInputText = ref('')

const finishPromptPutItHistory = () => {
  // console.log('finishPromptPutItHistory 被调用', new Error().stack);
  // 去除空格、换行和制表符
  const trimmedInput = inputText.value.replace(/[\s\t\n]+/g, '');
  if (trimmedInput.length > 0) {
    const putJson = {
      prompt: inputText.value,
      temp_prompt: tokens.value
    }
    const jsonStr = JSON.stringify(putJson)
    if (tempInputText.value != jsonStr) {
      tempInputText.value = jsonStr
      historyApi.saveHistory({ tag: jsonStr })
    }
  }
  postMessageToWindowsPrompt()
  if (!suppressUnsavedOnce) unsavedChanges.value = true
}

const postMessageToWindowsPrompt = () => {
  tempInputText.value = inputText.value
  const putJson = {
    prompt: inputText.value,
    temp_prompt: tokens.value
  }
  const jsonStr = JSON.stringify(putJson)
  window.postMessage({
    type: 'weilin_prompt_ui_prompt_finish_prompt',
    data: jsonStr
  }, '*')
}


// 显示控制栏
const showControls = (index, event) => {
  // 清除任何现有的定时器
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

  // 检测并设置权重值
  const text = tokens.value[index].text;
  weightValue.value = findInnerWeight(text);

  tagTipsPosition.value = {
    top: `${rect.bottom + window.scrollY + rect.height + 10}px`,
    left: `${rect.left + rect.width / 2}px`
  };
  showTagTipsBox.value = true;
}


// 定义递归函数来查找最内层的权重
const findInnerWeight = (content) => {
  // 定义括号匹配正则表达式
  const bracketPairs = [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' },
    { open: '<', close: '>' }
  ];

  // 查找最内层内容
  for (const pair of bracketPairs) {
    if (content.startsWith(pair.open) && content.endsWith(pair.close)) {
      // 递归查找内层内容
      return findInnerWeight(content.slice(1, -1));
    }
  }

  // 如果没有括号，直接匹配权重
  const weightMatch = content.match(/:(\d+(\.\d+)?)$/);
  return weightMatch ? parseFloat(weightMatch[1]) : 1;
};

const hideTimeout = ref(null)

// 处理鼠标离开词组
const handleMouseLeave = (index) => {
  // 清除现有的定时器
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
  }

  // 设置新的定时器
  hideTimeout.value = setTimeout(() => {
    if (!isOverControls.value) {
      hideControls()
    }
    hideTimeout.value = null
  }, 100)

  showTagTipsBox.value = false;
}

// 处理鼠标离开控制栏
const handleControlsLeave = () => {
  isOverControls.value = false
  handleMouseLeave(activeControls.value)
}

// 隐藏控制栏
const hideControls = () => {
  if (!isOverControls.value) {
    activeControls.value = null
  }
}

// 处理删除按钮点击
const handleDelete = () => {
  if (activeControls.value !== null) {
    const index = activeControls.value
    deleteToken(index)
    // 删除后立即隐藏控制栏
    activeControls.value = null
    isOverControls.value = false
  }
}


// 处理添加换行符
const handelLineToken = () => {
  if (activeControls.value !== null) {
    const index = activeControls.value;
    // 在当前 token 后插入一个换行符 token
    tokens.value.splice(index + 1, 0, {
      id: generateUniqueId(),
      text: '\n',
      translate: '',
      isPunctuation: false,
      isEditing: false,
      isHidden: false,
      color: ''
    });
    updateInputText();
  }
}
// 删除词组
const deleteToken = (index) => {
  const text = inputText.value
  let targetToken = tokens.value[index]
  let lastIndex = 0
  let tokenPos = -1

  // 查找要删除的词组位置
  for (let i = 0; i < index; i++) {
    let pos = text.indexOf(tokens.value[i].text, lastIndex)
    if (pos !== -1) {
      lastIndex = pos + tokens.value[i].text.length
    }
  }

  // 找到目标词组的位置
  if (targetToken.text === '\n' || targetToken.text === '\t') {
    for (let i = lastIndex; i < text.length; i++) {
      if (text[i] === targetToken.text) {
        tokenPos = i
        break
      }
    }
  } else {
    tokenPos = text.indexOf(targetToken.text, lastIndex)
  }

  if (tokenPos !== -1) {
    // 如果删除的是换行符，则替换为空格
    const replacement = targetToken.text === '\n' ? ' ' : ''
    const newText = text.substring(0, tokenPos) + replacement + text.substring(tokenPos + targetToken.text.length)
    inputText.value = newText
  }

  tokens.value.splice(index, 1)
  // 更新输入文本，保持原有格式，但排除隐藏的tokens
  inputText.value = tokens.value.length > 0
    ? tokens.value.reduce((acc, token, index) => {
      // 如果token是隐藏的，不添加到输入文本中
      if (token.isHidden) {
        return acc;
      }

      // 如果是换行符，不加逗号
      if (token.text === '\n') {
        // 查找前一个非隐藏token
        const prevNonHiddenIndex = findPrevNonHiddenIndex(index);
        const prevToken = prevNonHiddenIndex !== -1 ? tokens.value[prevNonHiddenIndex] : null;

        // 直接返回换行符，不添加额外的逗号
        // 因为前一个token在处理时已经根据shouldAddComma添加了逗号
        return acc + token.text;
      }

      // 第一个非隐藏token不加逗号前缀
      if (acc === '') {
        // 查找下一个非隐藏token
        let nextNonHiddenIndex = index + 1;
        while (nextNonHiddenIndex < tokens.value.length && tokens.value[nextNonHiddenIndex]?.isHidden) {
          nextNonHiddenIndex++;
        }

        // 判断是否是最后一个非隐藏token或者下一个是换行符
        const isLastToken = nextNonHiddenIndex >= tokens.value.length;
        const nextToken = nextNonHiddenIndex < tokens.value.length ? tokens.value[nextNonHiddenIndex] : null;
        const shouldAddComma = isLastToken || (nextToken && nextToken.text === '\n');

        return token.text + (shouldAddComma ? ',' : '');
      }

      // 查找下一个非隐藏token
      let nextNonHiddenIndex = index + 1;
      while (nextNonHiddenIndex < tokens.value.length && tokens.value[nextNonHiddenIndex]?.isHidden) {
        nextNonHiddenIndex++;
      }

      // 判断是否是最后一个非隐藏token
      const isLastToken = nextNonHiddenIndex >= tokens.value.length;
      const nextToken = nextNonHiddenIndex < tokens.value.length ? tokens.value[nextNonHiddenIndex] : null;

      // 如果是换行符前或者最后一个token，则添加逗号
      const shouldAddComma = (nextToken && nextToken.text === '\n') || isLastToken;

      // 前一个token是换行符，不加逗号前缀
      const prevNonHiddenIndex = findPrevNonHiddenIndex(index);
      if (prevNonHiddenIndex !== -1 && tokens.value[prevNonHiddenIndex].text === '\n') {
        return acc + token.text + (shouldAddComma ? ',' : '');
      }

      // 其他情况加逗号和空格前缀
      return acc + ', ' + token.text + (shouldAddComma ? ',' : '');
    }, '') : '';

  finishPromptPutItHistory()
  unsavedChanges.value = true
}

// 处理词组编辑
const handleTokenEdit = (index, event) => {
  const text = inputText.value
  let lastIndex = 0
  let tokenPos = -1

  // 查找要编辑的词组位置
  for (let i = 0; i < index; i++) {
    let pos = text.indexOf(tokens.value[i].text, lastIndex)
    if (pos !== -1) {
      lastIndex = pos + tokens.value[i].text.length
    }
  }

  // 找到目标词组的原始位置
  const oldText = tokens.value[index].text
  tokenPos = text.indexOf(oldText, lastIndex)

  if (tokenPos !== -1) {
    // 更新输入框文本和词组文本
    const newValue = event.target.value
    const newText = text.substring(0, tokenPos) + newValue + text.substring(tokenPos + oldText.length)
    inputText.value = newText
    tokens.value[index] = {
      ...tokens.value[index],
      text: newValue
    }

    finishPromptPutItHistory()
  }
}

// 修改 startEditing 函数，添加对标点符号的处理
const startEditing = (index) => {
  // 如果是标点符号，不允许编辑
  if (tokens.value[index].isPunctuation) {
    return;
  }

  tokens.value[index].isEditing = true;
  setTimeout(() => {
    const input = tokenInputRefs[index];
    if (input) {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
      adjustInputWidth(input);
      input.addEventListener('input', () => adjustInputWidth(input));
      finishPromptPutItHistory()
      unsavedChanges.value = true
    }
  });
}

// 调整输入框宽度
const adjustInputWidth = (input) => {
  // 创建一个临时的 span 元素来计算文本宽度
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.position = 'absolute'
  span.style.whiteSpace = 'pre'
  // 复制输入框的样式
  const computedStyle = window.getComputedStyle(input)
  span.style.font = computedStyle.font
  span.style.fontSize = computedStyle.fontSize
  span.style.fontFamily = computedStyle.fontFamily
  span.style.padding = computedStyle.padding
  span.style.border = computedStyle.border
  span.textContent = input.value || input.placeholder || ''

  document.body.appendChild(span)
  // 设置输入框宽度，添加一些额外空间以防止文字紧贴边框
  const width = span.offsetWidth
  input.style.width = `${Math.max(width + 4, 20)}px`
  document.body.removeChild(span)
}

// 完成编辑
const finishEditing = (index) => {
  tokens.value[index].isEditing = false
}

// 删除 watch 监听器，因为我们现在使用直接的输入事件处理

// 监听词组的变化
watch(tokens, (newTokens) => {
  updateInputText()
}, { deep: true })

// 切换语言选择器
const toggleLanguageSelector = () => {
  showLanguageSelector.value = !showLanguageSelector.value
  if (showLanguageSelector.value) {
    nextTick(() => {
      const btnRect = langBtnRef.value.getBoundingClientRect()
      languageSwitcherRef.value?.setPosition(btnRect)
    })
  }
}

// 关闭语言选择器
const closeLanguageSelector = () => {
  showLanguageSelector.value = false
}

// 处理点击外部
const handleClickOutside = (event) => {
  if (langBtnRef.value && !langBtnRef.value.contains(event.target) &&
    languageSwitcherRef.value && !languageSwitcherRef.value.$el.contains(event.target)) {
    closeLanguageSelector()
  }
  // 如果点击的不是补全窗口或输入框
  if (
    autocompleteContainerRef.value?.contains &&
    inputAreaRef.value?.contains &&
    !autocompleteContainerRef.value.contains(event.target) &&
    !inputAreaRef.value.contains(event.target)
  ) {
    showAutocomplete.value = false;
  }

}


// 打开标签管理器
const openTagManager = () => {
  // 发送消息给父窗口
  window.parent.postMessage({ type: 'weilin_prompt_ui_openTagManager_prompt' }, '*')
}

const openHistoryBox = () => {
  // 发送消息给父窗口
  window.parent.postMessage({ type: 'weilin_prompt_ui_openHistoryManager' }, '*')
}

// 添加折叠状态控制
const showTagManager = ref(true)

// 切换标签管理器显示状态
const toggleTagManager = () => {
  showTagManager.value = !showTagManager.value
}

const resizeObserver = ref(null)

const handleTextareaResize = () => {
  if (inputAreaRef.value) {
    const height = inputAreaRef.value.clientHeight
    localStorage.setItem('weilinPromptTextAreaHeight', height)
  }
}

const setupCursorTracking = () => {
  const textarea = inputAreaRef.value;
  if (!textarea) return;

  // 添加光标位置变化监听
  textarea.addEventListener('keyup', updateAutocompletePosition);
  textarea.addEventListener('click', updateAutocompletePosition);
  textarea.addEventListener('input', updateAutocompletePosition);
};

const updateAutocompletePosition = () => {
  if (showAutocomplete.value) {
    calculateAutocompletePosition();
  }
};

// 从localStorage恢复文本区域高度
const restoreTextareaHeight = () => {
  const savedHeight = localStorage.getItem('weilinPromptTextAreaHeight');
  if (savedHeight && inputAreaRef.value) {
    inputAreaRef.value.style.height = savedHeight;
  }
};

// 添加消息监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('message', handleMessage)
  initTranslate()
  setupCursorTracking()

  nextTick(() => {
    restoreTextareaHeight();
  });

})

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (historyTimer.value) {
    clearTimeout(historyTimer.value);
  }
  window.removeEventListener('message', handleMessage)
  const textarea = inputAreaRef.value;
  if (textarea) {
    textarea.removeEventListener('keyup', updateAutocompletePosition);
    textarea.removeEventListener('click', updateAutocompletePosition);
    textarea.removeEventListener('input', updateAutocompletePosition);
  }
})

// 处理消息
const handleMessage = (event) => {
  if (event.data.type === 'weilin_prompt_ui_insertTag') {
    // 在输入框末尾添加标签文本
    const currentText = inputText.value
    const tagText = event.data.tagText

    // 检查当前文本是否为空或是否以空格结尾
    if (currentText === '') {
      inputText.value = tagText
    } else if (currentText.endsWith(' ')) {
      inputText.value = currentText + ', ' + tagText + ',';
    } else {
      inputText.value = currentText + ', ' + tagText + ',';
    }

    lastInputValue.value = inputText.value; // 更新上一次的输入内容
    // 触发输入事件以更新词组
    processInput()

    // ✅ 修复：确保数据立即同步到节点
    nextTick(() => {
      finishPromptPutItHistory();
    });
  } else if (event.data.type === 'weilin_prompt_ui_user_history_tag') {
    const tagText = event.data.tagText
    tempInputText.value = tagText
    setPromptText(tagText)
  } else if (event.data.type === 'weilin_prompt_ui_refresh_all_data') {

  } else if (event.data.type === 'weilin_prompt_ui_translate_setting') {
    initTranslate()
  } else if (event.data.type === 'weilin_prompt_ui_prompt_inner_get_node_tag_template_id_go_random_response') {
    onClickLocalTemplateRandomTag(event.data.data)
  }
}

const initTranslate = async () => {
  const savedSourceLanguage = localStorage.getItem('weilin_prompt_ui_sourceLanguage') || 'english';
  const savedTargetLanguage = localStorage.getItem('weilin_prompt_ui_targetLanguage') || 'chinese_simplified';
  if (!localStorage.getItem('weilin_prompt_ui_sourceLanguage')) {
    localStorage.setItem('weilin_prompt_ui_sourceLanguage', savedSourceLanguage);
  }
  if (!localStorage.getItem('weilin_prompt_ui_targetLanguage')) {
    localStorage.setItem('weilin_prompt_ui_targetLanguage', savedTargetLanguage);
  }
  if (savedSourceLanguage !== 'auto') {
    // translate.language.setLocal(savedSourceLanguage);
  }
  // translate.language.setDefaultTo(savedTargetLanguage);

  // 解决common命名空间翻译未生效问题：强制触发Vue I18n更新
  await nextTick();
}

// 自动补全功能

const onBlur = () => {
  // 添加延迟处理，避免与自动补全点击冲突
  setTimeout(() => {
    if (!showAutocomplete.value) {
      lastInputValue.value = inputText.value; // 更新上一次的输入内容
      processInput();
    }
  }, 100);
}

// 提取补全逻辑到单独的函数
const triggerAutocomplete = (inputValue) => {
  // 处理特殊格式 - 移除了圆括号
  let cleanedTrSegment = inputValue.replace(/[\[\]{}]/g, '').trim();
  const text = extractText(cleanedTrSegment)

  // 清除输入值的前后空格
  const trimmedInput = text.trim();

  // 如果输入为空，隐藏补全框
  if (!trimmedInput) {
    showAutocomplete.value = false;
    return;
  }

  // 如果输入过长，直接返回
  if (trimmedInput.length > 20) {
    showAutocomplete.value = false;
    return;
  }

  try {
    // 优化匹配逻辑
    const lowerInput = trimmedInput.toLowerCase();

    autocompleteApi.getAutocomplete(String(lowerInput)).then(async (res) => {
      autocompleteResults.value = res.data
      // 更新补全结果
      await calculateAutocompletePosition();
      setTimeout(() => {
        saveAutoCompleteWidth.value = localStorage.getItem('weilin_prompt_ui_auto_box_width') || 450
        saveAutoCompleteHeight.value = localStorage.getItem('weilin_prompt_ui_auto_box_height') || 350
        showAutocomplete.value = autocompleteResults.value.length > 0;
        selectedAutocompleteIndex.value = 0; // 重置选中索引
      }, 50)
    })

  } catch (error) {
    console.error('Autocomplete error:', error);
    showAutocomplete.value = false;
  }
};

// 计算调整后的自动补全位置
const adjustedAutocompletePosition = computed(() => {
  if (!parentCneterBox.value) return { left: autocompletePosition.value.left };

  const parentWidth = parentCneterBox.value.offsetWidth;
  saveAutoCompleteWidth.value = localStorage.getItem('weilin_prompt_ui_auto_box_width') || 450
  const autocompleteWidth = saveAutoCompleteWidth.value;
  let left = autocompletePosition.value.left;

  // 检查是否会超出右侧边界
  if (left + autocompleteWidth > parentWidth) {
    // 将窗口贴在右侧边界
    left = parentWidth - autocompleteWidth;
  }

  // 确保不会超出左侧边界
  if (left < 0) {
    left = 0;
  }

  return { left };
});


const selectAutocomplete = (index, event) => {
  // 如果有event参数，阻止默认行为和事件冒泡
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!autocompleteResults.value[index]) return;

  showAutocomplete.value = false;

  // 获取当前输入框的选区位置
  const cursorPosition = inputAreaRef.value.selectionStart;
  const cursorEnd = inputAreaRef.value.selectionEnd;

  // 获取当前输入文本
  const currentText = inputText.value;

  // 处理补全文本格式转换
  let tagText = autocompleteResults.value[index].text;

  // 应用所有格式转换
  if (localStorage.getItem('weilin_prompt_ui_comma_conversion') !== 'false') {
    tagText = tagText.replace(/，/g, ',');
  }
  if (localStorage.getItem('weilin_prompt_ui_period_conversion') !== 'false') {
    tagText = tagText.replace(/。/g, '.');
  }
  if (localStorage.getItem('weilin_prompt_ui_bracket_conversion') !== 'false') {
    tagText = tagText
      .replace(/【/g, '[')
      .replace(/】/g, ']')
      .replace(/（/g, '(')
      .replace(/）/g, ')');
  }
  if (localStorage.getItem('weilin_prompt_ui_angle_bracket_conversion') !== 'false') {
    tagText = tagText
      .replace(/《/g, '<')
      .replace(/》/g, '>');
  }
  if (localStorage.getItem('weilin_prompt_ui_underscore_to_bracket') === 'true') {
    tagText = tagText.replace(/_/g, ' ');
  }

  // 自动转义标签中的括号
  if (localStorage.getItem('weilin_prompt_ui_bracket_escape') === 'true') {
    tagText = tagText.replace(/\(([^)]+)\)/g, '\\($1\\)');
  }

  // 确定要替换的范围
  let replaceStart = cursorPosition;
  let replaceEnd = cursorEnd;

  // 向前查找单词边界
  while (replaceStart > 0 &&
    !/[,\s]/.test(currentText[replaceStart - 1])) {
    replaceStart--;
  }

  // 向后查找单词边界
  while (false && replaceEnd < currentText.length &&
    !/[,\s]/.test(currentText[replaceEnd])) {
    replaceEnd++;
  }

  // 执行替换 - 始终在tag后添加逗号和空格，光标在分隔符后
  let newText = currentText.substring(0, replaceStart) + tagText + ', ' + currentText.substring(replaceEnd);

  // 计算新光标位置 - 补全完成后光标在逗号和空格后面
  const newCursorPosition = replaceStart + tagText.length + 2; // +2表示逗号和空格

  // 更新输入文本
  inputText.value = newText;
  lastInputValue.value = newText;

  // 触发输入处理
  processInput();

  // 恢复光标位置
  nextTick(() => {
    if (inputAreaRef.value) {
      inputAreaRef.value.selectionStart = newCursorPosition;
      inputAreaRef.value.selectionEnd = newCursorPosition;
    }
  });
};

// 关闭补全窗口
const closeAutocomplete = () => {
  showAutocomplete.value = false;
};

const setPromptText = (text) => {
  // console.log(text)
  if (text.length > 0) {
    try {
      const jsonStr = JSON.parse(text)

      inputText.value = jsonStr.prompt
      lastInputValue.value = inputText.value; // 更新上一次的输入内容

      if (jsonStr.temp_prompt && jsonStr.temp_prompt != "") {
        // console.log(jsonStr.temp_prompt)
        const tempDataJson = jsonStr.temp_prompt
        // console.log(tempDataJson)
        let isOldVersion = false
        if (tempDataJson.tokens && tempDataJson.tokens.length > 0 && tempDataJson.tokens != "") {
          tokens.value = tempDataJson.tokens
          isOldVersion = true
        }

        if (!isOldVersion && tempDataJson.length > 0 && tempDataJson != "") {
          tokens.value = tempDataJson
        }

      }

      processInput()
    } catch (error) {
      // console.log('读取数据错误：', error)
      message({ type: "warn", str: 'promptBox.settings.errorPrompt' });
    }
  }
}

const updateInputText = () => {
  // 更新输入文本，保持原有格式，但排除隐藏的tokens
  inputText.value = tokens.value.length > 0
    ? tokens.value.reduce((acc, token, index) => {
      // 如果token是隐藏的，不添加到输入文本中
      if (token.isHidden) {
        return acc;
      }

      // 如果是换行符，不加逗号
      if (token.text === '\n') {
        // 查找前一个非隐藏token
        const prevNonHiddenIndex = findPrevNonHiddenIndex(index);
        const prevToken = prevNonHiddenIndex !== -1 ? tokens.value[prevNonHiddenIndex] : null;

        // 直接返回换行符，不添加额外的逗号
        // 因为前一个token在处理时已经根据shouldAddComma添加了逗号
        return acc + token.text;
      }

      // 第一个非隐藏token不加逗号前缀
      if (acc === '') {
        // 查找下一个非隐藏token
        let nextNonHiddenIndex = index + 1;
        while (nextNonHiddenIndex < tokens.value.length && tokens.value[nextNonHiddenIndex]?.isHidden) {
          nextNonHiddenIndex++;
        }

        // 判断是否是最后一个非隐藏token或者下一个是换行符
        const isLastToken = nextNonHiddenIndex >= tokens.value.length;
        const nextToken = nextNonHiddenIndex < tokens.value.length ? tokens.value[nextNonHiddenIndex] : null;
        const shouldAddComma = isLastToken || (nextToken && nextToken.text === '\n');

        return token.text + (shouldAddComma ? ',' : '');
      }

      // 查找下一个非隐藏token
      let nextNonHiddenIndex = index + 1;
      while (nextNonHiddenIndex < tokens.value.length && tokens.value[nextNonHiddenIndex]?.isHidden) {
        nextNonHiddenIndex++;
      }

      // 判断是否是最后一个非隐藏token
      const isLastToken = nextNonHiddenIndex >= tokens.value.length;
      const nextToken = nextNonHiddenIndex < tokens.value.length ? tokens.value[nextNonHiddenIndex] : null;

      // 如果是换行符前或者最后一个token，则添加逗号
      const shouldAddComma = (nextToken && nextToken.text === '\n') || isLastToken;

      // 前一个token是换行符，不加逗号前缀
      const prevNonHiddenIndex = findPrevNonHiddenIndex(index);
      if (prevNonHiddenIndex !== -1 && tokens.value[prevNonHiddenIndex].text === '\n') {
        return acc + token.text + (shouldAddComma ? ',' : '');
      }

      // 其他情况加逗号和空格前缀
      return acc + ', ' + token.text + (shouldAddComma ? ',' : '');
    }, '') : '';

  postMessageToWindowsPrompt()
  if (!suppressUnsavedOnce) unsavedChanges.value = true
};

const openGitHub = () => {
  window.open('https://github.com/weilin9999/WeiLin-Comfyui-Tools', '_blank')
}

const shareCloudData = () => {
  window.parent.postMessage({ type: 'weilin_prompt_ui_open_cloud_window' }, '*')
}

const openDanbooruManager = () => {
  window.parent.postMessage({ type: 'weilin_prompt_ui_open_danbooru_manager_window' }, '*')
}

const openSponsor = () => {
  window.open('https://afdian.com/a/weilin9999', '_blank')
}

// 添加一个辅助函数来查找前一个非隐藏的token索引
const findPrevNonHiddenIndex = (currentIndex) => {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (!tokens.value[i].isHidden) {
      return i;
    }
  }
  return -1;
};

// 添加toggleHidden方法
const toggleHidden = (index) => {
  if (index >= 0 && index < tokens.value.length) {
    // 不允许隐藏换行符
    if (tokens.value[index].text === '\n' || tokens.value[index].text === '\t') {
      return;
    }

    // 切换隐藏状态
    tokens.value[index].isHidden = !tokens.value[index].isHidden;

    // 添加/移除隐藏提示
    if (tokens.value[index].isHidden) {
      tokens.value[index].hiddenHint = t('promptBox.hiddenHint'); // 使用国际化提示
    } else {
      tokens.value[index].hiddenHint = '';
    }

    // 更新输入文本，排除隐藏的tokens
    updateInputText();
  }
};

const onClickLocalTemplateRandomTag = async (name) => {
  try {
    await randomTagApi.goRandomTemplatePath(name).then((res) => {
      if (res.code === 200) {
        // console.log(res.random_tags)
        inputText.value = res.random_tags
        nextTick(() => {
          // 触发输入处理
          processInput();
        })
      } else {
        message({ type: "warn", str: res.info });
      }
    }).catch((err) => {
      console.error(err);
      message({ type: "warn", str: 'message.networkError' });
    });
  } catch (error) {
    message({ type: "warn", str: 'message.networkError' });
    console.error('Error loading random tag settings:', error)
  }
}

/**
 * 从短码反向解析出原始路径
 * 
 * @param {string} shortcode - 短码
 * @returns {string} - 原始文件路径
 */
const shortcodeToPath = (shortcode) => {
  try {
    // 还原 Base64 编码中被替换的字符
    let base64Str = shortcode.replace(/-/g, '+').replace(/_/g, '/');

    // 添加回可能被移除的填充字符
    const padding = 4 - (base64Str.length % 4);
    if (padding < 4) {
      base64Str += '='.repeat(padding);
    }

    // 解码 Base64
    const binaryStr = atob(base64Str);

    // 将二进制字符串转换为 Uint8Array
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // 解压缩
    const decompressed = pako.inflate(bytes);

    // 将 Uint8Array 转换为字符串
    const decoder = new TextDecoder('utf-8');
    const path = decoder.decode(decompressed);

    return path;
  } catch (error) {
    console.error('解析短码时出错:', error);
    return '';
  }
};

const clearAllPrompt = () => {
  inputText.value = '';
  tokens.value = [];
  lastInputValue.value = '';
  // 如有其它需要清空的内容可一并处理
  updateInputText();
};

// 一键清空禁用标签方法
const clearDisabledTags = () => {
  // 过滤掉隐藏的标签，保留其他标签
  const filteredTokens = tokens.value.filter(token => !token.isHidden);

  // 更新 tokens 数组
  tokens.value = filteredTokens;

  // 重新构建输入文本
  updateInputText();

  // 显示成功提示
  message({ type: "success", str: t('promptBox.clearDisabledSuccess') || '已清空所有禁用标签' });
};

defineExpose({
  setPromptText
})
</script>

<style scoped>
@import "./prompt_index.css";

/* 内部小提示框样式（优化版） */
.weilin-toast {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 12px 20px;
  /* 增加内边距让提示更突出 */
  border-radius: 12px;
  font-size: 16px;
  /* 字体更大 */
  font-weight: 500;
  /* 略加粗 */
  line-height: 1.4;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  z-index: 9999;

  /* 增加轻微模糊背景，让提示更有层次感 */
  backdrop-filter: blur(6px);
}

/* 淡入淡出 + 缩放动画 */
.weilin-fade-enter-active,
.weilin-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.weilin-fade-enter-from,
.weilin-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>

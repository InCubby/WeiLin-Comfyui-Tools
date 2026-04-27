<template>
  <div class="weilin_prompt_ui_prompt-box">
    <!-- 内部小提示框：更新标签 -->
    <transition name="weilin-fade">
      <div v-if="toastVisible" class="weilin-toast" role="status" aria-live="polite">
        已更新标签
      </div>
    </transition>

    <!-- 主标签管理器（左侧边栏） -->
    <MainLabelManager
      v-if="isLabelManagerVisible"
      ref="mainLabelManagerRef"
      :selected-id="selectedMainLabelId"
      @select="onSelectMainLabel"
    />
    <!-- 主要内容容器 -->
    <div
      :class="`${prefix}main-content`"
      :style="{ width: mainContentWidth, paddingLeft: isLabelManagerVisible ? '8px' : '0px' }"
    >
      <!-- 操作栏 -->
      <div class="center-container">
        <div class="action-item">
          <button
            class="tag-manager-btn"
            @click="toggleLabelManager"
            :title="isLabelManagerVisible ? '收起标签栏' : '展开标签栏'"
          >
            <svg
              class="weilin-comfyui-sidebar-toggle-icon"
              :class="{ 'is-closed': !isLabelManagerVisible }"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>

            <span class="action-text">
              {{ isLabelManagerVisible ? '收起标签栏' : '展开标签栏' }}
            </span>
          </button>
        </div>
        <div class="action-item">
          <button
            class="language-switch-btn"
            @click.stop="toggleLanguageSelector"
            ref="langBtnRef"
            :title="t('controls.language')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="translate-icon">
              <path
                d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
              />
            </svg>
            <span class="action-text">{{ t('controls.language') }}</span>
          </button>
          <Transition name="fade">
            <LanguageSwitcher
              v-if="showLanguageSelector"
              ref="languageSwitcherRef"
              @close="closeLanguageSelector"
            />
          </Transition>
        </div>

        <div class="action-item">
          <ThemeSwitch :title="t('controls.switchTheme')">
            <template #default="{ isDark }">
              <span class="action-text">{{
                t(isDark ? 'controls.darkMode' : 'controls.lightMode')
              }}</span>
            </template>
          </ThemeSwitch>
        </div>

        <div class="action-item">
          <button class="settings-btn" @click="openSettings" :title="t('controls.settings')">
            <svg class="settings-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
              />
            </svg>
            <span class="action-text">{{ t('controls.settings') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openTagManager" :title="t('controls.tagManager')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="tag-icon">
              <path
                d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"
              />
            </svg>
            <span class="action-text">{{ t('controls.tagManager') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button
            class="tag-manager-btn"
            @click="openDanbooruManager"
            :title="t('controls.danbooruManager')"
          >
            <svg
              class="tag-icon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"
              />
            </svg>
            <span class="action-text">{{ t('controls.danbooruManager') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openHistoryBox" :title="t('controls.history')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              class="tag-icon"
              width="24"
              height="24"
            >
              <path
                d="M653.7 85.83c-235.05 0-426.29 191.25-426.29 426.3s191.24 426.3 426.29 426.3c235.06 0 426.3-191.25 426.3-426.3S888.76 85.83 653.7 85.83z m0 779.98c-195.01 0-353.67-158.65-353.67-353.68S458.69 158.45 653.7 158.45c195.02 0 353.68 158.65 353.68 353.68S848.72 865.81 653.7 865.81z"
              ></path>
              <path
                d="M866.78 634.19L695.93 533.61V302.59c0-20.06-16.26-36.31-36.31-36.31s-36.31 16.26-36.31 36.31v253.66c0 17.06 11.8 31.26 27.66 35.16l178.98 105.36c17.28 10.17 39.54 4.41 49.71-12.87 10.17-17.28 4.4-39.54-12.88-49.71zM44.76 324.51h186.42c20.05 0 36.31-16.26 36.31-36.31s-16.26-36.31-36.31-36.31H44.76c-20.05 0-36.31 16.26-36.31 36.31s16.26 36.31 36.31 36.31zM231.18 703.25H44.76c-20.05 0-36.31 16.26-36.31 36.31s16.26 36.31 36.31 36.31h186.42c20.05 0 36.31-16.26 36.31-36.31s-16.25-36.31-36.31-36.31zM36.31 550.19h118.8c20.05 0 36.31-16.26 36.31-36.31s-16.26-36.31-36.31-36.31H36.31c-20.05 0-36.31 16.26-36.31 36.31 0 20.06 16.26 36.31 36.31 36.31z"
              ></path>
            </svg>
            <span class="action-text">{{ t('controls.history') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openGitHub" :title="t('controls.github')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="tag-icon"
              width="24"
              height="24"
            >
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            <span class="action-text">{{ t('controls.github') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button
            class="tag-manager-btn"
            @click="shareCloudData"
            :title="t('controls.shareCloudData')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="tag-icon"
              width="24"
              height="24"
            >
              <path
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
              />
            </svg>
            <span class="action-text">{{ t('controls.shareCloudData') }}</span>
          </button>
        </div>

        <div class="action-item">
          <button class="tag-manager-btn" @click="openSponsor" :title="t('controls.sponsor')">
            <svg
              t="1745823985128"
              class="tag-icon"
              viewBox="0 0 1322 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <path
                d="M495.899049 634.906371c-17.304811 0-31.251971 13.947161-31.251971 31.251971S478.594238 697.410314 495.899049 697.410314c17.304811 0 31.251971-13.947161 31.251971-31.251972 0-17.304811-13.947161-31.251971-31.251971-31.251971zM790.855671 728.662285c-17.304811 0-31.251971 13.947161-31.251972 31.251971s13.947161 31.251971 31.251972 31.251972 31.251971-13.947161 31.251971-31.251972c0-17.04653-13.947161-30.993691-31.251971-31.251971z"
              ></path>
              <path
                d="M1262.99289 719.622459c-13.430599-8.264984-28.927445-13.430599-44.68257-14.980284 34.867902-84.974368 57.080047-196.293374-18.596215-306.837537-115.193217-168.657333-280.75118-256.73107-491.766556-260.863562-60.179416-1.291404-130.948343 1.549685-205.849762 4.649054-87.040614 3.35765-203.008673 8.006703-281.526023 1.549684 15.755126-8.523265 32.543375-16.788249 47.007098-23.761829 55.530362-27.119479 98.921529-48.04022 84.457807-85.232649-7.748423-21.695583-30.218848-33.059937-67.411277-34.09306C206.624604-1.755689 37.967271 43.443443 7.748423 119.636265c-17.04653 42.874605-19.887618 125.524447 152.902206 198.876182 71.027208 30.218848 271.969635 66.894715 349.453861 74.643138 17.563091 1.549685 34.867902 5.165615 51.397871 11.364353-17.821372 11.622634-35.901025 24.02011-54.238959 36.417586-31.768533-18.079653-83.941245-39.516955-122.683358-13.172318-14.463722 9.298107-23.503549 25.053233-24.02011 42.358044-0.516562 21.179022 12.397476 42.099763 26.861198 58.629731-57.080047 45.715694-103.312302 89.881703-119.84227 123.974762-18.337934 41.841482-25.828075 110.544163 8.523265 177.438879 43.391167 84.974368 138.955046 144.120661 284.625391 176.147474 190.352916 41.583202 354.619476 4.132492 463.355674-53.205835 60.437697-32.026814 103.570583-69.994085 124.233043-103.828864 6.457019 2.066246 12.914038 4.132492 19.629338 6.198738 9.298107 2.841088 18.596214 5.682177 27.37776 8.781546 28.669164 10.072949 60.695977 8.523265 85.232649-3.61593l1.291403-0.774843c17.821372-9.039826 31.510252-25.053233 37.708991-44.166009 15.238565-51.139589-29.444006-79.033911-56.563486-96.08044z m-811.776412-239.684541l-17.30481 12.655757c-5.165615-5.165615-9.814669-11.106072-13.430599-17.563091 6.7153-2.066246 18.337934 0.258281 30.735409 4.907334zM1262.99289 798.139808c-1.291404 3.874211-4.132492 6.97358-9.298107 9.814669-10.33123 5.165615-25.569795 5.423896-39.258675 0.774842-9.298107-3.35765-19.371057-6.457019-29.444006-9.556388-18.596214-5.682177-49.848186-15.238565-55.788643-22.470426-9.814669-12.914038-28.152602-15.755126-41.32492-5.940457s-15.755126 28.152602-5.940458 41.324921c3.615931 4.390773 7.490142 8.264984 12.139196 11.622634-44.940851 62.245662-242.267348 186.220424-521.468844 125.007885-125.782728-27.636041-210.498815-77.742507-244.850155-145.412065-24.794952-48.815063-19.112776-98.921529-7.231861-126.299289 34.09306-71.027208 280.75118-234.518925 438.30244-327.241716 13.947161-8.264984 18.596214-26.344637 10.33123-40.291798s-27.119479-19.629337-40.291797-10.33123c-12.655757 7.490142-55.788643 33.059937-111.060725 68.186119-18.596214-12.655757-50.881309-27.894322-102.537459-33.059936-81.874999-8.264984-270.936512-44.42429-332.149051-70.252366C139.471608 245.418993 40.033517 196.34565 61.987381 141.073568c5.165615-12.914038 29.185725-33.576498 81.100157-53.464116 35.384463-13.430599 72.318611-22.470426 109.769321-27.119479l-11.622634 5.682176c-35.384463 17.304811-73.868296 36.417586-99.954652 59.146293-1.807965-1.033123-3.615931-2.324527-5.165615-3.874211-10.847792-11.622634-29.185725-12.397476-41.06664-1.291404l-0.516562 0.516561c-11.880915 11.106072-12.139195 29.702287-1.033123 41.583202 10.589511 11.106072 26.086356 19.371057 45.715694 25.569795 0.774842 0.258281 1.291404 0.516562 2.066246 0.774842 68.702681 21.179022 190.611197 18.596214 362.367899 11.622634 74.126577-2.841088 144.120661-5.682177 202.492111-4.649054 193.710566 3.874211 339.122631 80.841876 444.75946 235.552049 64.828469 95.047318 41.583202 188.544951 4.390773 269.903388-4.649054-3.615931-9.039826-7.748423-12.655757-12.139195-10.33123-12.397476-28.669164-14.463722-41.324921-4.649054-12.655757 10.072949-14.722003 28.669164-4.649054 41.324921 5.940457 7.490142 36.675867 42.874605 74.643138 39.775236h2.066246c1.291404-0.258281 2.324527 0 3.615931-0.258281 25.828075-4.649054 42.358044-3.615931 57.596608 6.198738 20.40418 12.914038 30.218848 20.40418 28.410883 26.861199z"
              ></path>
            </svg>
            <span class="action-text">{{ t('controls.sponsor') }}</span>
          </button>
        </div>

        <SettingDialog ref="settingDialog" />

        <!-- 把“更新标签”按钮放在操作栏最右侧 -->
        <div class="action-item weilin-comfyui-toolbar-right">
          <button
            class="update-label-btn"
            :class="{ 'is-dirty': unsavedChanges }"
            :disabled="!selectedMainLabelId || !unsavedChanges"
            @click="updateSelectedLabel"
          >
            更新标签
          </button>
        </div>
      </div>

      <div class="weilin_prompt_ui_main-scroll">
        <PromptTagEditor
          ref="promptTagEditorRef"
          :on-commit="handleEditorCommit"
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
                  d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"
                />
              </svg>
              <span class="section-title">{{ t('controls.tagManager') }}</span>
            </div>
            <div class="header-right">
              <svg
                class="collapse-icon"
                :class="{ 'is-collapsed': !showTagManager }"
                viewBox="0 0 24 24"
              >
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
</template>

<script setup>
  import {
    ref,
    watch,
    onMounted,
    onUnmounted,
    onBeforeUnmount,
    nextTick,
    computed
  } from 'vue'
  import { useI18n } from 'vue-i18n'
  import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
  import SettingDialog from './components/setting_dialog.vue'
  import ThemeSwitch from '@/components/ThemeSwitch.vue'
  import TagManager from '@/view/tag_manager/tag_index.vue' // 导入 TagManager 组件
  import PromptTagEditor from './components/PromptTagEditor.vue'
  import MainLabelManager from './components/main_label_manager.vue'
  import { historyApi } from '@/api/history'
  import message from '@/utils/message'

  const prefix = 'weilin_prompt_ui_'
  const { t } = useI18n()

  const props = defineProps({
    promptManager: {
      type: String,
      default: 'prompt_global'
    }
  })

  // 输入prompt信息
  const inputText = ref('')
  const tokens = ref([])
  const showLanguageSelector = ref(false)
  const settingDialog = ref(null)
  const langBtnRef = ref(null)
  const languageSwitcherRef = ref(null)

  const handleEditorCommit = ({ prompt }) => {
    if (typeof prompt === 'string') {
      inputText.value = prompt
    }
    postMessageToWindowsPrompt()
    if (!suppressUnsavedOnce) unsavedChanges.value = true
  }

  // 控制左侧标签管理器是否可见的状态
  const isLabelManagerVisible = ref(true)

  // 用于本地存储的键名
  const STORAGE_KEY_SIDEBAR_VISIBLE = 'weilin_prompt_ui_sidebar_visible'

  // 切换标签管理器的显示状态
  const toggleLabelManager = () => {
    isLabelManagerVisible.value = !isLabelManagerVisible.value
  }

  // 监听状态变化并保存到 localStorage
  watch(isLabelManagerVisible, (newValue) => {
    localStorage.setItem(STORAGE_KEY_SIDEBAR_VISIBLE, String(newValue))
  })

  // 组件挂载时，从 localStorage 读取并恢复状态
  onMounted(() => {
    const savedState = localStorage.getItem(STORAGE_KEY_SIDEBAR_VISIBLE)
    // 默认值为 true (显示)，如果存储了 'false' 则为 false
    isLabelManagerVisible.value = savedState !== 'false'
    // ... 其他 onMounted 逻辑
  })

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
    const labelManagerWidth = isLabelManagerVisible.value ? 280 : 0
    const left = labelManagerWidth
    return `calc(100% - ${left}px)`
  })

  let suppressUnsavedOnce = false
  const onSelectMainLabel = (item) => {
    // console.log('onSelectMainLabel', item)
    if (!item) {
      selectedMainLabelId.value = null
      inputText.value = ''
      nextTick(() => {
        if (promptTagEditorRef.value?.commitPromptChange) {
          promptTagEditorRef.value.commitPromptChange('select-main-label-empty', [], {
            source: 'array',
            convertPunctuation: false
          })
        }
      })
      unsavedChanges.value = false
      return
    }
    selectedMainLabelId.value = item.id
    suppressUnsavedOnce = true
    inputText.value = item.content || ''
    nextTick(() => {
      if (promptTagEditorRef.value?.commitPromptChange) {
        promptTagEditorRef.value.commitPromptChange('select-main-label', inputText.value, {
          source: 'string',
          convertPunctuation: true
        })
      }
    })
    unsavedChanges.value = false
  }

  // 将输入框的变更回写到选中的主标签
  // 仅做“有未保存变更”的标记，不再自动写回标签
  watch(inputText, (v) => {
    if (suppressUnsavedOnce) {
      suppressUnsavedOnce = false
      return
    }
    unsavedChanges.value = true
  })
  // 在标签 tokens 序列变更时标记为有未保存变更（初始化期间除外）
  watch(
    tokens,
    () => {
      if (!suppressUnsavedOnce) unsavedChanges.value = true
    },
    { deep: true }
  )

  // 监听并持久化最后选中的主标签 ID
  watch(selectedMainLabelId, (id) => {
    try {
      localStorage.setItem(LAST_LABEL_KEY, id || '')
    } catch {}
  })

  // 恢复最后一次选中的主标签
  function restoreLastSelectedMainLabel() {
    try {
      const lastId = localStorage.getItem(LAST_LABEL_KEY)
      if (!lastId) return
      const raw = localStorage.getItem(MAIN_LABELS_STORAGE_KEY)
      const arr = raw ? JSON.parse(raw) : []
      const node = Array.isArray(arr) ? arr.find((x) => x && x.id === lastId) : null
      if (!node) return
      selectedMainLabelId.value = lastId
      suppressUnsavedOnce = true
      inputText.value = node.content || ''
      nextTick(() => {
        if (promptTagEditorRef.value?.commitPromptChange) {
          promptTagEditorRef.value.commitPromptChange('restore-main-label', inputText.value, {
            source: 'string',
            convertPunctuation: true
          })
        }

        // 初始化渲染完毕，解除一次性抑制
        suppressUnsavedOnce = false
      })
      unsavedChanges.value = false
    } catch {}
  }

  onMounted(() => {
    // 页面加载时尝试恢复上次的主标签选择
    restoreLastSelectedMainLabel()
    // 关闭页面前保存选中状态（兜底一次）
    const saveLast = () => {
      try {
        localStorage.setItem(LAST_LABEL_KEY, selectedMainLabelId.value || '')
      } catch {}
    }
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

  const isTextTranslatable = (text) => {
    // 匹配包含任何语言的字母或字符
    // 包括但不限于：中文、英文、日文、韩文、阿拉伯文、俄文等
    // 排除纯数字、标点符号和特殊符号
    return /[\p{L}]/u.test(text)
  }

  const tempInputText = ref('')

  const finishPromptPutItHistory = () => {
    // console.log('finishPromptPutItHistory 被调用', new Error().stack);
    // 去除空格、换行和制表符
    const trimmedInput = inputText.value.replace(/[\s\t\n]+/g, '')
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
    window.postMessage(
      {
        type: 'weilin_prompt_ui_prompt_finish_prompt',
        data: jsonStr
      },
      '*'
    )
  }

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
    if (
      langBtnRef.value &&
      !langBtnRef.value.contains(event.target) &&
      languageSwitcherRef.value &&
      !languageSwitcherRef.value.$el.contains(event.target)
    ) {
      closeLanguageSelector()
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

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('message', handleMessage)
    initTranslate()
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('message', handleMessage)
  })

  const handleMessage = (event) => {
    if (event.data.type === 'weilin_prompt_ui_insertTag') {
      const tagText = typeof event.data.tagText === 'string' ? event.data.tagText.trim() : ''
      if (!tagText) return

      const currentPrompt = promptTagEditorRef.value?.getPromptText?.() ?? inputText.value ?? ''
      const mergedText = currentPrompt.trim() ? currentPrompt + ', ' + tagText + ',' : tagText + ','

      if (promptTagEditorRef.value?.commitPromptChange) {
        promptTagEditorRef.value.commitPromptChange('message-insert-tag', mergedText, {
          source: 'string',
          convertPunctuation: true
        })
      } else {
        inputText.value = mergedText
      }

      nextTick(() => {
        finishPromptPutItHistory()
      })
    } else if (event.data.type === 'weilin_prompt_ui_user_history_tag') {
      setPromptText(event.data.tagText)
    } else if (event.data.type === 'weilin_prompt_ui_refresh_all_data') {
    } else if (event.data.type === 'weilin_prompt_ui_translate_setting') {
      initTranslate()
    }
  }

  const initTranslate = async () => {
    const savedSourceLanguage = localStorage.getItem('weilin_prompt_ui_sourceLanguage') || 'english'
    const savedTargetLanguage =
      localStorage.getItem('weilin_prompt_ui_targetLanguage') || 'chinese_simplified'
    if (!localStorage.getItem('weilin_prompt_ui_sourceLanguage')) {
      localStorage.setItem('weilin_prompt_ui_sourceLanguage', savedSourceLanguage)
    }
    if (!localStorage.getItem('weilin_prompt_ui_targetLanguage')) {
      localStorage.setItem('weilin_prompt_ui_targetLanguage', savedTargetLanguage)
    }
    await nextTick()
  }

  const setPromptText = (text) => {
    if (typeof text !== 'string' || text.length === 0) return

    try {
      const payload = JSON.parse(text)
      const prompt = typeof payload?.prompt === 'string' ? payload.prompt : ''
      const tempPrompt = payload?.temp_prompt

      const normalizedTokens = Array.isArray(tempPrompt)
        ? tempPrompt
        : Array.isArray(tempPrompt?.tokens)
          ? tempPrompt.tokens
          : null

      if (promptTagEditorRef.value?.commitPromptChange) {
        if (normalizedTokens) {
          promptTagEditorRef.value.commitPromptChange('set-prompt-text-tokens', normalizedTokens, {
            source: 'array',
            convertPunctuation: false
          })
        } else {
          promptTagEditorRef.value.commitPromptChange('set-prompt-text', prompt, {
            source: 'string',
            convertPunctuation: true
          })
        }
      } else {
        inputText.value = prompt
        tokens.value = normalizedTokens || []
      }
    } catch (error) {
      message({ type: 'warn', str: 'promptBox.settings.errorPrompt' })
    }
  }

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

  const clearAllPrompt = () => {
    if (promptTagEditorRef.value?.commitPromptChange) {
      promptTagEditorRef.value.commitPromptChange('clear-all', [], {
        source: 'array',
        convertPunctuation: false
      })
      return
    }
    inputText.value = ''
    tokens.value = []
    postMessageToWindowsPrompt()
  }

  // 一键清空禁用标签方法
  const clearDisabledTags = () => {
    // 过滤掉隐藏的标签，保留其他标签
    const filteredTokens = tokens.value.filter((token) => !token.isHidden)

    if (promptTagEditorRef.value?.commitPromptChange) {
      promptTagEditorRef.value.commitPromptChange('clear-disabled', filteredTokens, {
        source: 'array',
        convertPunctuation: false
      })
    } else {
      tokens.value = filteredTokens
      postMessageToWindowsPrompt()
    }

    // 显示成功提示
    message({ type: 'success', str: t('promptBox.clearDisabledSuccess') || '已清空所有禁用标签' })
  }

  defineExpose({
    setPromptText
  })
</script>

<style scoped>
  @import './prompt_index.css';

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
</style>



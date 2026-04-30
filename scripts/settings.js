import { app } from './app.js'

const CATEGORY = ['WeiLin Prompt UI', '提示词输入']

const SETTING = {
  fullwidthSymbolConversion: {
    id: 'weilin.prompt_box.fullwidth_symbol_conversion',
    name: '启用全角符号转换',
    defaultValue: true
  },
  underscoreToSpace: {
    id: 'weilin.prompt_box.underscore_to_space',
    name: '启用下划线转空格',
    defaultValue: false
  },
  bracketEscape: {
    id: 'weilin.prompt_box.bracket_escape',
    name: '启用括号转义',
    defaultValue: false
  },
  commaCloseAutocomplete: {
    id: 'weilin.prompt_box.comma_close_autocomplete',
    name: '启用逗号自动关闭补全框',
    defaultValue: false
  }
}

const STORAGE_KEY = {
  fullwidthSymbolConversion: 'weilin_prompt_ui_fullwidth_symbol_conversion',
  underscoreToBracket: 'weilin_prompt_ui_underscore_to_bracket',
  bracketEscape: 'weilin_prompt_ui_bracket_escape',
  commaCloseAutocomplete: 'weilin_prompt_ui_comma_close_autocomplete'
}

const setBool = (key, value) => {
  localStorage.setItem(key, value ? 'true' : 'false')
}

const getBool = (key, fallback) => {
  const value = localStorage.getItem(key)
  if (value === null) return fallback
  return value === 'true'
}

const applyFullwidthSymbolConversion = (enabled) => {
  setBool(STORAGE_KEY.fullwidthSymbolConversion, enabled)
}

app.registerExtension({
  name: 'weilin.prompt_ui_settings',
  settings: [
    {
      id: SETTING.fullwidthSymbolConversion.id,
      name: SETTING.fullwidthSymbolConversion.name,
      type: 'boolean',
      defaultValue: SETTING.fullwidthSymbolConversion.defaultValue,
      category: CATEGORY,
      onChange: (value) => applyFullwidthSymbolConversion(!!value)
    },
    {
      id: SETTING.underscoreToSpace.id,
      name: SETTING.underscoreToSpace.name,
      type: 'boolean',
      defaultValue: SETTING.underscoreToSpace.defaultValue,
      category: CATEGORY,
      onChange: (value) => setBool(STORAGE_KEY.underscoreToBracket, !!value)
    },
    {
      id: SETTING.bracketEscape.id,
      name: SETTING.bracketEscape.name,
      type: 'boolean',
      defaultValue: SETTING.bracketEscape.defaultValue,
      category: CATEGORY,
      onChange: (value) => setBool(STORAGE_KEY.bracketEscape, !!value)
    },
    {
      id: SETTING.commaCloseAutocomplete.id,
      name: SETTING.commaCloseAutocomplete.name,
      type: 'boolean',
      defaultValue: SETTING.commaCloseAutocomplete.defaultValue,
      category: CATEGORY,
      onChange: (value) => setBool(STORAGE_KEY.commaCloseAutocomplete, !!value)
    }
  ],
  setup: async () => {
    const settingManager = app?.extensionManager?.setting
    const readSetting = (id, fallback) => {
      const value = settingManager?.get?.(id)
      return typeof value === 'boolean' ? value : fallback
    }

    applyFullwidthSymbolConversion(
      readSetting(
        SETTING.fullwidthSymbolConversion.id,
        getBool(STORAGE_KEY.fullwidthSymbolConversion, true)
      )
    )
    setBool(
      STORAGE_KEY.underscoreToBracket,
      readSetting(SETTING.underscoreToSpace.id, getBool(STORAGE_KEY.underscoreToBracket, false))
    )
    setBool(
      STORAGE_KEY.bracketEscape,
      readSetting(SETTING.bracketEscape.id, getBool(STORAGE_KEY.bracketEscape, false))
    )
    setBool(
      STORAGE_KEY.commaCloseAutocomplete,
      readSetting(
        SETTING.commaCloseAutocomplete.id,
        getBool(STORAGE_KEY.commaCloseAutocomplete, false)
      )
    )
  }
})

const BRACKET_PAIRS = Object.freeze({
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>'
})

const BRACKET_CHARS = new Set(
  Object.keys(BRACKET_PAIRS).concat(Object.values(BRACKET_PAIRS))
)

const CHINESE_TO_ENGLISH_PUNCTUATION = Object.freeze({
  '，': ',',
  '。': '.',
  '【': '[',
  '】': ']',
  '（': '(',
  '）': ')',
  '《': '<',
  '》': '>'
})

/**
 * 去除字符串最外层括号，只有整段被一对外层括号完整包裹时才剥离。
 * 示例：
 * - "(({[rose]}))" -> "rose"
 * - "(rose (flower))" -> "rose (flower)"
 */
export const stripOuterBrackets = (input) => {
  if (typeof input !== 'string') return ''

  let text = input.trim()
  if (text.length < 2) return text

  while (text.length >= 2) {
    const open = text[0]
    const close = BRACKET_PAIRS[open]
    if (!close || text[text.length - 1] !== close) break

    let depth = 0
    let backslashRun = 0
    let fullyWrapped = true

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const escaped = backslashRun % 2 === 1

      if (!escaped) {
        if (char === open) {
          depth++
        } else if (char === close) {
          depth--
          if (depth < 0 || (depth === 0 && i < text.length - 1)) {
            fullyWrapped = false
            break
          }
        }
      }

      backslashRun = char === '\\' ? backslashRun + 1 : 0
    }

    if (!fullyWrapped || depth !== 0) break
    text = text.slice(1, -1).trim()
  }

  return text
}

/**
 * 对单个 Tag 执行下划线转空格。
 */
export const replaceUnderscoreWithSpace = (tag) => {
  if (typeof tag !== 'string') return ''
  return tag.includes('_') ? tag.split('_').join(' ') : tag
}

/**
 * 对单个 Tag 执行括号转义，默认处理 ()[]{}<>。
 * 已转义的括号不会重复转义。
 */
export const escapeTagBrackets = (tag) => {
  if (typeof tag !== 'string') return ''

  const chars = []
  let backslashRun = 0
  for (let i = 0; i < tag.length; i++) {
    const char = tag[i]
    const escaped = backslashRun % 2 === 1

    if (BRACKET_CHARS.has(char) && !escaped) {
      chars.push('\\', char)
    } else {
      chars.push(char)
    }

    backslashRun = char === '\\' ? backslashRun + 1 : 0
  }
  return chars.join('')
}

/**
 * 将整段文本中的中文标点转换为英文标点。
 */
export const convertChinesePunctuation = (text) => {
  if (typeof text !== 'string') return ''

  const chars = []
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    chars.push(CHINESE_TO_ENGLISH_PUNCTUATION[char] || char)
  }
  return chars.join('')
}

export default {
  stripOuterBrackets,
  replaceUnderscoreWithSpace,
  escapeTagBrackets,
  convertChinesePunctuation
}

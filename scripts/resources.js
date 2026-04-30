const WEILIN_VERSION = '1.0.1'

let resourcesLoaded = false
let resourcesLoading = false

export const injectPromptUiCss = () => {
  if (document.getElementById('weilin-prompt-ui-fix-css')) return

  const link = document.createElement('link')
  link.id = 'weilin-prompt-ui-fix-css'
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = new URL('./weilin_fix.css', import.meta.url).href
  document.head.appendChild(link)

  console.log('[WeiLin] CSS fix files loaded')
}

export function loadResourcesOnDemand() {
  if (resourcesLoaded || resourcesLoading) return Promise.resolve()

  resourcesLoading = true

  return new Promise((resolve) => {
    let loadedCount = 0
    const totalResources = 2

    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount === totalResources) {
        waitForVueAppInit(resolve)
      }
    }

    const waitForVueAppInit = (resolveCallback) => {
      const checkVueReady = () => {
        const container = document.getElementById('weilin_comfyui_tools_prompt_ui_div')
        if (!container) return false

        const hasVueApp = container.__vue_app__ || container.__vue__ || container.children.length > 0

        if (hasVueApp) {
          console.log('[WeiLin] Vue app initialized, resources ready')
          resourcesLoaded = true
          resourcesLoading = false
          resolveCallback()
          return true
        }
        return false
      }

      if (checkVueReady()) return

      let attempts = 0
      const maxAttempts = 100
      const pollInterval = setInterval(() => {
        attempts++
        if (checkVueReady()) {
          clearInterval(pollInterval)
        } else if (attempts >= maxAttempts) {
          console.warn('[WeiLin] Vue app initialization timeout, proceeding anyway')
          clearInterval(pollInterval)
          resourcesLoaded = true
          resourcesLoading = false
          resolveCallback()
        }
      }, 100)
    }

    const script1 = document.createElement('script')
    script1.src = `./weilin/prompt_ui/webjs?v=${WEILIN_VERSION}`
    script1.type = 'text/javascript'
    script1.onload = checkAllLoaded
    script1.onerror = checkAllLoaded
    document.head.appendChild(script1)

    const link1 = document.createElement('link')
    link1.rel = 'stylesheet'
    link1.type = 'text/css'
    link1.href = `./weilin/prompt_ui/file/style.css?v=${WEILIN_VERSION}`
    link1.onload = checkAllLoaded
    link1.onerror = checkAllLoaded
    document.head.appendChild(link1)
  })
}

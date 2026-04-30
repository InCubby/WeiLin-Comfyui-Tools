import {app} from './app.js'
import {injectPromptUiCss, loadResourcesOnDemand} from './resources.js'

console.log('[WeiLin] JavaScript file loaded: extension.js')
injectPromptUiCss()

if (window.weilinExtensionRegistered) {
  console.log('[WeiLin] Extension already registered, skipping...')
} else {
  window.weilinExtensionRegistered = true

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const openButtonLabel = typeof navigator !== 'undefined' && (navigator.language || '').startsWith('zh')
      ? '打开提示词编辑器' : 'Open Prompt UI'
  let globalNodeList = []

  function updateNodeTitleBySeed(seed, newTitle) {
    const targetNode = globalNodeList.find((node) => node.seed === seed)
    if (targetNode) {
      targetNode.title = newTitle
    }
  }

  function updateNodeIdBySeed(seed, newId) {
    const targetNode = globalNodeList.find((node) => node.seed === seed)
    if (targetNode) {
      targetNode.id = newId
    }
  }

  function updateNodeTextBySeed(seed, newText) {
    const targetNode = globalNodeList.find((node) => node.seed === seed)
    if (targetNode) {
      targetNode.text = newText
    }
  }

  function removeNodeBySeed(seed) {
    const index = globalNodeList.findIndex((node) => node.seed === seed)
    if (index !== -1) {
      globalNodeList.splice(index, 1)
    }
  }

  console.log('[WeiLin] Registering extension...')

  app.registerExtension({
    name: "weilin.prompt_ui_node", async init() {
      console.log('[WeiLin] Extension init');

      setTimeout(() => {
        console.log('[WeiLin] Checking if WeiLin nodes are registered...');
        if (window.comfyAPI && window.comfyAPI.app && window.comfyAPI.app.app) {
          const app = window.comfyAPI.app.app;
          if (app.nodes) {
            console.log('[WeiLin] Registered nodes:', Object.keys(app.nodes));
            Object.keys(app.nodes).filter((name) => name.includes('WeiLin'))
          }
        }
      }, 2000);
    }, async setup() {
      console.log('[WeiLin] Extension setup');
    }, async beforeRegisterNodeDef(nodeType, nodeData, app) {
      if (nodeData.name === "WeiLinPromptUIWithoutLora") {
        console.log('[WeiLin] ⭐ Matching node found:', nodeData.name);
        console.log('[WeiLin] Node data:', nodeData);
        console.log('[WeiLin] Node type:', nodeType);
      }

      if (nodeData.name === "WeiLinPromptUIWithoutLora") {
        console.log('[WeiLin] Matching node found:', nodeData.name);

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = async function () {
          console.log('[WeiLin] onNodeCreated called for:', nodeData.name);
          const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

          let nodeTextAreaList = []
          let nodeWidgetList = []
          const thisNodeSeed = generateUUID();

          const cleanupOverlays = () => {
            const overlays = document.querySelectorAll('.loading-overlay, .weilin-comfyui-loading-overlay');
            overlays.forEach(overlay => {
              if (!overlay.closest('.weilin-prompt-ui-container')) {
                overlay.remove();
              }
            });
          };
          cleanupOverlays();
          setTimeout(cleanupOverlays, 100);
          setTimeout(cleanupOverlays, 500);

          const fixCurrentNodeDomWidgets = () => {
            if (!this.widgets) return;
            if (nodeData.name === "WeiLinPromptUIWithoutLora") return;
            const processedDomWidgets = new Set();

            this.widgets.forEach(widget => {
              if (widget.element) {

                let parent = widget.element.parentElement;
                while (parent) {
                  if (parent.classList && parent.classList.contains('dom-widget')) {
                    if (processedDomWidgets.has(parent)) {
                      parent = parent.parentElement;
                      continue;
                    }
                    processedDomWidgets.add(parent);

                    const isFirstFix = !parent.classList.contains('weilin-owned-dom-widget');
                    parent.style.setProperty('pointer-events', 'none', 'important');
                    parent.classList.add('weilin-owned-dom-widget');
                    parent.style.setProperty('position', 'absolute', 'important');
                    parent.classList.remove('size-full');
                    if (isFirstFix) {
                      console.log('[WeiLin] Fixed dom-widget for node:', nodeData.name);
                    }
                    if (widget.element) {
                      widget.element.style.setProperty('pointer-events', 'auto', 'important');
                    }
                    break;
                  }
                  parent = parent.parentElement;
                }
              }
            });
          };


          fixCurrentNodeDomWidgets();
          setTimeout(fixCurrentNodeDomWidgets, 100);
          setTimeout(fixCurrentNodeDomWidgets, 500);
          setTimeout(fixCurrentNodeDomWidgets, 1000);

          if (nodeData.name === "WeiLinPromptUIWithoutLora") {
            hideWidgetForGood(this, this.widgets.find(w => w.name === "temp_str"))
          }

          for (let index = 0; index < this.widgets.length; index++) {
            const widgetItem = this.widgets[index];
            if (widgetItem.name == "positive") {
              let thisInputElement = widgetItem.element
              nodeTextAreaList[0] = thisInputElement
              nodeWidgetList[0] = widgetItem
            } else if (widgetItem.name == "temp_str") {
              let thisInputElement = widgetItem.element
              thisInputElement.readOnly = true
              nodeTextAreaList[2] = thisInputElement
              nodeWidgetList[2] = widgetItem
            }
          }

          let promptBoxRandomID = generateUUID();
          if (nodeData.name === "WeiLinPromptUIWithoutLora") {
            globalNodeList.push({seed: thisNodeSeed, text: nodeTextAreaList[0].value, id: this.id})
            const textarea = nodeTextAreaList[0];
            textarea.addEventListener('input', (event) => {
              const newValue = event.target.value;
              updateNodeTextBySeed(thisNodeSeed, newValue);
              window.parent.postMessage({
                type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList
              }, '*')
            });
          }

          let currentThisId = this.id
          Object.defineProperty(this, 'id', {
            get() {
              return currentThisId;
            }, set(newValue) {
              currentThisId = newValue;
              onTisIdChange(newValue);
            }, enumerable: true, configurable: true
          });

          function onTisIdChange(newId) {
            if (nodeData.name === "WeiLinPromptUIWithoutLora") {
              updateNodeIdBySeed(thisNodeSeed, newId);
              window.parent.postMessage({
                type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList
              }, '*')
            }
          }

          let currentTitle = this.title;
          Object.defineProperty(this, 'title', {
            get() {
              return currentTitle;
            }, set(newValue) {
              currentTitle = newValue;
              onTitleChange(newValue);
            }, enumerable: true, configurable: true
          });


          function onTitleChange(newTitle) {
            if (nodeData.name === "WeiLinPromptUIWithoutLora") {
              updateNodeTitleBySeed(thisNodeSeed, newTitle);
              window.parent.postMessage({
                type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList
              }, '*')
            }
          }

          const messageHandler = (event) => {
            if (event.data.type === 'weilin_prompt_ui_prompt_update_prompt_' + promptBoxRandomID) {
              const jsonReponse = JSON.parse(event.data.data)
              nodeTextAreaList[0].value = jsonReponse.prompt;
              if (nodeWidgetList[0]) nodeWidgetList[0].value = jsonReponse.prompt;
              if (jsonReponse.temp_prompt && (typeof jsonReponse.temp_prompt === 'object') && Object.keys(jsonReponse.temp_prompt).length > 0) {
                if (nodeTextAreaList[2]) nodeTextAreaList[2].value = JSON.stringify(jsonReponse.temp_prompt);
                if (nodeWidgetList[2]) nodeWidgetList[2].value = JSON.stringify(jsonReponse.temp_prompt);
              } else {
                if (nodeTextAreaList[2]) nodeTextAreaList[2].value = "";
                if (nodeWidgetList[2]) nodeWidgetList[2].value = "";
              }

              updateNodeTextBySeed(thisNodeSeed, jsonReponse.prompt);
              window.parent.postMessage({
                type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList
              }, '*')
            } else if (event.data.type === 'weilin_prompt_ui_prompt_get_node_list_info') {
              if (nodeData.name === "WeiLinPromptUIWithoutLora") {
                updateNodeTextBySeed(thisNodeSeed, nodeTextAreaList[0].value);
                window.parent.postMessage({
                  type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList
                }, '*')
              }
            } else if (event.data.type === "weilin_prompt_ui_prompt_open_node_wit_seed" && event.data.seed === thisNodeSeed) {
              loadResourcesOnDemand().then(() => {
                promptBoxRandomID = generateUUID();
                let jsonData = {
                  prompt: nodeTextAreaList[0].value, temp_prompt: {},
                }
                if (nodeTextAreaList[2] && nodeTextAreaList[2].value && nodeTextAreaList[2].value.length > 0) {
                  jsonData.temp_prompt = JSON.parse(nodeTextAreaList[2].value)
                }
                const data = JSON.stringify(jsonData)
                window.parent.postMessage({
                  type: 'weilin_prompt_ui_openPromptBox',
                  id: promptBoxRandomID,
                  prompt: data,
                  node: nodeData.name
                }, '*')
              });
            }
          };
          window.addEventListener('message', messageHandler, false);
          if (nodeData.name === "WeiLinPromptUIWithoutLora") {
            this.addWidget("button", openButtonLabel, '', async ($e) => {
              await loadResourcesOnDemand();
              promptBoxRandomID = generateUUID();
              let jsonData = {
                prompt: nodeTextAreaList[0].value, temp_prompt: {},
              }
              if (nodeTextAreaList[2] && nodeTextAreaList[2].value && nodeTextAreaList[2].value.length > 0) {
                jsonData.temp_prompt = JSON.parse(nodeTextAreaList[2].value)
              }
              const data = JSON.stringify(jsonData)
              window.parent.postMessage({
                type: 'weilin_prompt_ui_openPromptBox',
                id: promptBoxRandomID,
                prompt: data,
                node: nodeData.name
              }, '*')
            });
          }

          const originalOnRemoved = this.onRemoved;
          this.onRemoved = () => {
            console.log('[WeiLin] onRemoved called for:', nodeData.name);
            if (originalOnRemoved) {
              originalOnRemoved.apply(this);
            }
            window.removeEventListener('message', messageHandler, false);
            const overlays = document.querySelectorAll('.loading-overlay, .weilin-comfyui-loading-overlay');
            overlays.forEach(overlay => {
              overlay.remove();
            });
            if (nodeData.name === "WeiLinPromptUIWithoutLora") {
              removeNodeBySeed(thisNodeSeed);
              window.parent.postMessage({
                type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList
              }, '*')
            }
          }
          return r;
        };

        const onExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function (message) {
          onExecuted?.apply(this, arguments);
          const positiveWidget = this.widgets.find(w => w.name === "positive");
          if (positiveWidget && message.positive) {
            positiveWidget.element.value = message.positive;
            const event = new Event('input', {bubbles: true});
            positiveWidget.element.dispatchEvent(event);
          }
        };
      }
    }
  })
}

function hideWidgetForGood(node, widget, suffix = '') {
  widget.origType = widget.type
  widget.origComputeSize = widget.computeSize
  widget.origSerializeValue = widget.serializeValue
  widget.computeSize = () => [0, -4]
  widget.type = "converted-widget" + suffix
  widget.element.setAttribute("id", "weilin-hidden-weight");
  widget.element.style.display = 'none'
  widget.serializeValue = () => {
    return widget.value;
  }
  if (widget.linkedWidgets) {
    for (const w of widget.linkedWidgets) {
      hideWidgetForGood(node, w, ':' + widget.name)
    }
  }
}

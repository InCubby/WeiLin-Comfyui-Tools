// WeiLin Prompt UI Node - JavaScript Extension
// ComfyUI 2.0兼容性：从window.comfyAPI获取app对象

console.log('[WeiLin] JavaScript file loaded: weilin_prompt_ui_node.js');

// 加载CSS修复文件
(function() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = './weilin_fix.css';
    document.head.appendChild(link);
    
    console.log('[WeiLin] CSS fix files loaded');
})();

// 防止重复注册
if (window.weilinExtensionRegistered) {
  console.log('[WeiLin] Extension already registered, skipping...');
} else {
  window.weilinExtensionRegistered = true;
  
  // 等待app对象可用
  function waitForApp(callback, maxAttempts = 50) {
    let attempts = 0;
    const check = () => {
      attempts++;
      // ComfyUI 2.0: 从window.comfyAPI获取app对象
      const app = window.comfyAPI?.app?.app || window.app || window.comfyApp;
      if (app) {
        console.log('[WeiLin] App object found:', app);
        callback(app);
      } else if (attempts < maxAttempts) {
        setTimeout(check, 100);
      } else {
        console.error('[WeiLin] Failed to find app object after', maxAttempts, 'attempts');
        // console.log('[WeiLin] window.comfyAPI:', window.comfyAPI);
        // console.log('[WeiLin] window.app:', window.app);
        // console.log('[WeiLin] window.comfyApp:', window.comfyApp);
      }
    };
    check();
  }

  // 提示词 Node

// localStorage.setItem("weilin_prompt_ui_onfirst", 0);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let localLanguage = "打开提示词编辑器"

function getBrowserLanguage() {
  // 获取浏览器语言
  const language = navigator.language || navigator.userLanguage;
  // 判断语言类型
  if (language.startsWith('zh')) {
    localLanguage = "打开提示词编辑器"
  } else if (language.startsWith('en')) {
    localLanguage = "Open Prompt UI"
  } else {
    localLanguage = "Open Prompt UI"
  }
}

let globalNodeList = []

let global_randomID = generateUUID(); // 随机种子ID

function updateNodeTitleBySeed(seed, newTitle) {
  // 使用 find 方法查找目标节点
  const targetNode = globalNodeList.find(node => node.seed === seed);
  if (targetNode) {
    // 如果找到目标节点，修改其 title
    targetNode.title = newTitle;
  }
}

function updateNodeIdBySeed(seed, newId) {
  const targetNode = globalNodeList.find(node => node.seed === seed);
  if (targetNode) {
    targetNode.id = newId;
  }
}

function updateNodeTextBySeed(seed, newText) {
  const targetNode = globalNodeList.find(node => node.seed === seed);
  if (targetNode) {
    targetNode.text = newText;
  }
}

// 根据seed删除元素
function removeNodeBySeed(seed) {
  const index = globalNodeList.findIndex(node => node.seed === seed);
  if (index !== -1) {
    globalNodeList.splice(index, 1);
  }
}
// 版本号，用于强制刷新缓存 - 修改此值可强制浏览器重新加载静态资源
const WEILIN_VERSION = '1.0.1';

// 资源加载状态
let resourcesLoaded = false;
let resourcesLoading = false;

// 按需加载资源 - 只在用户首次打开编辑器时才加载
function loadResourcesOnDemand() {
  // 如果资源已加载或正在加载，直接返回
  if (resourcesLoaded || resourcesLoading) return Promise.resolve();
  
  resourcesLoading = true;
  
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalResources = 2;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalResources) {
        // 等待Vue应用初始化完成
        waitForVueAppInit(resolve);
      }
    };
    
    // 等待Vue应用初始化完成的函数
    const waitForVueAppInit = (resolveCallback) => {
      // 检查Vue应用是否已初始化的标志：
      // 1. weilin_comfyui_tools_prompt_ui_div 元素存在
      // 2. Vue应用已挂载（检查 __vue_app__ 或元素内部有内容）
      const checkVueReady = () => {
        const container = document.getElementById('weilin_comfyui_tools_prompt_ui_div');
        if (!container) return false;
        
        // Vue 3 会在挂载元素上设置 __vue_app__ 属性
        // 或者检查容器内是否有Vue渲染的内容
        const hasVueApp = container.__vue_app__ || 
                          container.__vue__ || 
                          container.children.length > 0;
        
        if (hasVueApp) {
          console.log('[WeiLin] Vue app initialized, resources ready');
          resourcesLoaded = true;
          resourcesLoading = false;
          resolveCallback();
          return true;
        }
        return false;
      };
      
      // 立即检查一次
      if (checkVueReady()) return;
      
      // 如果还没准备好，使用轮询检查
      let attempts = 0;
      const maxAttempts = 100; // 最多等待10秒
      const pollInterval = setInterval(() => {
        attempts++;
        if (checkVueReady()) {
          clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          console.warn('[WeiLin] Vue app initialization timeout, proceeding anyway');
          clearInterval(pollInterval);
          resourcesLoaded = true;
          resourcesLoading = false;
          resolveCallback();
        }
      }, 100);
    };
    
    // 加载主JS (648KB) - 移除defer，让脚本立即执行
    var script1 = document.createElement('script');
    script1.src = './weilin/prompt_ui/webjs?v=' + WEILIN_VERSION;
    script1.type = 'text/javascript';
    script1.onload = checkAllLoaded;
    script1.onerror = checkAllLoaded;
    document.head.appendChild(script1);

    // 加载CSS - 使用preload优化
    var link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.type = 'text/css';
    link1.href = './weilin/prompt_ui/file/style.css?v=' + WEILIN_VERSION;
    link1.onload = checkAllLoaded;
    link1.onerror = checkAllLoaded;
    document.head.appendChild(link1);

  });
}

// 不再自动加载资源，改为按需加载
// setTimeout(initWindow, 2000);

// 等待app对象可用后注册扩展
waitForApp((app) => {
  console.log('[WeiLin] Registering extension...');
  
  app.registerExtension({
  name: "weilin.prompt_ui_node",
  async init() {
    console.log('[WeiLin] Extension init');
    
    // 检查ComfyUI是否识别了WeiLin节点
    setTimeout(() => {
      console.log('[WeiLin] Checking if WeiLin nodes are registered...');
      
      // 尝试获取所有已注册的节点
      if (window.comfyAPI && window.comfyAPI.app && window.comfyAPI.app.app) {
        const app = window.comfyAPI.app.app;
        // console.log('[WeiLin] App object:', app);
        
        // 检查nodes属性
        if (app.nodes) {
          console.log('[WeiLin] Registered nodes:', Object.keys(app.nodes));
          
          // 查找WeiLin节点
          const weilinNodes = Object.keys(app.nodes).filter(name => name.includes('WeiLin'));
          // console.log('[WeiLin] WeiLin nodes found:', weilinNodes);
        }
      }
    }, 2000);
  },
  async setup() {
    console.log('[WeiLin] Extension setup');
  },
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    // console.log('[WeiLin] beforeRegisterNodeDef called, nodeData.name:', nodeData.name);
    
    // 检查是否是WeiLin节点
    if (nodeData.name === "WeiLinPromptUIWithoutLora") {
      console.log('[WeiLin] ⭐ Matching node found:', nodeData.name);
      console.log('[WeiLin] Node data:', nodeData);
      console.log('[WeiLin] Node type:', nodeType);
    }
    // console.log(app)
    if (nodeData.name === "WeiLinPromptUIWithoutLora") {
      console.log('[WeiLin] Matching node found:', nodeData.name);
      // Create node
      const onNodeCreated = nodeType.prototype.onNodeCreated;
      nodeType.prototype.onNodeCreated = async function () {
        console.log('[WeiLin] onNodeCreated called for:', nodeData.name);
        const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

        const thisNodeName = nodeData.name // 存储当前的节点名称
        let nodeTextAreaList = [] // 按顺序载入element，name="positive" || "temp_str"
        let nodeWidgetList = [] // 保存widget引用，用于同步更新widget.value
        const thisNodeSeed = generateUUID(); // 随机唯一种子ID

        // 清理可能残留的遮罩层
        const cleanupOverlays = () => {
          // 清理loading遮罩层
          const overlays = document.querySelectorAll('.loading-overlay, .weilin-comfyui-loading-overlay');
          overlays.forEach(overlay => {
            // 只移除不在DOM树中的孤立遮罩层
            if (!overlay.closest('.weilin-prompt-ui-container')) {
              overlay.remove();
            }
          });
        };
        cleanupOverlays();
        
        // 延迟再次清理，确保所有DOM操作完成
        setTimeout(cleanupOverlays, 100);
        setTimeout(cleanupOverlays, 500);
        
        // ========================================
        // 核心修复：解决dom-widget容器遮挡画布的问题
        // ========================================
        // 问题：dom-widget容器有 position:fixed 和 size-full，遮挡整个画布
        // 解决：只修复当前节点的dom-widget，不影响其他节点
        // ========================================
        const fixCurrentNodeDomWidgets = () => {
          if (!this.widgets) return;
          // 三种 WeiLin 节点统一保留 Comfy 原生缩放链，
          // 避免小画布/缩放时 dom-widget 与 canvas widget 叠层错位。
          if (
            nodeData.name === "WeiLinPromptUIWithoutLora"
          ) return;
          const processedDomWidgets = new Set();
          
          this.widgets.forEach(widget => {
            if (widget.element) {
              // 找到widget的dom-widget容器
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
                  
                  // 确保内部元素可以交互
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
        
        // 立即执行修复
        fixCurrentNodeDomWidgets();
        
        // 延迟执行，确保DOM完全加载
        setTimeout(fixCurrentNodeDomWidgets, 100);
        setTimeout(fixCurrentNodeDomWidgets, 500);
        setTimeout(fixCurrentNodeDomWidgets, 1000);

        if (nodeData.name === "WeiLinPromptUIWithoutLora") {
          hideWidgetForGood(this, this.widgets.find(w => w.name === "temp_str"))
          hideWidgetForGood(this, this.widgets.find(w => w.name === "random_template"))
        }

        for (let index = 0; index < this.widgets.length; index++) {
          const widgetItem = this.widgets[index];
          if (widgetItem.name == "positive") {
            let thisInputElement = widgetItem.element
            // thisInputElement.readOnly = true
            nodeTextAreaList[0] = thisInputElement
            nodeWidgetList[0] = widgetItem
          } else if (widgetItem.name == "temp_str") {
            let thisInputElement = widgetItem.element
            thisInputElement.readOnly = true
            nodeTextAreaList[2] = thisInputElement
            nodeWidgetList[2] = widgetItem
          } else if (widgetItem.name == "random_template") {
            let thisInputElement = widgetItem.element
            thisInputElement.readOnly = true
            nodeTextAreaList[4] = thisInputElement
            nodeWidgetList[4] = widgetItem
          }
        }

        // 为不同的按钮使用不同的ID，避免冲突（必须在使用前声明）
        // 修复Bug：初始化时直接生成唯一UUID，防止被全局窗口(空ID)广播的消息意外覆盖
        let promptBoxRandomID = generateUUID();

        // console.log(this)

        // 修改的是这部分
        if (nodeData.name === "WeiLinPromptUIWithoutLora") {
          globalNodeList.push({ seed: thisNodeSeed, text: nodeTextAreaList[0].value, id: this.id })

          const textarea = nodeTextAreaList[0];

          textarea.addEventListener('input', (event) => {
            const newValue = event.target.value;
            // 修复Bug：补充缺失的 thisNodeSeed 参数
            updateNodeTextBySeed(thisNodeSeed, newValue);
            window.parent.postMessage({ type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList }, '*')
          });
        }


        // 监听节点ID
        let currentThisId = this.id
        Object.defineProperty(this, 'id', {
          get() {
            return currentThisId;
          },
          set(newValue) {
            currentThisId = newValue;
            onTisIdChange(newValue);
          },
          enumerable: true,
          configurable: true
        });

        function onTisIdChange(newId) {
          // console.log(newId)
          if (nodeData.name === "WeiLinPromptUIWithoutLora") {
            updateNodeIdBySeed(thisNodeSeed, newId);
            window.parent.postMessage({ type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList }, '*')
          }
        }

        // 监听 this.title 的变化
        let currentTitle = this.title; // 缓存当前值
        Object.defineProperty(this, 'title', {
          get() {
            return currentTitle;
          },
          set(newValue) {
            // console.log(`this.title changed from ${currentTitle} to ${newValue}`);
            currentTitle = newValue;
            // 触发回调，返回新的 this.title 数据
            onTitleChange(newValue);
          },
          enumerable: true,
          configurable: true
        });

        // 监听 this.title 变化的回调函数
        function onTitleChange(newTitle) {
          // console.log("New this.title:", newTitle);
          // 在这里可以处理新的 this.title 数据
          // 例如，将新的 this.title 传递给其他逻辑
          if (nodeData.name === "WeiLinPromptUIWithoutLora") {
            updateNodeTitleBySeed(thisNodeSeed, newTitle);
            window.parent.postMessage({ type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList }, '*')
          }
        }

        // console.log(thisNodeSeed)

        //console.log(globalNodeList)

        // 定义消息处理函数，保存引用以便后续移除
        const messageHandler = (event) => {
          // console.log(e)
          if (event.data.type === 'weilin_prompt_ui_prompt_update_prompt_' + promptBoxRandomID) {
            // 接收到更新提示词内容消息

            const jsonReponse = JSON.parse(event.data.data)
            // console.log(jsonReponse)
            nodeTextAreaList[0].value = jsonReponse.prompt;
            if (nodeWidgetList[0]) nodeWidgetList[0].value = jsonReponse.prompt;

            if (jsonReponse.temp_prompt && (typeof jsonReponse.temp_prompt === 'object') && Object.keys(jsonReponse.temp_prompt).length > 0) {
              if (nodeTextAreaList[2]) nodeTextAreaList[2].value = JSON.stringify(jsonReponse.temp_prompt);
              if (nodeWidgetList[2]) nodeWidgetList[2].value = JSON.stringify(jsonReponse.temp_prompt);
            }else {
              if (nodeTextAreaList[2]) nodeTextAreaList[2].value = "";
              if (nodeWidgetList[2]) nodeWidgetList[2].value = "";
            }


            // console.log(nodeTextAreaList)
            updateNodeTextBySeed(thisNodeSeed, jsonReponse.prompt);
            window.parent.postMessage({ type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList }, '*')

          } else if (event.data.type === 'weilin_prompt_ui_prompt_get_node_list_info') {
            // 获取节点导航信息
            if (nodeData.name === "WeiLinPromptUIWithoutLora") {
              updateNodeTextBySeed(thisNodeSeed, nodeTextAreaList[0].value);
              window.parent.postMessage({ type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList }, '*')
            }

          } else if (event.data.type === "weilin_prompt_ui_prompt_open_node_wit_seed" && event.data.seed === thisNodeSeed) {
            // 节点导航打开节点UI按钮
            // 先加载资源
            loadResourcesOnDemand().then(() => {
              promptBoxRandomID = generateUUID();
              // console.log("register====>",promptBoxRandomID)
              let jsonData = {
                prompt: nodeTextAreaList[0].value,
                temp_prompt: {},
              }
              if (nodeTextAreaList[2] && nodeTextAreaList[2].value && nodeTextAreaList[2].value.length > 0) {
                jsonData.temp_prompt = JSON.parse(nodeTextAreaList[2].value)
              }

              const data = JSON.stringify(jsonData)
              window.parent.postMessage({ type: 'weilin_prompt_ui_openPromptBox', id: promptBoxRandomID, prompt: data, node: nodeData.name }, '*')
            });
          
          }else if (event.data.type === "weilin_prompt_ui_update_template_"+promptBoxRandomID) {
            nodeTextAreaList[4].value = event.data.data
            if (nodeWidgetList[4]) nodeWidgetList[4].value = event.data.data
          }else if (event.data.type === "weilin_prompt_ui_get_template_"+promptBoxRandomID) {
            window.parent.postMessage({ type: 'weilin_prompt_ui_get_template_response', id: promptBoxRandomID, data: nodeTextAreaList[4].value }, '*')
          }else if (event.data.type === "weilin_prompt_ui_get_template_go_random_"+promptBoxRandomID) {
            window.parent.postMessage({ type: 'weilin_prompt_ui_get_template_go_random_response', id: promptBoxRandomID, data: nodeTextAreaList[4].value }, '*')
          }

        };

        // 注册消息监听器
        window.addEventListener('message', messageHandler, false);

        // 添加按钮点击事件
        if (nodeData.name === "WeiLinPromptUIWithoutLora") {
          // 节点按钮点击事件 - 打开提示词编辑器
          this.addWidget("button", localLanguage, '', async ($e) => {
            // 先加载资源（如果还未加载）
            await loadResourcesOnDemand();
            
            // console.log(thisNodeName)
            // 发送消息给父窗口
            // console.log(global_randomID)
            promptBoxRandomID = generateUUID();
            // console.log("register====>",promptBoxRandomID)
            let jsonData = {
              prompt: nodeTextAreaList[0].value,
              temp_prompt: {},
            }
            if (nodeTextAreaList[2] && nodeTextAreaList[2].value && nodeTextAreaList[2].value.length > 0) {
              jsonData.temp_prompt = JSON.parse(nodeTextAreaList[2].value)
            }

            const data = JSON.stringify(jsonData)
            window.parent.postMessage({ type: 'weilin_prompt_ui_openPromptBox', id: promptBoxRandomID, prompt: data, node: nodeData.name }, '*')
          });
        }

        // 保存原有的onRemoved函数
        const originalOnRemoved = this.onRemoved;
        // 节点被删除事件
        this.onRemoved = () => {
          console.log('[WeiLin] onRemoved called for:', nodeData.name);
          
          // 调用原有的onRemoved函数
          if (originalOnRemoved) {
            originalOnRemoved.apply(this);
          }

          // 移除消息监听器，防止内存泄漏和事件冲突
          window.removeEventListener('message', messageHandler, false);

          // 清理可能残留的遮罩层
          const overlays = document.querySelectorAll('.loading-overlay, .weilin-comfyui-loading-overlay');
          overlays.forEach(overlay => {
            overlay.remove();
          });

          // 元素被销毁 事件发送更新元素
          if (nodeData.name === "WeiLinPromptUIWithoutLora") {
            removeNodeBySeed(thisNodeSeed);
            window.parent.postMessage({ type: 'weilin_prompt_ui_update_node_list_info', nodeList: globalNodeList }, '*')
          }

        }

        return r;
      };

      // When the node is executed we will be sent the input text, display this in the widget
      const onExecuted = nodeType.prototype.onExecuted;
      nodeType.prototype.onExecuted = function (message) {
        onExecuted?.apply(this, arguments);
        const positiveWidget = this.widgets.find(w => w.name === "positive");
        if (positiveWidget && message.positive) {
          positiveWidget.element.value = message.positive;
          // 触发input事件以更新全局状态
          const event = new Event('input', { bubbles: true });
          positiveWidget.element.dispatchEvent(event);
        }
        // console.log(message.positive)
      };
    }
  },
});
}); // waitForApp回调结束
} // 防止重复注册的else块结束


//from melmass
// https://github.com/kijai/ComfyUI-KJNodes/blob/main/web/js/spline_editor.js
function hideWidgetForGood(node, widget, suffix = '') {

  widget.origType = widget.type
  widget.origComputeSize = widget.computeSize
  widget.origSerializeValue = widget.serializeValue
  widget.computeSize = () => [0, -4] // -4 is due to the gap litegraph adds between widgets automatically
  widget.type = "converted-widget" + suffix
  widget.element.setAttribute("id", "weilin-hidden-weight");
  widget.element.style.display = 'none'
  // 启用序列化，确保widget值被保存到工作流JSON中
  widget.serializeValue = () => {
      return widget.value;
  }

  // Hide any linked widgets, e.g. seed+seedControl
  if (widget.linkedWidgets) {
    for (const w of widget.linkedWidgets) {
      hideWidgetForGood(node, w, ':' + widget.name)
    }
  }
}


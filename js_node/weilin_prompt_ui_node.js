// WeiLin Prompt UI Node - JavaScript Extension
// ComfyUI 2.0 compatible registration entry.

console.log("[WeiLin] JavaScript file loaded: weilin_prompt_ui_node.js");

// Load compatibility CSS fix.
(function () {
  const possiblePaths = [
    "./extensions/weilin-comfyui-tools/weilin_fix.css",
    "./extensions/weilin-comfyui-tools/js_node/weilin_fix.css",
    "./weilin_fix.css",
  ];

  possiblePaths.forEach((path) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = path;
    document.head.appendChild(link);
  });
})();

if (window.weilinExtensionRegistered) {
  console.log("[WeiLin] Extension already registered, skipping...");
} else {
  window.weilinExtensionRegistered = true;

  function waitForApp(callback, maxAttempts = 50) {
    let attempts = 0;
    const check = () => {
      attempts++;
      const app = window.comfyAPI?.app?.app || window.app || window.comfyApp;
      if (app) {
        callback(app);
      } else if (attempts < maxAttempts) {
        setTimeout(check, 100);
      } else {
        console.error("[WeiLin] Failed to find app object after", maxAttempts, "attempts");
      }
    };
    check();
  }

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  let localLanguage = "打开提示词编辑器";
  function getBrowserLanguage() {
    const language = navigator.language || navigator.userLanguage;
    if (language?.startsWith("en")) {
      localLanguage = "Open Prompt UI";
    }
  }
  getBrowserLanguage();

  const globalNodeList = [];
  const WEILIN_VERSION = "1.0.1";

  function updateNodeTitleBySeed(seed, newTitle) {
    const targetNode = globalNodeList.find((node) => node.seed === seed);
    if (targetNode) targetNode.title = newTitle;
  }

  function updateNodeIdBySeed(seed, newId) {
    const targetNode = globalNodeList.find((node) => node.seed === seed);
    if (targetNode) targetNode.id = newId;
  }

  function updateNodeTextBySeed(seed, newText) {
    const targetNode = globalNodeList.find((node) => node.seed === seed);
    if (targetNode) targetNode.text = newText;
  }

  function removeNodeBySeed(seed) {
    const index = globalNodeList.findIndex((node) => node.seed === seed);
    if (index !== -1) globalNodeList.splice(index, 1);
  }

  let resourcesLoaded = false;
  let resourcesLoading = false;

  function loadResourcesOnDemand() {
    if (resourcesLoaded || resourcesLoading) return Promise.resolve();
    resourcesLoading = true;

    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalResources = 2;

      const waitForVueAppInit = (resolveCallback) => {
        const checkVueReady = () => {
          const container = document.getElementById("weilin_comfyui_tools_prompt_ui_div");
          if (!container) return false;
          const hasVueApp =
            container.__vue_app__ || container.__vue__ || container.children.length > 0;
          if (hasVueApp) {
            resourcesLoaded = true;
            resourcesLoading = false;
            resolveCallback();
            return true;
          }
          return false;
        };

        if (checkVueReady()) return;

        let attempts = 0;
        const maxAttempts = 100;
        const pollInterval = setInterval(() => {
          attempts++;
          if (checkVueReady()) {
            clearInterval(pollInterval);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            resourcesLoaded = true;
            resourcesLoading = false;
            resolveCallback();
          }
        }, 100);
      };

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalResources) {
          waitForVueAppInit(resolve);
        }
      };

      const script = document.createElement("script");
      script.src = "./weilin/prompt_ui/webjs?v=" + WEILIN_VERSION;
      script.type = "text/javascript";
      script.onload = checkAllLoaded;
      script.onerror = checkAllLoaded;
      document.head.appendChild(script);

      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.type = "text/css";
      style.href = "./weilin/prompt_ui/file/style.css?v=" + WEILIN_VERSION;
      style.onload = checkAllLoaded;
      style.onerror = checkAllLoaded;
      document.head.appendChild(style);
    });
  }

  waitForApp((app) => {
    app.registerExtension({
      name: "weilin.prompt_ui_node",
      async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "WeiLinPromptUI") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = async function () {
          const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

          const thisNodeSeed = generateUUID();
          const nodeTextAreaMap = {};
          const nodeWidgetMap = {};

          if (this.widgets) {
            hideWidgetForGood(this, this.widgets.find((w) => w.name === "opt_text"));
            hideWidgetForGood(this, this.widgets.find((w) => w.name === "random_template"));
          }

          for (const widgetItem of this.widgets || []) {
            if (widgetItem.name === "positive") {
              nodeTextAreaMap.positive = widgetItem.element;
              nodeWidgetMap.positive = widgetItem;
            } else if (widgetItem.name === "random_template") {
              nodeTextAreaMap.random_template = widgetItem.element;
              nodeWidgetMap.random_template = widgetItem;
              if (widgetItem.element) widgetItem.element.readOnly = true;
            }
          }

          const positiveEl = nodeTextAreaMap.positive;
          if (positiveEl) {
            globalNodeList.push({ seed: thisNodeSeed, text: positiveEl.value, id: this.id });
            positiveEl.addEventListener("input", (event) => {
              updateNodeTextBySeed(thisNodeSeed, event.target.value);
              window.parent.postMessage(
                { type: "weilin_prompt_ui_update_node_list_info", nodeList: globalNodeList },
                "*",
              );
            });
          }

          let currentThisId = this.id;
          Object.defineProperty(this, "id", {
            get() {
              return currentThisId;
            },
            set(newValue) {
              currentThisId = newValue;
              updateNodeIdBySeed(thisNodeSeed, newValue);
              window.parent.postMessage(
                { type: "weilin_prompt_ui_update_node_list_info", nodeList: globalNodeList },
                "*",
              );
            },
            enumerable: true,
            configurable: true,
          });

          let currentTitle = this.title;
          Object.defineProperty(this, "title", {
            get() {
              return currentTitle;
            },
            set(newValue) {
              currentTitle = newValue;
              updateNodeTitleBySeed(thisNodeSeed, newValue);
              window.parent.postMessage(
                { type: "weilin_prompt_ui_update_node_list_info", nodeList: globalNodeList },
                "*",
              );
            },
            enumerable: true,
            configurable: true,
          });

          let promptBoxRandomID = generateUUID();
          const messageHandler = (event) => {
            if (!event?.data?.type) return;

            if (event.data.type === "weilin_prompt_ui_prompt_update_prompt_" + promptBoxRandomID) {
              const jsonResponse = JSON.parse(event.data.data);
              if (nodeTextAreaMap.positive) nodeTextAreaMap.positive.value = jsonResponse.prompt || "";
              if (nodeWidgetMap.positive) nodeWidgetMap.positive.value = jsonResponse.prompt || "";

              updateNodeTextBySeed(thisNodeSeed, jsonResponse.prompt || "");
              window.parent.postMessage(
                { type: "weilin_prompt_ui_update_node_list_info", nodeList: globalNodeList },
                "*",
              );
            } else if (event.data.type === "weilin_prompt_ui_prompt_get_node_list_info") {
              updateNodeTextBySeed(thisNodeSeed, nodeTextAreaMap.positive?.value || "");
              window.parent.postMessage(
                { type: "weilin_prompt_ui_update_node_list_info", nodeList: globalNodeList },
                "*",
              );
            } else if (
              event.data.type === "weilin_prompt_ui_prompt_open_node_wit_seed" &&
              event.data.seed === thisNodeSeed
            ) {
              loadResourcesOnDemand().then(() => {
                promptBoxRandomID = generateUUID();
                const data = JSON.stringify({
                  prompt: nodeTextAreaMap.positive?.value || "",
                  temp_prompt: [],
                });
                window.parent.postMessage(
                  {
                    type: "weilin_prompt_ui_openPromptBox",
                    id: promptBoxRandomID,
                    prompt: data,
                    node: nodeData.name,
                  },
                  "*",
                );
              });
            } else if (event.data.type === "weilin_prompt_ui_update_template_" + promptBoxRandomID) {
              if (nodeTextAreaMap.random_template) {
                nodeTextAreaMap.random_template.value = event.data.data || "";
              }
              if (nodeWidgetMap.random_template) {
                nodeWidgetMap.random_template.value = event.data.data || "";
              }
            } else if (event.data.type === "weilin_prompt_ui_get_template_" + promptBoxRandomID) {
              window.parent.postMessage(
                {
                  type: "weilin_prompt_ui_get_template_response",
                  id: promptBoxRandomID,
                  data: nodeTextAreaMap.random_template?.value || "",
                },
                "*",
              );
            } else if (
              event.data.type === "weilin_prompt_ui_get_template_go_random_" + promptBoxRandomID
            ) {
              window.parent.postMessage(
                {
                  type: "weilin_prompt_ui_get_template_go_random_response",
                  id: promptBoxRandomID,
                  data: nodeTextAreaMap.random_template?.value || "",
                },
                "*",
              );
            }
          };

          window.addEventListener("message", messageHandler, false);

          this.addWidget("button", localLanguage, "", async () => {
            await loadResourcesOnDemand();
            promptBoxRandomID = generateUUID();
            const data = JSON.stringify({
              prompt: nodeTextAreaMap.positive?.value || "",
              temp_prompt: [],
            });
            window.parent.postMessage(
              {
                type: "weilin_prompt_ui_openPromptBox",
                id: promptBoxRandomID,
                prompt: data,
                node: nodeData.name,
              },
              "*",
            );
          });

          const originalOnRemoved = this.onRemoved;
          this.onRemoved = () => {
            if (originalOnRemoved) originalOnRemoved.apply(this);
            window.removeEventListener("message", messageHandler, false);
            removeNodeBySeed(thisNodeSeed);
            window.parent.postMessage(
              { type: "weilin_prompt_ui_update_node_list_info", nodeList: globalNodeList },
              "*",
            );
          };

          return r;
        };

        const onExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function (message) {
          onExecuted?.apply(this, arguments);
          const positiveWidget = this.widgets.find((w) => w.name === "positive");
          if (positiveWidget && message.positive) {
            positiveWidget.element.value = message.positive;
            const event = new Event("input", { bubbles: true });
            positiveWidget.element.dispatchEvent(event);
          }
        };
      },
    });
  });
}

// from melmass
// https://github.com/kijai/ComfyUI-KJNodes/blob/main/web/js/spline_editor.js
function hideWidgetForGood(node, widget, suffix = "") {
  if (!widget) return;

  const hiddenStringWidgetNames = new Set(["opt_text", "random_template"]);
  if (hiddenStringWidgetNames.has(widget.name)) {
    const normalized =
      typeof widget.value === "string"
        ? widget.value
        : typeof widget.element?.value === "string"
          ? widget.element.value
          : "";
    widget.value = normalized;
    if (widget.element) widget.element.value = normalized;
  }

  widget.origType = widget.type;
  widget.origComputeSize = widget.computeSize;
  widget.origSerializeValue = widget.serializeValue;
  widget.computeSize = () => [0, -4];
  widget.type = "converted-widget" + suffix;
  if (widget.element) {
    widget.element.setAttribute("id", "weilin-hidden-weight");
    widget.element.style.display = "none";
  }
  widget.serializeValue = () => {
    const rawValue = widget.value ?? widget.element?.value;
    if (hiddenStringWidgetNames.has(widget.name)) {
      return typeof rawValue === "string" ? rawValue : "";
    }
    return rawValue;
  };

  if (widget.linkedWidgets) {
    for (const w of widget.linkedWidgets) {
      hideWidgetForGood(node, w, ":" + widget.name);
    }
  }
}

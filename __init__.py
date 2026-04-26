# 导入后端服务路由（导入即注册）
from .app.server import prompt_server as _prompt_server  # noqa: F401
from .app.nodes import WeiLinPromptUI
from .app.utils.node_locale_utils import NodeLocaleUtils

# A dictionary that contains all nodes you want to export with their names
# NOTE: names should be globally unique
NODE_CLASS_MAPPINGS = {
    "WeiLinPromptUI": WeiLinPromptUI,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = NodeLocaleUtils.get_node_display_name_mappings()

WEB_DIRECTORY = "./js_node"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

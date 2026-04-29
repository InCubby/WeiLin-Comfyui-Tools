import os

import nodes

# ComfyUI 2.0兼容性：使用nodes.EXTENSION_WEB_DIRS注册JavaScript目录
# 必须在其他导入之前设置
custom_node_dir = os.path.dirname(os.path.realpath(__file__))
js_dir = os.path.join(custom_node_dir, "js_node")
nodes.EXTENSION_WEB_DIRS["weilin-comfyui-tools"] = js_dir


# Server Init
from .install_request import *

install_requirements()


import json
import locale
import shutil

from .app.server.prompt_server import *

# 检测系统语言
localLan = locale.getdefaultlocale()[0]
placeholder_text = ""
retrun_name_text = ""
retrun_type_text = ""
node_name_text = ""
node_model_text = ""
placeholder_node_text = ""
if localLan == "zh_CN":
    placeholder_text = "输入提示词"
    placeholder_node_text = "输入节点命名"
    retrun_name_text = "条件"
    retrun_type_text = "条件"
    node_name_text = "WeiLin-Tools-节点工具"
    node_model_text = "模型"
else:
    placeholder_text = "input prompt words"
    retrun_name_text = "CONDITIONING"
    retrun_type_text = "CONDITIONING"
    node_name_text = "WeiLin Node Tools"
    node_model_text = "MODEL"
    placeholder_node_text = "input node name"


def is_json(myjson):
    try:
        json.loads(myjson)
    except ValueError:
        return False
    return True


def validate_conditioning_output(conditioning_data):
    """
    验证CONDITIONING输出格式是否正确。
    CONDITIONING应该是 [[cond_tensor, dict]] 或 None 的格式。
    这个函数用于确保输出数据结构正确，防止连接到错误节点时引发问题。

    Args:
        conditioning_data: CONDITIONING输出数据

    Returns:
        bool: True表示格式正确，False表示格式错误
    """
    if conditioning_data is None:
        return True

    # 检查是否是列表格式
    if not isinstance(conditioning_data, list):
        print(
            f"[WARNING] CONDITIONING输出格式错误: 期望list，得到{type(conditioning_data)}"
        )
        return False

    # 检查是否至少有一个元素
    if len(conditioning_data) == 0:
        print("[WARNING] CONDITIONING输出为空列表")
        return True

    # 检查第一个元素是否是 [cond, dict] 格式
    first_item = conditioning_data[0]
    if not isinstance(first_item, list) or len(first_item) < 2:
        print(
            f"[WARNING] CONDITIONING内部格式错误: 期望[cond, dict]，得到{type(first_item)}"
        )
        return False

    return True


class AnyType(str):
    """
    A class representing any type in ComfyUI nodes.
    Used for parameters that can accept any type of input.
    """

    def __ne__(self, __value: object) -> bool:
        return False

    @classmethod
    def INPUT_TYPE(cls):
        return (ANY, {})


ANY = AnyType("*")

# 提示词UI - 不加载Lora


class WeiLinPromptUIWithoutLora:
    def __init__(self):
        pass

    @classmethod
    def IS_CHANGED(self, auto_random, **kwargs):
        if auto_random:
            return float("nan")

    @classmethod
    def INPUT_TYPES(self):
        return {
            "required": {
                "positive": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": placeholder_text,
                    },
                ),
                "auto_random": ("BOOLEAN", {"default": False}),
            },
            "optional": {
                "temp_str": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "temp prompt words",
                    },
                ),
                "random_template": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "random template path name",
                    },
                ),
                "opt_text": (ANY, {"default": ""}),
                "opt_clip": ("CLIP",),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    RETURN_TYPES = (
        "STRING",
        "CONDITIONING",
        "CLIP",
    )
    RETURN_NAMES = (
        "STRING",
        "CONDITIONING",
        "CLIP",
    )
    FUNCTION = "encode"
    OUTPUT_NODE = True

    CATEGORY = node_name_text

    def encode(
        self,
        positive="",
        auto_random=False,
        temp_str="",
        random_template="",
        opt_text="",
        opt_clip=None,
        unique_id=None,
        extra_pnginfo=None,
    ):
        text_dec = ""
        if is_json(positive):
            json_object = json.loads(positive)
            if len(opt_text) > 0:
                text_dec = opt_text + ", " + json_object.get("prompt", "")
            else:
                text_dec = json_object.get("prompt", "")
        else:
            if len(opt_text) > 0:
                text_dec = opt_text + ", " + positive
            else:
                text_dec = positive

        if auto_random:
            if len(random_template) > 0:
                # 随机Tag获取
                random_tag = go_run_node_auto_random_tag(random_template)
                if len(random_tag["random_tags"]) > 0:
                    positive = random_tag["random_tags"]
                    if len(opt_text) > 0:
                        text_dec = opt_text + ", " + positive
                    else:
                        text_dec = positive

        if opt_clip is not None:
            try:
                tokens = opt_clip.tokenize(text_dec)
                conditioning_output = opt_clip.encode_from_tokens_scheduled(tokens)

                # 验证CONDITIONING输出格式
                if not validate_conditioning_output(conditioning_output):
                    print("[ERROR] CONDITIONING输出格式验证失败，返回None")
                    conditioning_output = None

                if auto_random:
                    return {
                        "ui": {"positive": [str(positive)]},
                        "result": (
                            text_dec,
                            conditioning_output,
                            opt_clip,
                        ),
                    }
                return (
                    text_dec,
                    conditioning_output,
                    opt_clip,
                )
            except Exception as e:
                print(f"[ERROR] CONDITIONING编码失败: {e}")
                if auto_random:
                    return {
                        "ui": {"positive": [str(positive)]},
                        "result": (
                            text_dec,
                            None,
                            opt_clip,
                        ),
                    }
                return (
                    text_dec,
                    None,
                    opt_clip,
                )
        if auto_random:
            return {
                "ui": {"positive": [str(positive)]},
                "result": (
                    text_dec,
                    None,
                    opt_clip,
                ),
            }
        return (
            text_dec,
            None,
            opt_clip,
        )

def copy_folder(source_folder, destination_folder):
    if not os.path.exists(destination_folder):
        os.makedirs(destination_folder)

    for item in os.listdir(source_folder):
        source = os.path.join(source_folder, item)
        destination = os.path.join(destination_folder, item)

        if os.path.isdir(source):
            copy_folder(source, destination)
        else:
            shutil.copy2(source, destination)


# A dictionary that contains all nodes you want to export with their names
# NOTE: names should be globally unique
NODE_CLASS_MAPPINGS = {
    "WeiLinPromptUIWithoutLora": WeiLinPromptUIWithoutLora,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {}

if localLan == "zh_CN":
    NODE_DISPLAY_NAME_MAPPINGS = {
        "WeiLinPromptUIWithoutLora": "WeiLin 提示词编辑器",
    }
else:
    NODE_DISPLAY_NAME_MAPPINGS = {
        "WeiLinPromptUIWithoutLora": "WeiLin Prompt Editor",
    }

WEB_DIRECTORY = "./js_node"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

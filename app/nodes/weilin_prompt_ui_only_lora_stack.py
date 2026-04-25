import json

from ..utils.lora_stack_utils import LoraStackUtils
from ..utils.node_locale_utils import NodeLocaleUtils

NODE_TEXTS = NodeLocaleUtils.get_node_texts()


class WeiLinPromptUIOnlyLoraStack:
    def __init__(self):
        self.loaded_loraA = None

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "clip": ("CLIP",),
                "model": ("MODEL",),
            },
            "optional": {
                "lora_str": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": NODE_TEXTS["placeholder_lora_text"],
                    },
                ),
            },
        }

    RETURN_TYPES = (
        "CLIP",
        "MODEL",
    )
    RETURN_NAMES = (
        "CLIP",
        "MODEL",
    )
    FUNCTION = "load_lora_ing"
    CATEGORY = NODE_TEXTS["node_category"]

    def load_lora_ing(self, clip=None, model=None, lora_str="", **kwargs):
        # 协调LoRA列表解析与模型/文本编码器叠加。
        if model is None or not lora_str:
            print("Lora堆没有可用的Lora信息")
            return clip, model

        lora_list = json.loads(lora_str)
        model_lora, clip_lora, self.loaded_loraA, _ = LoraStackUtils.apply_lora_list(
            model=model,
            clip=clip,
            lora_list=lora_list,
            loaded_lora_cache=self.loaded_loraA,
            collect_trigger_words=False,
        )
        return clip_lora, model_lora

import json

from ..server.prompt_server import go_run_node_auto_random_tag
from ..utils.conditioning_utils import ConditioningUtils
from ..utils.lora_stack_utils import LoraStackUtils
from ..utils.node_locale_utils import NodeLocaleUtils
from ..utils.prompt_text_utils import PromptTextUtils

NODE_TEXTS = NodeLocaleUtils.get_node_texts()


class WeiLinPromptUI:
    def __init__(self):
        self.loaded_loraA = None

    @classmethod
    def IS_CHANGED(cls, auto_random, **kwargs):
        if auto_random:
            return float("nan")
        return False

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "positive": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": NODE_TEXTS["placeholder_text"],
                    },
                ),
                "auto_random": ("BOOLEAN", {"default": False}),
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
                "random_template": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "random template path name",
                    },
                ),
                "opt_text": ("STRING", {"default": ""}),
                "opt_clip": ("CLIP",),
                "opt_model": ("MODEL",),
            },
        }

    RETURN_TYPES = (
        "STRING",
        "CONDITIONING",
        "CLIP",
        "MODEL",
    )
    RETURN_NAMES = (
        "STRING",
        "CONDITIONING",
        "CLIP",
        "MODEL",
    )
    FUNCTION = "load_lora_ing"
    OUTPUT_NODE = True
    CATEGORY = NODE_TEXTS["node_category"]

    def load_lora_ing(
        self,
        positive="",
        auto_random=False,
        lora_str="",
        random_template="",
        opt_text="",
        opt_clip=None,
        opt_model=None,
        **kwargs,
    ):
        # 协调提示词解析、LoRA叠加与CONDITIONING编码。
        text_dec, lora_list = PromptTextUtils.compose_text_and_lora_from_positive(
            positive, opt_text
        )
        if lora_str:
            lora_list = json.loads(lora_str)

        positive, text_dec = PromptTextUtils.apply_auto_random_prompt(
            auto_random=auto_random,
            random_template=random_template,
            opt_text=opt_text,
            positive=positive,
            text_dec=text_dec,
            random_tag_runner=go_run_node_auto_random_tag,
        )

        text_dec, inline_loras = PromptTextUtils.extract_inline_wlr_loras(text_dec)
        lora_list = PromptTextUtils.merge_lora_lists(lora_list, inline_loras)

        model_lora = opt_model
        clip_lora = opt_clip
        if opt_model is not None and lora_list:
            model_lora, clip_lora, self.loaded_loraA, trigger_words = (
                LoraStackUtils.apply_lora_list(
                    model=model_lora,
                    clip=clip_lora,
                    lora_list=lora_list,
                    loaded_lora_cache=self.loaded_loraA,
                    collect_trigger_words=True,
                )
            )
            if trigger_words:
                text_dec = f"{', '.join(trigger_words)}, {text_dec}"
                print(f"添加触发词到提示词开头: {', '.join(trigger_words)}, ")

        conditioning_output = ConditioningUtils.encode_conditioning_with_clip(
            clip_lora, text_dec, use_dict=True
        )

        result = (
            text_dec,
            conditioning_output,
            clip_lora,
            model_lora,
        )

        if auto_random:
            return {
                "ui": {"positive": [str(positive)]},
                "result": result,
            }
        return result

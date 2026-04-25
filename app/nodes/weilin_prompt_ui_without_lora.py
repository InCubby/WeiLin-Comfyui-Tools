from ..server.prompt_server import go_run_node_auto_random_tag
from ..utils.conditioning_utils import ConditioningUtils
from ..utils.node_locale_utils import NodeLocaleUtils
from ..utils.prompt_text_utils import PromptTextUtils

NODE_TEXTS = NodeLocaleUtils.get_node_texts()


class WeiLinPromptUIWithoutLora:
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
                "opt_text": ("STRING", {"default": "", "forceInput": True}),
                "random_template": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "random template path name",
                    },
                ),
                "opt_clip": ("CLIP",),
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
    CATEGORY = NODE_TEXTS["node_category"]

    def encode(
        self,
        positive="",
        auto_random=False,
        random_template="",
        opt_text="",
        opt_clip=None,
        **kwargs,
    ):
        # 协调提示词解析、随机模板与CONDITIONING编码。
        text_dec, _ = PromptTextUtils.compose_text_and_lora_from_positive(
            positive, opt_text
        )
        positive, text_dec = PromptTextUtils.apply_auto_random_prompt(
            auto_random=auto_random,
            random_template=random_template,
            opt_text=opt_text,
            positive=positive,
            text_dec=text_dec,
            random_tag_runner=go_run_node_auto_random_tag,
        )

        conditioning_output = ConditioningUtils.encode_conditioning_with_clip(
            opt_clip, text_dec, use_dict=False
        )

        result = (
            text_dec,
            conditioning_output,
            opt_clip,
        )

        if auto_random:
            return {
                "ui": {"positive": [str(positive)]},
                "result": result,
            }
        return result

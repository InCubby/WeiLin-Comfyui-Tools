from ..server.prompt_server import go_run_node_auto_random_tag
from ..utils.conditioning_utils import ConditioningUtils
from ..utils.node_locale_utils import NodeLocaleUtils
from ..utils.prompt_text_utils import PromptTextUtils

NODE_TEXTS = NodeLocaleUtils.get_node_texts()


class WeiLinPromptUI:
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
        opt_model=None,
        **kwargs,
    ):
        text_dec = PromptTextUtils.compose_prompt_text_from_positive(positive, opt_text)
        positive, text_dec = PromptTextUtils.apply_auto_random_prompt(
            auto_random=auto_random,
            random_template=random_template,
            opt_text=opt_text,
            positive=positive,
            text_dec=text_dec,
            random_tag_runner=go_run_node_auto_random_tag,
        )

        conditioning_output = ConditioningUtils.encode_conditioning_with_clip(
            opt_clip, text_dec, use_dict=True
        )

        result = (
            text_dec,
            conditioning_output,
            opt_clip,
            opt_model,
        )

        if auto_random:
            return {
                "ui": {"positive": [str(positive)]},
                "result": result,
            }
        return result

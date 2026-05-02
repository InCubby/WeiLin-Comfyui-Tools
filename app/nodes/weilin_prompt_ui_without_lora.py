import json

class WeiLinPromptUIWithoutLora:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(self):
        return {
            "required": {
                "positive": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "Input prompt words.",
                    },
                ),
            },
            "optional": {
                "temp_str": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "Temp prompt words.",
                    },
                ),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("STRING",)
    FUNCTION = "encode"
    OUTPUT_NODE = True
    CATEGORY = "WeiLin Node Tools"

    def encode(
        self,
        positive="",
        temp_str="",
        unique_id=None,
        extra_pnginfo=None,
        **kwargs,
    ):
        try:
            json_object = json.loads(positive)
            text_dec = json_object.get("prompt", "")
        except Exception:
            text_dec = positive
        return (text_dec,)

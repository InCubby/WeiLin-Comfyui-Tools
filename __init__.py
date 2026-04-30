from .app.nodes.weilin_prompt_ui_without_lora import WeiLinPromptUIWithoutLora

NODE_CLASS_MAPPINGS = {
    "WeiLinPromptUIWithoutLora": WeiLinPromptUIWithoutLora,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "WeiLinPromptUIWithoutLora": "WeiLin Prompt Editor",
}
WEB_DIRECTORY = "./scripts"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

import locale


class NodeLocaleUtils:
    """Provide locale-specific node text and display name mappings."""

    @staticmethod
    def get_node_texts():
        language = locale.getdefaultlocale()[0] or "en_US"
        if language == "zh_CN":
            return {
                "placeholder_text": "输入提示词",
                "placeholder_lora_text": "Lora信息框",
                "placeholder_node_text": "输入节点命名",
                "return_name_text": "条件",
                "return_type_text": "条件",
                "node_category": "WeiLin-Tools-节点工具",
                "node_model_text": "模型",
            }

        return {
            "placeholder_text": "input prompt words",
            "placeholder_lora_text": "Lora info box",
            "placeholder_node_text": "input node name",
            "return_name_text": "CONDITIONING",
            "return_type_text": "CONDITIONING",
            "node_category": "WeiLin Node Tools",
            "node_model_text": "MODEL",
        }

    @staticmethod
    def get_node_display_name_mappings():
        language = locale.getdefaultlocale()[0] or "en_US"
        if language == "zh_CN":
            return {
                "WeiLinPromptUI": "WeiLin 全能提示词编辑器",
                "WeiLinPromptUIWithoutLora": "WeiLin 提示词编辑器",
                "WeiLinPromptUIOnlyLoraStack": "WeiLin Lora堆",
            }

        return {
            "WeiLinPromptUI": "All-Round WeiLin Prompt Editor",
            "WeiLinPromptUIWithoutLora": "WeiLin Prompt Editor",
            "WeiLinPromptUIOnlyLoraStack": "WeiLin Lora Stack",
        }

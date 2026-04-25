class ConditioningUtils:
    """Utility helpers for CONDITIONING output validation and encoding."""

    @staticmethod
    def validate_conditioning_output(conditioning_data):
        if conditioning_data is None:
            return True

        if not isinstance(conditioning_data, list):
            print(
                f"[WARNING] CONDITIONING输出格式错误: 期望list，得到{type(conditioning_data)}"
            )
            return False

        if len(conditioning_data) == 0:
            print("[WARNING] CONDITIONING输出为空列表")
            return True

        first_item = conditioning_data[0]
        if not isinstance(first_item, list) or len(first_item) < 2:
            print(
                f"[WARNING] CONDITIONING内部格式错误: 期望[cond, dict]，得到{type(first_item)}"
            )
            return False

        return True

    @staticmethod
    def encode_conditioning_with_clip(clip, text_dec, use_dict=False):
        if clip is None:
            return None

        try:
            tokens = clip.tokenize(text_dec)
            if use_dict:
                output = clip.encode_from_tokens(
                    tokens, return_pooled=True, return_dict=True
                )
                cond = output.pop("cond")
                conditioning_output = [[cond, output]]
            else:
                conditioning_output = clip.encode_from_tokens_scheduled(tokens)

            if not ConditioningUtils.validate_conditioning_output(conditioning_output):
                print("[ERROR] CONDITIONING输出格式验证失败，返回None")
                return None

            return conditioning_output
        except Exception as e:
            print(f"[ERROR] CONDITIONING编码失败: {e}")
            return None

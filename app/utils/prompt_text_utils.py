import json
import re


class PromptTextUtils:
    """Utility helpers for prompt text parsing, cleanup, and merge behavior."""

    @staticmethod
    def compose_text_and_lora_from_positive(positive, opt_text=""):
        if opt_text is None:
            opt_text = ""
        elif not isinstance(opt_text, str):
            opt_text = ""

        try:
            json_object = json.loads(positive)
        except ValueError:
            return f"{opt_text}, {positive}" if len(opt_text) > 0 else positive, None
        else:
            lora_list = json_object.get("lora", None)
            prompt = json_object.get("prompt", "")
            text_dec = f"{opt_text}, {prompt}" if len(opt_text) > 0 else prompt

        return text_dec, lora_list

    @staticmethod
    def apply_auto_random_prompt(
        auto_random,
        random_template,
        opt_text,
        positive,
        text_dec,
        random_tag_runner,
    ):
        if auto_random and len(random_template) > 0:
            random_tag = random_tag_runner(random_template)
            if isinstance(random_tag, dict):
                random_tags = random_tag.get("random_tags", "")
                if len(random_tags) > 0:
                    positive = random_tags
                    text_dec = f"{opt_text}, {positive}" if len(opt_text) > 0 else positive
        return positive, text_dec

    @staticmethod
    def extract_inline_wlr_loras(text_dec):
        # 新格式(4参数): <wlr:name:model_weight:clip_weight:trigger_weight>
        wlr_pattern_new = r"<wlr:([^:]+):([^:]+):([^:]+):([^>]+)>"
        # 旧格式(3参数): <wlr:name:model_weight:clip_weight>
        wlr_pattern_old = r"<wlr:([^:]+):([^:]+):([^:>]+)>"

        wlr_matches_new = re.findall(wlr_pattern_new, text_dec)
        text_dec_without_new = re.sub(wlr_pattern_new, "", text_dec)
        wlr_matches_old = re.findall(wlr_pattern_old, text_dec_without_new)

        if not (wlr_matches_new or wlr_matches_old):
            return text_dec, []

        extracted_loras = []
        for lora_path, model_weight, text_weight, trigger_weight in wlr_matches_new:
            extracted_loras.append(
                {
                    "lora": lora_path.strip() + ".safetensors",
                    "weight": float(model_weight.strip()),
                    "text_encoder_weight": float(text_weight.strip()),
                    "trigger_weight": float(trigger_weight.strip()),
                }
            )

        for lora_path, model_weight, text_weight in wlr_matches_old:
            extracted_loras.append(
                {
                    "lora": lora_path.strip() + ".safetensors",
                    "weight": float(model_weight.strip()),
                    "text_encoder_weight": float(text_weight.strip()),
                    "trigger_weight": float(text_weight.strip()),
                }
            )

        clean_text = re.sub(wlr_pattern_new, "", text_dec)
        clean_text = re.sub(wlr_pattern_old, "", clean_text)
        clean_text = re.sub(r",\s*,", ",", clean_text)
        clean_text = clean_text.strip().strip(",").strip()

        return clean_text, extracted_loras

    @staticmethod
    def merge_lora_lists(base_loras, additional_loras):
        if not additional_loras:
            return base_loras

        if base_loras is None:
            return list(additional_loras)

        existing_lora_names = {
            item["lora"].replace(".safetensors", "") for item in base_loras
        }
        for extracted in additional_loras:
            extracted_name = extracted["lora"].replace(".safetensors", "")
            if extracted_name not in existing_lora_names:
                base_loras.append(extracted)

        return base_loras

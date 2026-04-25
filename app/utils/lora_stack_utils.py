import json
import logging
import os
import re

import comfy.lora
import comfy.utils
import folder_paths


class LoraStackUtils:
    """Utility helpers for LoRA parsing, loading, and model/clip patching."""

    @staticmethod
    def get_lora_trigger_words(lora_path, lora_name, force_fetch_civitai=False):
        try:
            from ..server.prompt_api.trigger_words import get_first_trigger_word

            result = get_first_trigger_word(lora_path, lora_name, force_fetch_civitai)
            print(f"[DEBUG] get_first_trigger_word返回: {result}")
            return result
        except ImportError as e:
            print(f"[TriggerWords] 导入模块失败，使用回退逻辑: {e}")
            return LoraStackUtils._get_lora_trigger_words_fallback(lora_path, lora_name)

    @staticmethod
    def _get_lora_trigger_words_fallback(lora_path, lora_name):
        trigger_words = ""

        try:
            if lora_path.endswith(".safetensors"):
                with open(lora_path, "rb") as file:
                    header_size = int.from_bytes(file.read(8), "little", signed=False)
                    if header_size > 0:
                        header = file.read(header_size)
                        header_json = json.loads(header)
                        metadata = header_json.get("__metadata__", {})

                        if "ss_tag_frequency" in metadata:
                            tag_freq = metadata["ss_tag_frequency"]
                            if isinstance(tag_freq, dict):
                                for bucket_value in tag_freq.values():
                                    if isinstance(bucket_value, dict):
                                        for tag, _ in bucket_value.items():
                                            if tag and tag.strip():
                                                trigger_words = tag.strip()
                                                print(
                                                    f"从元数据获取触发词(ss_tag_frequency): {trigger_words}"
                                                )
                                                return trigger_words

                        if "ss_output_name" in metadata:
                            output_name = metadata["ss_output_name"]
                            if output_name and output_name.strip():
                                trigger_words = output_name.strip()
                                trigger_words = re.sub(
                                    r"[-_]v?[0-9]+$", "", trigger_words
                                )
                                print(
                                    f"从元数据获取触发词(ss_output_name): {trigger_words}"
                                )
                                return trigger_words

        except Exception as e:
            print(f"读取LoRA元数据失败: {e}")

        if lora_name and lora_name.strip():
            trigger_words = lora_name.strip()
            trigger_words = re.sub(r"[-_]v?[0-9]+$", "", trigger_words)
            print(f"使用LoRA名称作为触发词: {trigger_words}")

        return trigger_words

    @staticmethod
    def apply_lora_list(
        model,
        clip,
        lora_list,
        loaded_lora_cache=None,
        collect_trigger_words=False,
    ):
        model_lora = model
        clip_lora = clip
        cache = loaded_lora_cache
        trigger_words = []

        for lora_item in lora_list:
            strength_model = float(lora_item["weight"])
            strength_clip = float(lora_item["text_encoder_weight"])
            trigger_weight = float(lora_item.get("trigger_weight", strength_clip))

            print(
                "模型权重strength_model：",
                strength_model,
                "CLIP权重strength_clip：",
                strength_clip,
                "触发词权重trigger_weight：",
                trigger_weight,
            )

            lora_path = folder_paths.get_full_path("loras", lora_item["lora"])
            if lora_path is None:
                raise ValueError(f"无法找到Lora文件: {lora_item['lora']}")
            print("加载Lora lora_path:", lora_path)

            if collect_trigger_words:
                lora_name = os.path.splitext(lora_item["lora"])[0]
                trigger_word = LoraStackUtils.get_lora_trigger_words(lora_path, lora_name)
                print(
                    f"触发词: {trigger_word if trigger_word else '无'} "
                    f"(len={len(trigger_word) if trigger_word else 0})"
                )
                if trigger_word:
                    trigger_words.append(f"{trigger_word}:{trigger_weight}")

            if cache is not None and cache[0] == lora_path:
                lora = cache[1]
            else:
                cache = None
                lora = comfy.utils.load_torch_file(lora_path, safe_load=True)
                cache = (lora_path, lora)

            key_map = {}
            if model_lora is not None:
                key_map = comfy.lora.model_lora_keys_unet(model_lora.model, key_map)
            if clip_lora is not None:
                key_map = comfy.lora.model_lora_keys_clip(
                    clip_lora.cond_stage_model, key_map
                )

            loaded = comfy.lora.load_lora(lora, key_map)
            if model_lora is not None:
                new_modelpatcher = model_lora.clone()
                model_keys = new_modelpatcher.add_patches(loaded, strength_model)
            else:
                model_keys = ()
                new_modelpatcher = None

            if clip_lora is not None:
                new_clip = clip_lora.clone()
                clip_keys = new_clip.add_patches(loaded, strength_clip)
            else:
                clip_keys = ()
                new_clip = None

            model_keys = set(model_keys)
            clip_keys = set(clip_keys)
            for patch_key in loaded:
                if (patch_key not in model_keys) and (patch_key not in clip_keys):
                    logging.warning(f"NOT LOADED {patch_key}")

            model_lora, clip_lora = new_modelpatcher, new_clip

        return model_lora, clip_lora, cache, trigger_words

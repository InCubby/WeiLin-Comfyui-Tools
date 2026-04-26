import json


class PromptTextUtils:
    """Utility helpers for prompt text parsing and random-template behavior."""

    @staticmethod
    def compose_prompt_text_from_positive(positive, opt_text=""):
        if opt_text is None or not isinstance(opt_text, str):
            opt_text = ""

        prompt = positive
        try:
            json_object = json.loads(positive)
            if isinstance(json_object, dict):
                prompt = json_object.get("prompt", "")
        except ValueError:
            pass

        return f"{opt_text}, {prompt}" if len(opt_text) > 0 else prompt

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

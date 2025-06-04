import logging
import requests

class HuggingFaceClient:
    def __init__(self, api_key):
        self.api_key = api_key
        logging.info('HuggingFaceClient initialized.')

    def generate_response(self, prompt: str, model: str = 'gpt2') -> str:
        url = f"https://api-inference.huggingface.co/models/{model}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {"inputs": prompt}
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, list) and data and 'generated_text' in data[0]:
                return data[0]['generated_text']
            elif isinstance(data, dict) and 'error' in data:
                return f"[HuggingFace error: {data['error']}]"
            else:
                return str(data)
        except Exception as e:
            return f"[HuggingFace API error: {e}]"

    # TODO: Add methods for running models, etc. 
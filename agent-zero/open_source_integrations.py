import os
import logging
import requests
import tempfile
import subprocess
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Any
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import google.generativeai as genai
from huggingface_hub import HfApi, hf_hub_download

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenSourceIntegrations:
    def __init__(self, config_path: str = "ai_config.yaml"):
        self.config = self._load_config(config_path)
        self.hf_api = HfApi(token=os.getenv('HF_TOKEN'))
        self._initialize_models()
        
    def _load_config(self, config_path: str) -> dict:
        """Load configuration from YAML file."""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            return {}

    def _initialize_models(self):
        """Initialize AI models."""
        try:
            # Initialize Gemini
            genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            
            # Initialize Hugging Face models
            self.text_model = pipeline(
                'text-generation',
                model='mistralai/Mistral-7B-Instruct-v0.2',
                device_map='auto'
            )
            
            self.code_model = pipeline(
                'text-generation',
                model='codellama/CodeLlama-34b-Instruct-hf',
                device_map='auto'
            )
            
            logger.info("Successfully initialized AI models")
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise

    def search_github(self, query: str, language: str = "python") -> List[Dict[str, Any]]:
        """Search GitHub repositories."""
        try:
            headers = {"Authorization": f"token {os.getenv('GITHUB_TOKEN')}"}
            params = {
                "q": f"{query} language:{language}",
                "sort": "stars",
                "order": "desc"
            }
            
            response = requests.get(
                "https://api.github.com/search/repositories",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            
            results = response.json()["items"]
            return [{
                "name": repo["full_name"],
                "description": repo["description"],
                "stars": repo["stargazers_count"],
                "language": repo["language"],
                "url": repo["html_url"]
            } for repo in results[:5]]
            
        except Exception as e:
            logger.error(f"GitHub search failed: {e}")
            return []

    def search_huggingface(self, query: str, task: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search Hugging Face models."""
        try:
            models = self.hf_api.list_models(
                search=query,
                task=task,
                sort="downloads",
                direction=-1
            )
            
            return [{
                "id": model.id,
                "pipeline_tag": model.pipeline_tag,
                "downloads": model.downloads,
                "likes": model.likes,
                "url": f"https://huggingface.co/{model.id}"
            } for model in models[:5]]
            
        except Exception as e:
            logger.error(f"Hugging Face search failed: {e}")
            return []

    def download_model(self, model_id: str, target_dir: Optional[Path] = None) -> bool:
        """Download a Hugging Face model."""
        try:
            if not target_dir:
                target_dir = Path("cache/models") / model_id.replace("/", "_")
            
            # Download model files
            hf_hub_download(
                repo_id=model_id,
                filename="config.json",
                local_dir=target_dir
            )
            hf_hub_download(
                repo_id=model_id,
                filename="pytorch_model.bin",
                local_dir=target_dir
            )
            
            logger.info(f"Successfully downloaded model: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to download model: {e}")
            return False

    def generate_code(self, prompt: str, language: str = "python") -> str:
        """Generate code using CodeLlama."""
        try:
            response = self.code_model(
                f"Write {language} code for: {prompt}",
                max_length=512,
                temperature=0.7,
                num_return_sequences=1
            )
            return response[0]["generated_text"]
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            return ""

    def analyze_code(self, code: str) -> Dict[str, Any]:
        """Analyze code using AI models."""
        try:
            # Use Gemini for code analysis
            response = self.gemini_model.generate_content(
                f"Analyze this code and provide suggestions for improvement:\n\n{code}"
            )
            
            return {
                "analysis": response.text,
                "suggestions": self._extract_suggestions(response.text)
            }
        except Exception as e:
            logger.error(f"Code analysis failed: {e}")
            return {"error": str(e)}

    def _extract_suggestions(self, text: str) -> List[str]:
        """Extract suggestions from analysis text."""
        # Simple extraction - can be improved with better parsing
        suggestions = []
        for line in text.split("\n"):
            if line.strip().startswith("- ") or line.strip().startswith("* "):
                suggestions.append(line.strip()[2:])
        return suggestions

    def get_integration_status(self) -> Dict[str, Any]:
        """Get status of integrations."""
        return {
            "github": {
                "enabled": bool(os.getenv('GITHUB_TOKEN')),
                "cache_size": self._get_dir_size(Path("cache/github"))
            },
            "huggingface": {
                "enabled": bool(os.getenv('HF_TOKEN')),
                "cache_size": self._get_dir_size(Path("cache/models"))
            },
            "gemini": {
                "enabled": bool(os.getenv('GOOGLE_API_KEY')),
                "model": "gemini-pro"
            }
        }

    def _get_dir_size(self, path: Path) -> int:
        """Get directory size in bytes."""
        try:
            return sum(f.stat().st_size for f in path.rglob("*") if f.is_file())
        except Exception:
            return 0

def main():
    # Example usage
    integrations = OpenSourceIntegrations()
    
    # Search GitHub
    results = integrations.search_github("AI agent implementation")
    print("\nGitHub Results:")
    for result in results:
        print(f"\nRepository: {result['name']}")
        print(f"Description: {result['description']}")
        print(f"Stars: {result['stars']}")
        print(f"URL: {result['url']}")
    
    # Search Hugging Face
    models = integrations.search_huggingface("text generation")
    print("\nHugging Face Results:")
    for model in models:
        print(f"\nModel: {model['id']}")
        print(f"Task: {model['pipeline_tag']}")
        print(f"Downloads: {model['downloads']}")
        print(f"URL: {model['url']}")

if __name__ == "__main__":
    main() 
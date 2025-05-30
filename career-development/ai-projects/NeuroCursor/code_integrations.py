import os
import json
import logging
import requests
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import subprocess
import tempfile
import shutil
from env_config import env_config

class CodeIntegrations:
    def __init__(self):
        self.log_dir = env_config.get_path("logs")
        if not self.log_dir:
            raise EnvironmentError("Logs directory not configured")
            
        self.setup_logging()
        
        # Initialize integration settings
        self.settings = {
            "github": {
                "api_url": "https://api.github.com",
                "token": env_config.get_env_var("GITHUB_TOKEN"),
                "cache_dir": env_config.get_path("github_cache")
            },
            "huggingface": {
                "api_url": "https://huggingface.co/api",
                "token": env_config.get_env_var("HF_TOKEN"),
                "cache_dir": env_config.get_path("huggingface_cache")
            }
        }
        
        # Verify environment
        if not env_config.verify_environment():
            raise EnvironmentError("Environment verification failed")
            
        # Verify API tokens
        if not self.settings["github"]["token"]:
            logging.warning("GitHub integration disabled - missing API token")
        if not self.settings["huggingface"]["token"]:
            logging.warning("HuggingFace integration disabled - missing API token")
            
        logging.info("CodeIntegrations initialized successfully")
        
    def setup_logging(self):
        """Set up logging configuration."""
        log_file = self.log_dir / f"code_integrations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        # Remove any existing handlers
        for handler in logging.root.handlers[:]:
            logging.root.removeHandler(handler)
            
        # Create handlers
        self.file_handler = logging.FileHandler(log_file)
        stream_handler = logging.StreamHandler()
        
        # Set format
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        self.file_handler.setFormatter(formatter)
        stream_handler.setFormatter(formatter)
        
        # Add handlers
        logging.root.addHandler(self.file_handler)
        logging.root.addHandler(stream_handler)
        
        # Set level
        logging.root.setLevel(logging.INFO)
        
    def __del__(self):
        """Clean up resources when the object is destroyed."""
        if hasattr(self, 'file_handler'):
            self.file_handler.close()
            logging.root.removeHandler(self.file_handler)
        
    def search_github(self, query: str, language: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search GitHub for code snippets."""
        try:
            headers = {"Authorization": f"token {self.settings['github']['token']}"}
            params = {
                "q": f"{query} language:{language}" if language else query,
                "sort": "stars",
                "order": "desc"
            }
            
            response = requests.get(
                f"{self.settings['github']['api_url']}/search/code",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            
            results = response.json()["items"]
            return [{
                "name": item["name"],
                "path": item["path"],
                "repository": item["repository"]["full_name"],
                "url": item["html_url"],
                "score": item["score"]
            } for item in results]
            
        except Exception as e:
            logging.error(f"GitHub search failed: {e}")
            return []
            
    def fork_github_repo(self, repo: str, target_dir: Optional[Path] = None) -> bool:
        """Fork a GitHub repository."""
        try:
            if not target_dir:
                target_dir = self.settings["github"]["cache_dir"] / repo.split("/")[-1]
                
            # Clone repository
            subprocess.run([
                "git", "clone",
                f"https://github.com/{repo}.git",
                str(target_dir)
            ], check=True)
            
            logging.info(f"Successfully forked repository: {repo}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to fork repository: {e}")
            return False
            
    def search_huggingface(self, query: str, task: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search Hugging Face for models and datasets."""
        try:
            headers = {"Authorization": f"Bearer {self.settings['huggingface']['token']}"}
            params = {
                "search": query,
                "task": task
            }
            
            response = requests.get(
                f"{self.settings['huggingface']['api_url']}/models",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            
            results = response.json()
            return [{
                "id": model["id"],
                "pipeline_tag": model.get("pipeline_tag", ""),
                "downloads": model.get("downloads", 0),
                "likes": model.get("likes", 0),
                "url": f"https://huggingface.co/{model['id']}"
            } for model in results]
            
        except Exception as e:
            logging.error(f"Hugging Face search failed: {e}")
            return []
            
    def download_huggingface_model(self, model_id: str, target_dir: Optional[Path] = None) -> bool:
        """Download a Hugging Face model."""
        try:
            if not target_dir:
                target_dir = self.settings["huggingface"]["cache_dir"] / model_id.replace("/", "_")
                
            # Create temporary directory
            with tempfile.TemporaryDirectory() as temp_dir:
                # Clone repository
                subprocess.run([
                    "git", "clone",
                    f"https://huggingface.co/{model_id}",
                    temp_dir
                ], check=True)
                
                # Copy to target directory
                shutil.copytree(temp_dir, target_dir, dirs_exist_ok=True)
                
            logging.info(f"Successfully downloaded model: {model_id}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to download model: {e}")
            return False
            
    def get_code_suggestions(self, code: str, language: str) -> List[str]:
        """Get code suggestions from GitHub and Hugging Face."""
        try:
            suggestions = []
            
            # Search GitHub for similar code
            github_results = self.search_github(code, language)
            for result in github_results[:3]:  # Top 3 results
                suggestions.append(f"GitHub: {result['url']}")
                
            # Search Hugging Face for relevant models
            hf_results = self.search_huggingface(f"{language} code {code.split()[0]}")  # Use first word as keyword
            for result in hf_results[:2]:  # Top 2 results
                suggestions.append(f"Hugging Face: {result['url']}")
                
            return suggestions
            
        except Exception as e:
            logging.error(f"Failed to get code suggestions: {e}")
            return []
            
    def integrate_code(self, source_url: str, target_path: Path) -> bool:
        """Integrate code from GitHub or Hugging Face."""
        try:
            if "github.com" in source_url:
                # GitHub integration
                repo = "/".join(source_url.split("/")[-2:])
                return self.fork_github_repo(repo, target_path)
                
            elif "huggingface.co" in source_url:
                # Hugging Face integration
                model_id = "/".join(source_url.split("/")[-2:])
                return self.download_huggingface_model(model_id, target_path)
                
            return False
            
        except Exception as e:
            logging.error(f"Failed to integrate code: {e}")
            return False
            
    def get_integration_status(self) -> Dict[str, Any]:
        """Get status of integrations."""
        return {
            "github": {
                "enabled": bool(self.settings["github"]["token"]),
                "cache_size": sum(f.stat().st_size for f in self.settings["github"]["cache_dir"].rglob("*") if f.is_file())
            },
            "huggingface": {
                "enabled": bool(self.settings["huggingface"]["token"]),
                "cache_size": sum(f.stat().st_size for f in self.settings["huggingface"]["cache_dir"].rglob("*") if f.is_file())
            }
        } 
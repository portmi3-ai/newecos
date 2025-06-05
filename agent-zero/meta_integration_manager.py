import os
import logging
import yaml
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import google.generativeai as genai
from transformers import pipeline
from huggingface_hub import HfApi
import requests
from rich.console import Console
from rich.table import Table

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
console = Console()

class MetaIntegrationManager:
    def __init__(self, config_path: str = "ai_config.yaml"):
        self.config = self._load_config(config_path)
        self.hf_api = HfApi(token=os.getenv('HF_TOKEN'))
        self._initialize_models()
        self.integration_history = []
        self.decision_cache = {}
        
    def _load_config(self, config_path: str) -> dict:
        """Load configuration from YAML file."""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            return {}

    def _initialize_models(self):
        """Initialize AI models for decision making."""
        try:
            # Initialize Gemini for high-level decisions
            genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            
            # Initialize Mistral for technical analysis
            self.tech_analyzer = pipeline(
                'text-generation',
                model='mistralai/Mistral-7B-Instruct-v0.2',
                device_map='auto'
            )
            
            logger.info("Successfully initialized AI models")
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise

    def evaluate_integration(self, integration_type: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate whether to integrate a new component."""
        try:
            # Check cache first
            cache_key = f"{integration_type}_{json.dumps(details, sort_keys=True)}"
            if cache_key in self.decision_cache:
                return self.decision_cache[cache_key]

            # Prepare evaluation prompt
            prompt = f"""
            Evaluate this {integration_type} integration:
            Details: {json.dumps(details, indent=2)}
            
            Consider:
            1. Security implications
            2. Performance impact
            3. Maintenance requirements
            4. Compatibility with existing system
            5. Resource usage
            
            Provide a structured evaluation with:
            - Decision (approve/reject)
            - Confidence score (0-1)
            - Key considerations
            - Required actions
            """

            # Get AI evaluation
            response = self.gemini_model.generate_content(prompt)
            evaluation = self._parse_evaluation(response.text)
            
            # Cache the decision
            self.decision_cache[cache_key] = evaluation
            
            # Log the evaluation
            self.integration_history.append({
                'timestamp': datetime.utcnow().isoformat(),
                'type': integration_type,
                'details': details,
                'evaluation': evaluation
            })
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Integration evaluation failed: {e}")
            return {
                'decision': 'reject',
                'confidence': 0.0,
                'error': str(e)
            }

    def _parse_evaluation(self, text: str) -> Dict[str, Any]:
        """Parse AI evaluation into structured format."""
        try:
            # Use Mistral to parse the evaluation
            parsed = self.tech_analyzer(
                f"Parse this evaluation into JSON format:\n{text}",
                max_length=512,
                temperature=0.1
            )[0]["generated_text"]
            
            # Extract JSON from response
            json_str = parsed[parsed.find("{"):parsed.rfind("}")+1]
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Failed to parse evaluation: {e}")
            return {
                'decision': 'reject',
                'confidence': 0.0,
                'error': 'Failed to parse evaluation'
            }

    def recommend_integrations(self, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recommend integrations based on requirements."""
        try:
            prompt = f"""
            Recommend integrations for these requirements:
            {json.dumps(requirements, indent=2)}
            
            Consider:
            1. Best available options
            2. Cost-effectiveness
            3. Ease of integration
            4. Community support
            5. Future scalability
            
            Provide recommendations with:
            - Integration name
            - Source (GitHub/HuggingFace/etc)
            - Confidence score
            - Implementation steps
            """

            response = self.gemini_model.generate_content(prompt)
            recommendations = self._parse_recommendations(response.text)
            
            # Log recommendations
            self.integration_history.append({
                'timestamp': datetime.utcnow().isoformat(),
                'type': 'recommendation',
                'requirements': requirements,
                'recommendations': recommendations
            })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            return []

    def _parse_recommendations(self, text: str) -> List[Dict[str, Any]]:
        """Parse AI recommendations into structured format."""
        try:
            parsed = self.tech_analyzer(
                f"Parse these recommendations into JSON format:\n{text}",
                max_length=1024,
                temperature=0.1
            )[0]["generated_text"]
            
            json_str = parsed[parsed.find("["):parsed.rfind("]")+1]
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Failed to parse recommendations: {e}")
            return []

    def get_integration_status(self) -> Dict[str, Any]:
        """Get comprehensive integration status."""
        return {
            'active_integrations': self._get_active_integrations(),
            'recent_decisions': self._get_recent_decisions(),
            'system_health': self._check_system_health(),
            'resource_usage': self._get_resource_usage()
        }

    def _get_active_integrations(self) -> List[Dict[str, Any]]:
        """Get list of active integrations."""
        return [
            {
                'type': 'github',
                'enabled': bool(os.getenv('GITHUB_TOKEN')),
                'last_used': self._get_last_used('github')
            },
            {
                'type': 'huggingface',
                'enabled': bool(os.getenv('HF_TOKEN')),
                'last_used': self._get_last_used('huggingface')
            },
            {
                'type': 'gemini',
                'enabled': bool(os.getenv('GOOGLE_API_KEY')),
                'last_used': self._get_last_used('gemini')
            }
        ]

    def _get_recent_decisions(self) -> List[Dict[str, Any]]:
        """Get recent integration decisions."""
        return sorted(
            self.integration_history,
            key=lambda x: x['timestamp'],
            reverse=True
        )[:5]

    def _check_system_health(self) -> Dict[str, Any]:
        """Check health of integrated systems."""
        return {
            'github': self._check_github_health(),
            'huggingface': self._check_huggingface_health(),
            'gemini': self._check_gemini_health()
        }

    def _get_resource_usage(self) -> Dict[str, Any]:
        """Get resource usage of integrations."""
        return {
            'memory': self._get_memory_usage(),
            'storage': self._get_storage_usage(),
            'api_calls': self._get_api_usage()
        }

    def _get_last_used(self, integration_type: str) -> Optional[str]:
        """Get last used timestamp for an integration."""
        for entry in reversed(self.integration_history):
            if entry['type'] == integration_type:
                return entry['timestamp']
        return None

    def _check_github_health(self) -> Dict[str, Any]:
        """Check GitHub API health."""
        try:
            response = requests.get(
                "https://api.github.com/rate_limit",
                headers={"Authorization": f"token {os.getenv('GITHUB_TOKEN')}"}
            )
            return {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'rate_limit': response.json()['resources']['core']
            }
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def _check_huggingface_health(self) -> Dict[str, Any]:
        """Check Hugging Face API health."""
        try:
            self.hf_api.list_models(limit=1)
            return {'status': 'healthy'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def _check_gemini_health(self) -> Dict[str, Any]:
        """Check Gemini API health."""
        try:
            self.gemini_model.generate_content("test")
            return {'status': 'healthy'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def _get_memory_usage(self) -> Dict[str, int]:
        """Get memory usage of models."""
        return {
            'gemini': 0,  # Cloud-based
            'mistral': 0,  # Will be implemented
            'cached_models': 0  # Will be implemented
        }

    def _get_storage_usage(self) -> Dict[str, int]:
        """Get storage usage of cached data."""
        return {
            'models': self._get_dir_size(Path("cache/models")),
            'repositories': self._get_dir_size(Path("cache/github")),
            'temp': self._get_dir_size(Path("cache/temp"))
        }

    def _get_api_usage(self) -> Dict[str, int]:
        """Get API call statistics."""
        return {
            'github': 0,  # Will be implemented
            'huggingface': 0,  # Will be implemented
            'gemini': 0  # Will be implemented
        }

    def _get_dir_size(self, path: Path) -> int:
        """Get directory size in bytes."""
        try:
            return sum(f.stat().st_size for f in path.rglob("*") if f.is_file())
        except Exception:
            return 0

def main():
    # Example usage
    manager = MetaIntegrationManager()
    
    # Evaluate a new integration
    evaluation = manager.evaluate_integration('github_repo', {
        'name': 'example/repo',
        'stars': 1000,
        'language': 'python',
        'description': 'Example repository'
    })
    
    # Get recommendations
    recommendations = manager.recommend_integrations({
        'task': 'text generation',
        'requirements': ['fast', 'accurate', 'low resource usage']
    })
    
    # Display status
    status = manager.get_integration_status()
    
    # Print results
    console.print("\n[bold]Integration Status:[/bold]")
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Integration")
    table.add_column("Status")
    table.add_column("Last Used")
    
    for integration in status['active_integrations']:
        table.add_row(
            integration['type'],
            '✅' if integration['enabled'] else '❌',
            integration['last_used'] or 'Never'
        )
    
    console.print(table)

if __name__ == "__main__":
    main() 

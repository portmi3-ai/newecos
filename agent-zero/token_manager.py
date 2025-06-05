import os
import yaml
import logging
from pathlib import Path
from typing import Dict, Optional
from dotenv import load_dotenv

class TokenManager:
    def __init__(self, config_path: str = "ai_config.yaml"):
        self.logger = logging.getLogger("TokenManager")
        self.config_path = config_path
        self.config = self._load_config()
        self.tokens = {}
        self._load_tokens()

    def _load_config(self) -> dict:
        """Load the configuration file."""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            self.logger.error(f"Failed to load config: {e}")
            return {}

    def _load_tokens(self):
        """Load tokens from environment variables."""
        load_dotenv()  # Load .env file if it exists
        
        required_tokens = {
            'openai': 'OPENAI_API_KEY',
            'google': 'GOOGLE_API_KEY',
            'github': 'GITHUB_TOKEN',
            'huggingface': 'HF_TOKEN',
            'anthropic': 'ANTHROPIC_API_KEY',
            'mistral': 'MISTRAL_API_KEY',
            'groq': 'GROQ_API_KEY',
            'together': 'TOGETHER_API_KEY',
            'replicate': 'REPLICATE_API_KEY',
            'stability': 'STABILITY_API_KEY',
            'elevenlabs': 'ELEVENLABS_API_KEY'
        }

        for service, env_var in required_tokens.items():
            token = os.getenv(env_var)
            if token:
                self.tokens[service] = token
                self.logger.info(f"Loaded token for {service}")
            else:
                self.logger.warning(f"Missing token for {service}")

    def get_token(self, service: str) -> Optional[str]:
        """Get token for a specific service."""
        return self.tokens.get(service)

    def validate_tokens(self) -> Dict[str, bool]:
        """Validate all loaded tokens."""
        validation_results = {}
        for service, token in self.tokens.items():
            # Basic validation - check if token exists and has minimum length
            validation_results[service] = bool(token and len(token) >= 20)
        return validation_results

    def get_missing_tokens(self) -> list:
        """Get list of services with missing tokens."""
        return [service for service, token in self.tokens.items() if not token]

    def save_tokens_to_env(self, env_path: str = ".env"):
        """Save tokens to .env file."""
        try:
            with open(env_path, 'w') as f:
                for service, token in self.tokens.items():
                    if token:
                        f.write(f"{service.upper()}_API_KEY={token}\n")
            self.logger.info(f"Saved tokens to {env_path}")
        except Exception as e:
            self.logger.error(f"Failed to save tokens: {e}")

    def update_token(self, service: str, token: str):
        """Update token for a specific service."""
        self.tokens[service] = token
        self.logger.info(f"Updated token for {service}")

    def get_available_services(self) -> list:
        """Get list of services with valid tokens."""
        return [service for service, token in self.tokens.items() if token]

def main():
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Initialize token manager
    token_manager = TokenManager()

    # Validate tokens
    validation_results = token_manager.validate_tokens()
    print("\nToken Validation Results:")
    for service, is_valid in validation_results.items():
        status = "✅" if is_valid else "❌"
        print(f"{status} {service}")

    # Show missing tokens
    missing_tokens = token_manager.get_missing_tokens()
    if missing_tokens:
        print("\nMissing Tokens:")
        for service in missing_tokens:
            print(f"❌ {service}")

    # Show available services
    available_services = token_manager.get_available_services()
    if available_services:
        print("\nAvailable Services:")
        for service in available_services:
            print(f"✅ {service}")

if __name__ == "__main__":
    main() 

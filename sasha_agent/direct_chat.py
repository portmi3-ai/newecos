import requests
import json
import uuid
import os
from typing import Optional, Dict, Any

class SashaDirectChat:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id = str(uuid.uuid4())
        self._check_health()
    
    def _check_health(self):
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code != 200:
                raise ConnectionError("Sasha AI service is not healthy")
            print("✅ Connected to Sasha AI service")
        except Exception as e:
            raise ConnectionError(f"Failed to connect to Sasha AI service: {str(e)}")
    
    def chat(self, message: str, mode: str = "default") -> Dict[str, Any]:
        """
        Send a message to Sasha and get her response.
        
        Args:
            message (str): The message to send to Sasha
            mode (str): The interaction mode ('default', 'code', or 'devops')
            
        Returns:
            Dict containing Sasha's response and session information
        """
        try:
            payload = {
                "message": message,
                "session_id": self.session_id,
                "mode": mode
            }
            
            response = requests.post(
                f"{self.base_url}/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise Exception(f"Error: {response.text}")
            
            return response.json()
            
        except Exception as e:
            print(f"Error communicating with Sasha: {str(e)}")
            return {"error": str(e)}
    
    def clear_conversation(self):
        """Clear the current conversation history"""
        try:
            response = requests.post(
                f"{self.base_url}/clear-conversation",
                json={"session_id": self.session_id},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise Exception(f"Error: {response.text}")
                
            print("Conversation cleared successfully")
            
        except Exception as e:
            print(f"Error clearing conversation: {str(e)}")

def main():
    # Create a new chat session
    sasha = SashaDirectChat()
    
    print("\n🤖 Sasha Direct Chat Interface")
    print("Type 'exit' to quit, 'clear' to clear conversation")
    print("Mode options: default, code, devops")
    print("Example: /mode code - to switch to code mode")
    print("-" * 50)
    
    while True:
        try:
            # Get user input
            user_input = input("\nYou: ").strip()
            
            # Handle commands
            if user_input.lower() == 'exit':
                break
            elif user_input.lower() == 'clear':
                sasha.clear_conversation()
                continue
            elif user_input.startswith('/mode '):
                mode = user_input.split(' ')[1].lower()
                if mode in ['default', 'code', 'devops']:
                    print(f"Switched to {mode} mode")
                    continue
                else:
                    print("Invalid mode. Use: default, code, or devops")
                    continue
            
            # Send message to Sasha
            response = sasha.chat(user_input)
            
            # Print Sasha's response
            if "error" in response:
                print(f"Error: {response['error']}")
            else:
                print(f"\nSasha: {response['response']}")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 
import os
from dotenv import load_dotenv
import google.generativeai as genai

def test_gemini_connection():
    try:
        # Load environment variables
        load_dotenv()
        
        # Configure Gemini
        api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=api_key)
        
        # Initialize model with the latest version
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        
        # Test prompt
        response = model.generate_content("Hello! Please confirm that you're working correctly.")
        
        print("Connection Test Results:")
        print("------------------------")
        print("API Key: Configured successfully")
        print("Model: gemini-1.5-pro-latest")
        print("Test Response:", response.text)
        print("\nGemini API is working correctly!")
        
    except Exception as e:
        print("Error testing Gemini API:")
        print(str(e))

if __name__ == "__main__":
    test_gemini_connection() 
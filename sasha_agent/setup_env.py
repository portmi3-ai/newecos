import os
import sys

def setup_environment():
    # Set environment variables
    os.environ['GOOGLE_API_KEY'] = 'AIzaSyDyZUctzIdmA83b8oDYggmYBFRw07M-UXk'
    os.environ['HUGGINGFACE_API_KEY'] = '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'
    
    # Verify environment variables are set
    if not os.getenv('GOOGLE_API_KEY') or not os.getenv('HUGGINGFACE_API_KEY'):
        print("Error: Failed to set environment variables")
        sys.exit(1)
    
    print("Environment variables set successfully")
    print("Starting main application...")
    
    # Import and run the main application
    from main import app
    import uvicorn
    
    uvicorn.run(app, host='0.0.0.0', port=8000)

if __name__ == '__main__':
    setup_environment() 
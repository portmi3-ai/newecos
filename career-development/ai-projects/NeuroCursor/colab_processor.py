import requests
import json
import os
from pathlib import Path
import time
import webbrowser
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

class NeuroColabProcessor:
    def __init__(self):
        self.colab_url = "https://colab.research.google.com/github/portmi3-ai/crewAI/blob/main/movieeditor.ipynb"
        self.video_dir = "F:\\Birthday_Video_Project\\Activities"
        self.processed_dir = "F:\\Birthday_Video_Project\\Processed"
        self.session = requests.Session()
        self.creds = None
        
    def authenticate(self):
        """Handle Google authentication"""
        print("Opening Colab notebook in your browser...")
        webbrowser.open(self.colab_url)
        print("\nPlease:")
        print("1. Sign in to your Google account")
        print("2. Click 'Connect' in the Colab notebook")
        print("3. Allow file access when prompted")
        input("\nPress Enter once you've completed these steps...")
        return True

    def connect_to_colab(self):
        """Establish connection to the Colab notebook"""
        if not self.authenticate():
            return False
            
        try:
            print("\nConnecting to Colab notebook...")
            # The notebook is already open and authenticated in the browser
            return True
        except Exception as e:
            print(f"Error connecting to Colab: {str(e)}")
            return False

    def upload_to_drive(self, video_path):
        """Upload video to Google Drive for Colab processing"""
        try:
            filename = os.path.basename(video_path)
            print(f"Please upload {filename} in the Colab notebook:")
            print(f"1. Look for the 'Upload Files' section")
            print(f"2. Upload: {video_path}")
            input("\nPress Enter once you've uploaded the file...")
            return True
                
        except Exception as e:
            print(f"Error uploading to Drive: {str(e)}")
            return False

    def process_video(self, video_path):
        """Process video through Colab notebook"""
        try:
            if not self.upload_to_drive(video_path):
                return False
                
            print("\nIn the Colab notebook:")
            print("1. Set these parameters:")
            print("   - minDuration: 0.3")
            print("   - maxDuration: 8.0")
            print("   - motionThreshold: 0.6")
            print("   - unhinged_mode: True")
            print("2. Run the processing cell")
            input("\nPress Enter once processing is complete...")
            return True
                
        except Exception as e:
            print(f"Error processing video: {str(e)}")
            return False

    def process_all_videos(self):
        """Process all videos in order of size (largest first)"""
        if not self.connect_to_colab():
            print("Failed to connect to Colab notebook")
            return
            
        # Get all videos and sort by size
        videos = []
        for file in os.listdir(self.video_dir):
            if file.endswith('.mp4'):
                path = os.path.join(self.video_dir, file)
                size = os.path.getsize(path)
                videos.append((path, size))
        
        # Sort by size, largest first
        videos.sort(key=lambda x: x[1], reverse=True)
        
        print("\nVideos to process (in order):")
        for i, (path, size) in enumerate(videos, 1):
            print(f"{i}. {os.path.basename(path)} ({size/1024/1024:.2f} MB)")
        
        # Process each video
        for video_path, size in videos:
            print(f"\nProcessing {os.path.basename(video_path)} ({size/1024/1024:.2f} MB)")
            result = self.process_video(video_path)
            if result:
                print("✓ Success!")
            else:
                print("✗ Failed")
            
            # Ask to continue
            if input("\nProcess next video? (y/n): ").lower() != 'y':
                break

if __name__ == "__main__":
    processor = NeuroColabProcessor()
    print("Neuro Colab Processor Initialized")
    print("=================================")
    print("Starting batch processing...")
    processor.process_all_videos() 
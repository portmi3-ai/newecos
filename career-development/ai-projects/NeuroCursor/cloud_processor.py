import requests
import json
import os
from pathlib import Path
import time

class NeuroCloudProcessor:
    def __init__(self):
        self.cloud_url = "https://84b8243f08c8c330df.gradio.live/api/predict"
        self.video_dir = "F:\\Birthday_Video_Project\\Activities"
        self.processed_dir = "F:\\Birthday_Video_Project\\Processed"
        
    def process_video(self, video_path):
        """Process a single video through the Gradio interface"""
        try:
            # Prepare the files and parameters
            files = {
                'video': ('video.mp4', open(video_path, 'rb'), 'video/mp4')
            }
            
            data = {
                'minDuration': 0.3,
                'maxDuration': 8.0,
                'motionThreshold': 0.6,
                'unhinged_mode': True
            }
            
            # Make the API request
            print(f"Processing {os.path.basename(video_path)}...")
            response = requests.post(
                self.cloud_url,
                files=files,
                data={'data': json.dumps(data)}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"Successfully processed: {os.path.basename(video_path)}")
                return result
            else:
                print(f"Error processing video: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error: {str(e)}")
            return None

    def process_all_videos(self):
        """Process all videos in order of size (largest first)"""
        # Get all videos and sort by size
        videos = []
        for file in os.listdir(self.video_dir):
            if file.endswith('.mp4'):
                path = os.path.join(self.video_dir, file)
                size = os.path.getsize(path)
                videos.append((path, size))
        
        # Sort by size, largest first
        videos.sort(key=lambda x: x[1], reverse=True)
        
        # Process each video
        for video_path, size in videos:
            print(f"\nProcessing {os.path.basename(video_path)} ({size/1024/1024:.2f} MB)")
            result = self.process_video(video_path)
            if result:
                print("✓ Success!")
            else:
                print("✗ Failed")
            time.sleep(2)  # Small delay between videos

if __name__ == "__main__":
    processor = NeuroCloudProcessor()
    print("Neuro Cloud Processor Initialized")
    print("=================================")
    print("Starting batch processing...")
    processor.process_all_videos() 
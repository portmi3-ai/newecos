import win32com.client
import os
import time
from pathlib import Path
import subprocess

class MovieMakerController:
    def __init__(self):
        self.video_dir = "F:\\Birthday_Video_Project\\Activities"
        self.output_dir = "F:\\Birthday_Video_Project\\Processed"
        # Parameters from NEURO_REFERENCE.md
        self.min_duration = 0.3
        self.max_duration = 8.0
        self.motion_threshold = 0.6
        self.unhinged_mode = True
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize Movie Maker through shell
        try:
            # First try to launch Movie Maker
            subprocess.Popen(['start', 'moviemk.exe'], shell=True)
            time.sleep(2)  # Give it time to start
            
            # Then try to connect to it
            self.app = win32com.client.GetActiveObject("WindowsMovieMaker.Application")
            print("✓ Connected to existing Movie Maker instance")
        except Exception as e:
            try:
                # Try alternative COM registration
                self.app = win32com.client.Dispatch("WindowsMovieMaker.Document")
                print("✓ Created new Movie Maker instance")
            except Exception as e2:
                print(f"Error initializing Movie Maker: {str(e2)}")
                print("Please ensure Windows Movie Maker is installed and registered")
                raise

    def create_project(self, name="Birthday_Video_March2022"):
        """Create a new Movie Maker project"""
        try:
            if hasattr(self.app, 'CreateProject'):
                self.project = self.app.CreateProject(name)
            else:
                self.project = self.app.New()
            
            # Try different ways to enable auto-save
            for attr in ['AutoSave', 'EnableAutoSave', 'SaveAutomatically']:
                if hasattr(self.project, attr):
                    setattr(self.project, attr, True)
                    break
                    
            print(f"✓ Created project: {name}")
        except Exception as e:
            print(f"Error creating project: {str(e)}")
            raise

    def add_video(self, video_path):
        """Add a video to the timeline"""
        try:
            # Try different methods to import video
            clip = None
            methods = [
                lambda: self.project.AddMediaFile(video_path),
                lambda: self.project.Import(video_path),
                lambda: self.project.ImportMedia(video_path)
            ]
            
            for method in methods:
                try:
                    clip = method()
                    if clip:
                        break
                except:
                    continue
            
            if not clip:
                raise Exception("Could not import video using any available method")
            
            # Apply our Neuro parameters
            if hasattr(clip, 'Duration'):
                clip.Duration = min(self.max_duration, clip.Duration)
                if clip.Duration < self.min_duration:
                    return False
            
            # Apply motion detection if supported
            if hasattr(clip, 'DetectMotion'):
                clip.DetectMotion(self.motion_threshold)
            
            # Apply creative effects if unhinged mode is on
            if self.unhinged_mode:
                self._apply_creative_effects(clip)
                
            print(f"✓ Added video: {os.path.basename(video_path)}")
            return True
        except Exception as e:
            print(f"Error adding video: {str(e)}")
            return False

    def _apply_creative_effects(self, clip):
        """Apply creative effects in unhinged mode"""
        try:
            # Try to get effects and transitions through different property names
            effect_props = ['AvailableEffects', 'Effects', 'VideoEffects']
            transition_props = ['AvailableTransitions', 'Transitions', 'VideoTransitions']
            
            # Apply effects
            for prop in effect_props:
                try:
                    if hasattr(self.app, prop):
                        effects = getattr(self.app, prop)
                        for effect in effects[:3]:
                            clip.AddEffect(effect)
                        break
                except:
                    continue
            
            # Apply transitions
            for prop in transition_props:
                try:
                    if hasattr(self.app, prop):
                        transitions = getattr(self.app, prop)
                        if transitions and len(transitions) > 0:
                            clip.AddTransition(transitions[0])
                        break
                except:
                    continue
                    
        except Exception as e:
            print(f"Warning: Could not apply all creative effects: {str(e)}")

    def process_videos(self):
        """Process all videos in the specified directory"""
        try:
            # Get all MP4 files and sort by size (largest first)
            videos = []
            for file in os.listdir(self.video_dir):
                if file.endswith('.mp4'):
                    path = os.path.join(self.video_dir, file)
                    size = os.path.getsize(path)
                    videos.append((path, size))
            
            videos.sort(key=lambda x: x[1], reverse=True)
            
            # Create new project
            self.create_project()
            
            # Process each video
            for video_path, size in videos:
                print(f"\nProcessing {os.path.basename(video_path)} ({size/1024/1024:.2f} MB)")
                if self.add_video(video_path):
                    print("✓ Success!")
                else:
                    print("✗ Failed")
                time.sleep(1)  # Small delay between videos
                
            # Save the project - try different save methods
            output_path = os.path.join(self.output_dir, "Birthday_Video_Final.wmv")
            save_methods = [
                lambda: self.project.SaveMovie(output_path),
                lambda: self.project.SaveAs(output_path),
                lambda: self.project.Export(output_path)
            ]
            
            for method in save_methods:
                try:
                    method()
                    print(f"\n✓ Project saved to: {output_path}")
                    break
                except:
                    continue
            
        except Exception as e:
            print(f"Error processing videos: {str(e)}")
            raise

    def close(self):
        """Close Movie Maker"""
        try:
            # Try different quit methods
            quit_methods = [
                lambda: self.app.Quit(),
                lambda: self.app.Close(),
                lambda: self.app.Exit()
            ]
            
            for method in quit_methods:
                try:
                    method()
                    print("✓ Movie Maker closed")
                    break
                except:
                    continue
                    
        except Exception as e:
            print(f"Error closing Movie Maker: {str(e)}")

if __name__ == "__main__":
    controller = MovieMakerController()
    print("Neuro Movie Maker Controller Initialized")
    print("=======================================")
    try:
        controller.process_videos()
    finally:
        controller.close() 
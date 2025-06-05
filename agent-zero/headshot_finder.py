import os
import cv2
import concurrent.futures
from pathlib import Path
from datetime import datetime
import logging

class HeadshotFinder:
    def __init__(self):
        # Initialize face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Set up logging
        self.setup_logging()
        
        # File extensions to check
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'}
        
        # Keywords that might indicate headshots
        self.headshot_keywords = {'headshot', 'portrait', 'profile', 'head', 'face', 'professional'}
        
        # Results storage
        self.found_headshots = []
        
    def setup_logging(self):
        """Set up logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('headshot_search.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def is_likely_headshot_by_name(self, filepath):
        """Check if the file name suggests it's a headshot"""
        name_lower = str(filepath).lower()
        return any(keyword in name_lower for keyword in self.headshot_keywords)

    def has_face(self, image_path):
        """Detect if an image contains a face"""
        try:
            image = cv2.imread(str(image_path))
            if image is None:
                return False
                
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            # Check if exactly one face is detected (typical for headshots)
            return len(faces) == 1
            
        except Exception as e:
            self.logger.warning(f"Error processing {image_path}: {str(e)}")
            return False

    def process_file(self, filepath):
        """Process a single file to determine if it's a headshot"""
        try:
            # Skip if not an image file
            if filepath.suffix.lower() not in self.image_extensions:
                return
                
            # Check filename first (faster than image processing)
            name_match = self.is_likely_headshot_by_name(filepath)
            
            # If filename matches or we want to check all images
            if name_match or True:  # Currently checking all images
                if self.has_face(filepath):
                    self.found_headshots.append({
                        'path': str(filepath),
                        'size': filepath.stat().st_size,
                        'modified': datetime.fromtimestamp(filepath.stat().st_mtime),
                        'name_match': name_match
                    })
                    self.logger.info(f"Found potential headshot: {filepath}")
                    
        except Exception as e:
            self.logger.error(f"Error processing {filepath}: {str(e)}")

    def search_directory(self, start_path):
        """Search for headshots in the given directory and its subdirectories"""
        try:
            start_time = datetime.now()
            self.logger.info(f"Starting headshot search in {start_path}")
            
            # Convert to Path object
            root_path = Path(start_path)
            
            # Collect all files first
            all_files = []
            for filepath in root_path.rglob('*'):
                if filepath.is_file() and filepath.suffix.lower() in self.image_extensions:
                    all_files.append(filepath)
            
            # Process files in parallel
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
                executor.map(self.process_file, all_files)
            
            # Log results
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            self.logger.info(f"Search completed in {duration:.2f} seconds")
            self.logger.info(f"Found {len(self.found_headshots)} potential headshots")
            
            return self.found_headshots
            
        except Exception as e:
            self.logger.error(f"Error during directory search: {str(e)}")
            return []

    def print_results(self):
        """Print the search results in a formatted way"""
        if not self.found_headshots:
            print("\nNo headshots found.")
            return
            
        print(f"\nFound {len(self.found_headshots)} potential headshots:")
        print("-" * 80)
        
        for idx, headshot in enumerate(self.found_headshots, 1):
            size_mb = headshot['size'] / (1024 * 1024)
            print(f"{idx}. {headshot['path']}")
            print(f"   Size: {size_mb:.2f}MB")
            print(f"   Modified: {headshot['modified'].strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"   Name suggests headshot: {'Yes' if headshot['name_match'] else 'No'}")
            print("-" * 80)

def main():
    finder = HeadshotFinder()
    
    # Search D: drive
    results = finder.search_directory("D:\\")
    
    # Print results
    finder.print_results()
    
    # Log completion
    if results:
        print("\nSearch complete! Check headshot_search.log for detailed information.")
    else:
        print("\nNo headshots found. Check headshot_search.log for any errors.")

if __name__ == "__main__":
    main() 

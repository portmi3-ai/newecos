import os
import json
import shutil
from datetime import datetime
from pathlib import Path

class LogoVersionManager:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.logos_dir = self.root_dir / 'branding' / 'logos'
        self.variations_dir = self.logos_dir / 'variations'
        self.metadata_index = self.variations_dir / 'metadata_index.json'
        self.archive_dir = self.variations_dir / 'archive'

    def load_metadata_index(self):
        """Load the metadata index file"""
        if not self.metadata_index.exists():
            return {
                "last_updated": datetime.now().strftime("%Y-%m-%d"),
                "total_logos": 0,
                "categories": {},
                "logos": [],
                "version_history": {}
            }
        
        with open(self.metadata_index, 'r') as f:
            return json.load(f)

    def save_metadata_index(self, data):
        """Save the metadata index file"""
        with open(self.metadata_index, 'w') as f:
            json.dump(data, f, indent=4)

    def create_new_version(self, logo_file, new_version, changes=""):
        """Create a new version of a logo"""
        logo_path = Path(logo_file)
        if not logo_path.exists():
            raise FileNotFoundError(f"Logo file {logo_file} not found")

        # Load current metadata
        metadata = self.load_metadata_index()
        
        # Find logo in metadata
        logo_entry = next((logo for logo in metadata["logos"] 
                          if logo["logo_info"]["file_name"] == logo_path.name), None)
        
        if not logo_entry:
            raise ValueError(f"Logo {logo_path.name} not found in metadata index")

        # Create archive directory if it doesn't exist
        self.archive_dir.mkdir(exist_ok=True)
        category_archive = self.archive_dir / logo_entry["logo_info"]["category"]
        category_archive.mkdir(exist_ok=True)

        # Archive current version
        current_version = logo_entry["logo_info"]["version"]
        archive_name = f"{logo_path.stem}_v{current_version}{logo_path.suffix}"
        shutil.copy2(logo_path, category_archive / archive_name)

        # Update metadata
        logo_entry["logo_info"]["version"] = new_version
        logo_entry["logo_info"]["last_modified"] = datetime.now().strftime("%Y-%m-%d")

        # Update version history
        category = logo_entry["logo_info"]["category"]
        if category not in metadata["version_history"]:
            metadata["version_history"][category] = {}
        
        metadata["version_history"][category][new_version] = {
            "release_date": datetime.now().strftime("%Y-%m-%d"),
            "changes": changes
        }

        # Update category latest version
        metadata["categories"][category]["latest_version"] = new_version

        # Save updated metadata
        self.save_metadata_index(metadata)
        print(f"Created new version {new_version} for {logo_path.name}")

    def add_new_logo(self, logo_file, category, style, description, tags=None):
        """Add a new logo to the collection"""
        logo_path = Path(logo_file)
        if not logo_path.exists():
            raise FileNotFoundError(f"Logo file {logo_file} not found")

        metadata = self.load_metadata_index()
        
        # Update category counts
        if category not in metadata["categories"]:
            metadata["categories"][category] = {
                "count": 0,
                "latest_version": "1.0"
            }
        metadata["categories"][category]["count"] += 1

        # Create new logo entry
        new_logo = {
            "logo_info": {
                "file_name": logo_path.name,
                "category": category,
                "style": style,
                "description": description,
                "date_created": datetime.now().strftime("%Y-%m-%d"),
                "version": "1.0"
            },
            "tags": tags or []
        }

        metadata["logos"].append(new_logo)
        metadata["total_logos"] = len(metadata["logos"])
        metadata["last_updated"] = datetime.now().strftime("%Y-%m-%d")

        # Add initial version to history
        if category not in metadata["version_history"]:
            metadata["version_history"][category] = {}
        
        if "1.0" not in metadata["version_history"][category]:
            metadata["version_history"][category]["1.0"] = {
                "release_date": datetime.now().strftime("%Y-%m-%d"),
                "changes": "Initial version"
            }

        self.save_metadata_index(metadata)
        print(f"Added new logo: {logo_path.name}")

    def get_logo_history(self, logo_file):
        """Get the version history of a specific logo"""
        logo_path = Path(logo_file)
        metadata = self.load_metadata_index()
        
        logo_entry = next((logo for logo in metadata["logos"] 
                          if logo["logo_info"]["file_name"] == logo_path.name), None)
        
        if not logo_entry:
            raise ValueError(f"Logo {logo_path.name} not found in metadata index")

        category = logo_entry["logo_info"]["category"]
        return metadata["version_history"][category]

    def list_logos(self, category=None):
        """List all logos or logos in a specific category"""
        metadata = self.load_metadata_index()
        
        if category:
            logos = [logo for logo in metadata["logos"] 
                    if logo["logo_info"]["category"] == category]
        else:
            logos = metadata["logos"]

        for logo in logos:
            info = logo["logo_info"]
            print(f"\nFile: {info['file_name']}")
            print(f"Category: {info['category']}")
            print(f"Style: {info['style']}")
            print(f"Version: {info['version']}")
            print(f"Created: {info['date_created']}")
            print(f"Tags: {', '.join(logo['tags'])}")
            print("-" * 40)

if __name__ == "__main__":
    # Example usage
    manager = LogoVersionManager("D:/.aGITHUB REPO/mport-media-group")
    
    # List all logos
    print("All Logos:")
    manager.list_logos()
    
    # List geometric logos
    print("\nGeometric Logos:")
    manager.list_logos("geometric")
    
    # Example: Create a new version
    # manager.create_new_version(
    #     "path/to/logo.jpg",
    #     "1.1",
    #     "Updated color scheme and improved contrast"
    # ) 
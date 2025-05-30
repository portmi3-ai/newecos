import os
import json
import shutil
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

class LogoManager:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.logos_dir = self.root_dir / 'branding' / 'logos'
        self.variations_dir = self.logos_dir / 'variations'
        self.metadata_template = self.variations_dir / 'metadata_template.json'
        self.preview_size = (200, 200)

    def load_metadata_template(self):
        """Load the metadata template"""
        with open(self.metadata_template, 'r') as f:
            return json.load(f)

    def create_metadata(self, logo_path):
        """Create metadata file for a logo"""
        logo_file = Path(logo_path)
        metadata_file = logo_file.with_suffix('.json')
        
        if metadata_file.exists():
            print(f"Metadata already exists for {logo_file.name}")
            return

        # Load template
        metadata = self.load_metadata_template()
        
        # Get image info
        with Image.open(logo_file) as img:
            width, height = img.size
            format = img.format

        # Update metadata
        metadata['logo_info'].update({
            'file_name': logo_file.name,
            'original_name': logo_file.name,
            'category': 'geometric' if 'geometric' in logo_file.parent.name else 'ai-generated',
            'date_created': datetime.now().isoformat(),
            'last_modified': datetime.now().isoformat()
        })
        
        metadata['design_specs'].update({
            'dimensions': {
                'width': width,
                'height': height,
                'aspect_ratio': f"{width}:{height}"
            },
            'format': format
        })

        # Save metadata
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=4)
        
        print(f"Created metadata for {logo_file.name}")

    def generate_preview(self, logo_path):
        """Generate a preview image for a logo"""
        logo_file = Path(logo_path)
        preview_dir = self.logos_dir / 'previews'
        preview_dir.mkdir(exist_ok=True)
        
        preview_file = preview_dir / f"preview_{logo_file.name}"
        
        if preview_file.exists():
            print(f"Preview already exists for {logo_file.name}")
            return str(preview_file)

        # Create preview
        with Image.open(logo_file) as img:
            # Resize maintaining aspect ratio
            img.thumbnail(self.preview_size)
            
            # Create white background
            preview = Image.new('RGB', self.preview_size, 'white')
            
            # Calculate position to center the image
            x = (self.preview_size[0] - img.size[0]) // 2
            y = (self.preview_size[1] - img.size[1]) // 2
            
            # Paste the resized image
            preview.paste(img, (x, y))
            preview.save(preview_file)
        
        print(f"Generated preview for {logo_file.name}")
        return str(preview_file)

    def update_readme_previews(self):
        """Update the README with preview images"""
        readme_file = self.logos_dir / 'README.md'
        with open(readme_file, 'r') as f:
            content = f.read()

        # Find all logo files
        geometric_logos = list(self.variations_dir.glob('geometric/*.jpg'))
        ai_logos = list(self.variations_dir.glob('ai-generated/*.jpg'))

        # Generate previews and update content
        for logo in geometric_logos + ai_logos:
            preview_path = self.generate_preview(logo)
            relative_path = os.path.relpath(preview_path, self.logos_dir)
            placeholder = f'[Preview]'
            content = content.replace(placeholder, f'![{logo.stem}]({relative_path})', 1)

        # Save updated README
        with open(readme_file, 'w') as f:
            f.write(content)
        
        print("Updated README with preview images")

    def process_all_logos(self):
        """Process all logos in the variations directory"""
        # Process geometric logos
        for logo in self.variations_dir.glob('geometric/*.jpg'):
            self.create_metadata(logo)
            self.generate_preview(logo)

        # Process AI-generated logos
        for logo in self.variations_dir.glob('ai-generated/*.jpg'):
            self.create_metadata(logo)
            self.generate_preview(logo)

        # Update README
        self.update_readme_previews()

if __name__ == '__main__':
    root_dir = Path('D:/.aGITHUB REPO/mport-media-group')
    manager = LogoManager(root_dir)
    manager.process_all_logos() 
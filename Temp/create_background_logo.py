from PIL import Image, ImageOps
import os
from pathlib import Path

def create_background_logo():
    # Source and destination paths
    source_path = Path("abstract_geometric_logo_mark_for_mport_media (6).jpg")
    resources_dir = Path("D:/AI_Brain/agent_zero/src/gui/resources")
    output_path = resources_dir / "background_logo.png"
    
    # Create the destination directory if it doesn't exist
    resources_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Open and convert the image
        img = Image.open(source_path)
        
        # Convert to grayscale
        img = img.convert('L')
        
        # Increase contrast to make it more silhouette-like
        img = ImageOps.autocontrast(img, cutoff=10)
        
        # Convert to RGBA
        img = img.convert('RGBA')
        
        # Make it semi-transparent and blue-tinted
        data = img.getdata()
        newData = []
        for item in data:
            # Convert black to semi-transparent blue
            if item[0] < 128:  # If it's darker than mid-gray
                newData.append((41, 128, 185, 15))  # Very transparent blue
            else:
                newData.append((255, 255, 255, 0))  # Fully transparent white
        
        img.putdata(newData)
        
        # Save the result
        img.save(output_path, 'PNG')
        print(f"Successfully created background logo at: {output_path}")
        
    except Exception as e:
        print(f"Error converting image: {e}")

if __name__ == "__main__":
    create_background_logo() 
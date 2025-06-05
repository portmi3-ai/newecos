from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

def create_icon():
    """Create Sasha's icon."""
    try:
        # Create a 256x256 image with a gradient background
        size = 256
        image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # Draw a circular gradient background
        for i in range(size):
            for j in range(size):
                # Calculate distance from center
                dx = i - size/2
                dy = j - size/2
                distance = (dx*dx + dy*dy)**0.5
                
                # Create a purple to blue gradient
                if distance < size/2:
                    # Normalize distance to 0-1
                    t = distance / (size/2)
                    # Interpolate between purple and blue
                    r = int(128 * (1-t) + 0 * t)
                    g = int(0 * (1-t) + 0 * t)
                    b = int(255 * (1-t) + 255 * t)
                    a = int(255 * (1-t))
                    draw.point((i, j), fill=(r, g, b, a))
        
        # Draw a stylized "S" in the center
        try:
            # Try to load a font
            font = ImageFont.truetype("arial.ttf", 120)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
            
        # Draw the "S" in white
        draw.text((size/2, size/2), "S", fill=(255, 255, 255, 255), 
                 font=font, anchor="mm")
        
        # Save the icon
        icon_path = Path(__file__).parent / "sasha.ico"
        image.save(icon_path, format='ICO', sizes=[(256, 256)])
        
        print(f"Icon created successfully at: {icon_path}")
        
    except Exception as e:
        print(f"Error creating icon: {e}")

if __name__ == "__main__":
    create_icon() 

from PIL import Image, ImageEnhance, ImageFilter
import os
from pathlib import Path

def convert_to_icon():
    # Source and destination paths
    source_path = Path("Main Logo.jpg")
    resources_dir = Path("D:/AI_Brain/agent_zero/src/gui/resources")
    icon_path = resources_dir / "agent_zero_icon.png"
    
    # Mport Media Group brand colors
    BRAND_COLORS = {
        'primary': (41, 128, 185),  # Professional blue
        'secondary': (52, 152, 219),  # Light blue
        'accent': (236, 240, 241)   # Light gray
    }
    
    # Create the destination directory if it doesn't exist
    resources_dir.mkdir(parents=True, exist_ok=True)
    
    # Define multiple sizes for better scaling
    sizes = [16, 32, 48, 64, 128, 256]
    
    try:
        # Open the original image
        img = Image.open(source_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Enhance the image
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)  # Slightly increase contrast
        
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.1)  # Slightly increase sharpness
        
        # Create icons for each size
        icons = []
        for size in sizes:
            # Calculate the size to maintain aspect ratio
            ratio = min(size/img.width, size/img.height)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            
            # Resize the image with high quality
            resized = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Apply subtle smoothing for smaller sizes
            if size < 64:
                resized = resized.filter(ImageFilter.SMOOTH_MORE)
            
            # Create a new square image with transparent background
            icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            
            # Calculate position to center the logo
            x = (size - new_size[0]) // 2
            y = (size - new_size[1]) // 2
            
            # Paste the resized image onto the transparent background
            icon.paste(resized, (x, y), resized if resized.mode == 'RGBA' else None)
            icons.append(icon)
        
        # Save the largest size as PNG
        icons[-1].save(icon_path, 'PNG', optimize=True)
        
        # Save as ICO with multiple sizes
        ico_path = icon_path.with_suffix('.ico')
        icons[0].save(ico_path, 'ICO', sizes=[(icon.width, icon.height) for icon in icons], append_images=icons[1:])
        
        # Save brand colors for use in the GUI
        colors_path = resources_dir / "brand_colors.txt"
        with open(colors_path, 'w') as f:
            for name, color in BRAND_COLORS.items():
                f.write(f"{name}={','.join(map(str, color))}\n")
        
        print(f"Successfully created icons at:")
        print(f"PNG: {icon_path}")
        print(f"ICO: {ico_path}")
        print(f"Brand colors saved to: {colors_path}")
        
    except Exception as e:
        print(f"Error converting image: {e}")

if __name__ == "__main__":
    convert_to_icon() 
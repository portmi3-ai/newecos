from PIL import Image
import os

def remove_background_and_create_icon(input_path, output_path):
    # Open the image
    img = Image.open(input_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get the image data
    data = img.getdata()
    
    # Create a new image with transparent background
    new_data = []
    for item in data:
        # If pixel is white or very light, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    
    # Create new image with transparent background
    img.putdata(new_data)
    
    # Create different sizes for the icon, focusing on larger sizes
    # Windows uses the largest available size for desktop icons
    sizes = [(32,32), (48,48), (64,64), (128,128), (256,256), (512,512)]
    
    # Ensure high quality resizing
    img = img.resize((512, 512), Image.Resampling.LANCZOS)
    
    # Save as ICO with multiple sizes
    img.save(output_path, format='ICO', sizes=sizes)

def main():
    # Paths
    input_path = r"D:\.aGITHUB REPO\mport-media-group\Temp\Main Logo.jpg"
    output_path = r"D:\.aGITHUB REPO\mport-media-group\agent-zero\icon.ico"
    
    # Create icon
    remove_background_and_create_icon(input_path, output_path)
    
    print("Icon created successfully!")

if __name__ == "__main__":
    main() 

from PIL import Image
import os

def create_og_image():
    # Dimensions: 1200x630
    width = 1200
    height = 630
    
    # Create blue background #2D8CFF
    bg = Image.new('RGBA', (width, height), '#2D8CFF')
    
    # Open logo
    if not os.path.exists('public/logo.png'):
        print("Error: public/logo.png not found")
        return
        
    logo = Image.open('public/logo.png')
    
    # Calculate logo size (fit within height with padding)
    # Use 50% of height as max logo height
    max_h = int(height * 0.5)
    
    # Calculate aspect ratio
    aspect = logo.width / logo.height
    new_h = max_h
    new_w = int(max_h * aspect)
    
    # Resize logo
    logo_resized = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center logo
    logo_x = (width - new_w) // 2
    logo_y = (height - new_h) // 2
    
    # Paste logo onto background
    bg.paste(logo_resized, (logo_x, logo_y), logo_resized if logo_resized.mode == 'RGBA' else None)
    
    # Save
    if not os.path.exists('public'):
        os.makedirs('public')
        
    bg.save('public/og-image.png')
    print('Generated public/og-image.png')

if __name__ == '__main__':
    create_og_image()

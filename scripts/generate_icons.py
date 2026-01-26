from PIL import Image
import os

def create_icon(size):
    # Create blue background #2D8CFF
    bg = Image.new('RGBA', (size, size), '#2D8CFF')
    
    # Open logo
    logo = Image.open('public/logo.png')
    
    # Calculate logo size (fit within 60% of width/height for padding)
    target_size = int(size * 0.6)
    logo.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)
    
    # Center logo
    logo_x = (size - logo.width) // 2
    logo_y = (size - logo.height) // 2
    
    # Paste logo onto background (using alpha channel if present)
    bg.paste(logo, (logo_x, logo_y), logo if logo.mode == 'RGBA' else None)
    
    # Save
    bg.save(f'public/pwa-{size}x{size}.png')
    print(f'Generated public/pwa-{size}x{size}.png')

if __name__ == '__main__':
    if not os.path.exists('public/logo.png'):
        print("Error: public/logo.png not found")
        exit(1)
        
    create_icon(192)
    create_icon(512)

from PIL import Image, ImageDraw, ImageFont, ImageOps
import os

LOGO_PATH = 'public/logo.png'
BRAND_BLUE = '#2D8CFF'
OUTPUT_DIR = 'public'

def generate_app_icon(size, logo_scale_percent=0.82):
    """
    Generates app icon (square).
    Logo scale: 80-85% of canvas width.
    """
    print(f"Generating icon {size}x{size}...")
    
    # Create canvas
    canvas = Image.new('RGBA', (size, size), BRAND_BLUE)
    
    if not os.path.exists(LOGO_PATH):
        print(f"Error: {LOGO_PATH} not found")
        return

    logo = Image.open(LOGO_PATH)
    
    # Calculate target logo width
    target_width = int(size * logo_scale_percent)
    
    # Calculate aspect ratio to get height
    aspect = logo.height / logo.width
    target_height = int(target_width * aspect)
    
    # Resize logo (LANCZOS for high quality)
    logo_resized = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Centering logic
    # Horizontal: Center
    x = (size - target_width) // 2
    
    # Vertical: Visual center, maybe slightly biased up for iOS safe area if needed,
    # but 82% width usually means it fits nicely. 
    # Let's center it perfectly for PWA standard, iOS will mask it fine if it's centered.
    y = (size - target_height) // 2
    
    # Paste logo (using alpha channel)
    canvas.paste(logo_resized, (x, y), logo_resized if logo_resized.mode == 'RGBA' else None)
    
    # Save
    filename = f'icon-{size}x{size}.png'
    # Also save standard names for maskable
    maskable_filename = f'icon-maskable-{size}x{size}.png'
    
    canvas.save(os.path.join(OUTPUT_DIR, filename))
    # For this task, standard and maskable are the same visuals (solid background)
    canvas.save(os.path.join(OUTPUT_DIR, maskable_filename))
    print(f"Saved {filename} and {maskable_filename}")

def generate_og_image():
    """
    Generates OG Image (1200x630).
    Logo scale: 50-60% of canvas width.
    Includes subtitle 'Proforma Calculator'.
    """
    print("Generating OG Image...")
    width, height = 1200, 630
    
    canvas = Image.new('RGBA', (width, height), BRAND_BLUE)
    draw = ImageDraw.Draw(canvas)
    
    if not os.path.exists(LOGO_PATH):
        print("Error: Logo not found")
        return

    logo = Image.open(LOGO_PATH)
    
    # Logo Scale: 55% of width
    target_width = int(width * 0.55)
    aspect = logo.height / logo.width
    target_height = int(target_width * aspect)
    
    logo_resized = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Center horizontally
    logo_x = (width - target_width) // 2
    
    # Vertical placement: Slightly above center to make room for text
    # Let's put visual center of logo at 45% of height
    logo_y = int(height * 0.45) - (target_height // 2)
    
    canvas.paste(logo_resized, (logo_x, logo_y), logo_resized if logo_resized.mode == 'RGBA' else None)
    
    # Add Text: "Proforma Calculator"
    text = "Proforma Calculator"
    
    # Try to load formatted font, fallback to default
    try:
        # MacOS system font
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
    except:
        try:
            # Linux/Other
            font = ImageFont.truetype("arial.ttf", 60)
        except:
            # Fallback
            font = ImageFont.load_default()
            print("Warning: Using default font")

    # Measure text to center it
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    
    text_x = (width - text_width) // 2
    # Place text below logo with some padding
    text_y = logo_y + target_height + 40
    
    # White text with 85% opacity (RGBA: 255, 255, 255, 217)
    draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 217))
    
    canvas.save(os.path.join(OUTPUT_DIR, 'og-image.png'))
    print("Saved og-image.png")

if __name__ == '__main__':
    # Ensure public dir exists
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    # Generate App Icons (Base 1024 logic, exported to required sizes)
    # We generate 512 and 192 from the logic
    generate_app_icon(512, logo_scale_percent=0.82)
    generate_app_icon(192, logo_scale_percent=0.82)
    
    # Generate OG Image
    generate_og_image()

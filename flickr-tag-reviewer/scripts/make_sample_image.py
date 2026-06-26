#!/usr/bin/env python3
"""Generate a 1024x768 sample image with a 10% coordinate grid for mock mode.

The grid lets you visually confirm that overlay rectangles land at the right
fractional position (e.g. x=0.30 should sit on the '30' gridline).
"""
import os

from PIL import Image, ImageDraw

W, H = 1024, 768
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "sample.jpg")


def main():
    img = Image.new("RGB", (W, H), (235, 238, 242))
    d = ImageDraw.Draw(img)
    # gradient-ish background bands
    for y in range(0, H, 4):
        shade = 230 - int(30 * (y / H))
        d.line([(0, y), (W, y)], fill=(shade, shade + 4, shade + 10))
    # 10% grid
    for i in range(1, 10):
        x = int(W * i / 10)
        d.line([(x, 0), (x, H)], fill=(170, 180, 195), width=1)
        d.text((x + 3, 3), str(i * 10), fill=(90, 100, 120))
        y = int(H * i / 10)
        d.line([(0, y), (W, y)], fill=(170, 180, 195), width=1)
        d.text((3, y + 2), str(i * 10), fill=(90, 100, 120))
    d.rectangle([0, 0, W - 1, H - 1], outline=(120, 130, 150), width=2)
    d.text((W // 2 - 120, H // 2 - 8), "MOCK PHOTO — coordinate grid (%)", fill=(70, 80, 100))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.save(OUT, quality=88)
    print("wrote", OUT)


if __name__ == "__main__":
    main()

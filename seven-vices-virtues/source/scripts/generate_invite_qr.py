"""Build a crisp, offline invitation QR for the public FIELDNOTES landing page."""
from pathlib import Path

from PIL import Image, ImageDraw
from reportlab.graphics.barcode.qr import QrCodeWidget

URL = "https://hardzionl.github.io/ai-interview-lab/seven-vices-virtues/"
DEST = Path(__file__).resolve().parents[1] / "public/assets/invite-qr.png"
widget = QrCodeWidget(URL)
qr = widget.qr
qr.make()
modules = qr.getModuleCount()
scale = 12
quiet = 5
size = (modules + quiet * 2) * scale
image = Image.new("RGB", (size, size), "#ffffff")
draw = ImageDraw.Draw(image)
for y in range(modules):
    for x in range(modules):
        if qr.isDark(y, x):
            xx, yy = (x + quiet) * scale, (y + quiet) * scale
            draw.rectangle((xx, yy, xx + scale - 1, yy + scale - 1), fill="#183fbb")
image.save(DEST, optimize=True)
print(f"{DEST} {modules}x{modules} modules -> {size}px | {URL}")

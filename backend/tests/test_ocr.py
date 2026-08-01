from PIL import Image, ImageDraw
from reportlab.pdfgen import canvas

from app.services.ocr import extract_text


def test_extract_text_from_image(tmp_path):
    img = Image.new("RGB", (600, 150), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((10, 50), "HELLO WORLD", fill="black")
    img_path = tmp_path / "sample.png"
    img.save(img_path)

    text = extract_text(str(img_path), "image")

    assert "HELLO" in text.upper()


def test_extract_text_from_pdf(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    c = canvas.Canvas(str(pdf_path))
    c.drawString(100, 700, "TESTPDF CONTENT")
    c.save()

    text = extract_text(str(pdf_path), "pdf")

    assert "TESTPDF CONTENT" in text

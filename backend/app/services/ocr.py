import pdfplumber
import pytesseract
from PIL import Image


def extract_text(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        return _extract_pdf_text(file_path)
    return _extract_image_text(file_path)


def _extract_pdf_text(file_path: str) -> str:
    # Direct text extraction only (iteration 1 scope). A scanned/text-less
    # PDF returns "" here rather than falling back to rasterize+OCR, which
    # would need an extra poppler/pdf2image dependency not justified yet.
    with pdfplumber.open(file_path) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages).strip()


def _extract_image_text(file_path: str) -> str:
    image = Image.open(file_path)
    return pytesseract.image_to_string(image).strip()

import uuid
from pathlib import Path

from app.config import settings


def save_upload(file_bytes: bytes, original_filename: str) -> str:
    ext = Path(original_filename).suffix
    dest_dir = Path(settings.upload_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / f"{uuid.uuid4()}{ext}"
    dest_path.write_bytes(file_bytes)
    return str(dest_path)

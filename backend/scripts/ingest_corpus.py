"""One-off script: chunks and embeds corpus/*.pdf into the corpus_chunks
table. Re-run after adding/changing curated reference documents.

Usage (inside the backend container): python scripts/ingest_corpus.py
"""
import sys
from pathlib import Path

import pdfplumber

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.agent.llm import get_embeddings  # noqa: E402
from app.db.models.corpus_chunk import CorpusChunk  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402

CORPUS_DIR = Path(__file__).resolve().parent.parent / "corpus"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100


def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start : start + size])
        start += size - overlap
    return [c.strip() for c in chunks if c.strip()]


def extract_pdf_text(path: Path) -> str:
    with pdfplumber.open(path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def main() -> None:
    pdf_paths = sorted(CORPUS_DIR.glob("*.pdf"))
    if not pdf_paths:
        print(f"No PDFs found in {CORPUS_DIR}")
        return

    embeddings = get_embeddings()
    db = SessionLocal()
    try:
        db.query(CorpusChunk).delete()  # re-ingest from scratch each run

        for pdf_path in pdf_paths:
            print(f"Ingesting {pdf_path.name}...")
            text = extract_pdf_text(pdf_path)
            chunks = chunk_text(text)
            if not chunks:
                print("  no extractable text, skipping")
                continue
            vectors = embeddings.embed_documents(chunks)
            for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
                db.add(
                    CorpusChunk(source_name=pdf_path.name, chunk_text=chunk, chunk_index=i, embedding=vector)
                )
            db.commit()
            print(f"  {len(chunks)} chunks embedded")
    finally:
        db.close()


if __name__ == "__main__":
    main()

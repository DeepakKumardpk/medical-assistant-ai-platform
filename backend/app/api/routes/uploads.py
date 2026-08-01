import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, get_owned_chat
from app.db.models.chat import Chat
from app.db.models.document import Document
from app.db.models.job import Job
from app.db.models.message import Message
from app.db.models.user import User
from app.db.session import SessionLocal
from app.schemas.document import JobStatusOut
from app.services.ocr import extract_text
from app.services.storage import save_upload

router = APIRouter(tags=["uploads"])

_ALLOWED_EXTENSIONS = {".pdf": "pdf", ".png": "image", ".jpg": "image", ".jpeg": "image"}


def _process_job(job_id: uuid.UUID) -> None:
    """Runs in a FastAPI BackgroundTask: extracts text (stored privately on
    the document, used as chat context -- never shown to the user verbatim)
    and posts a short confirmation message. Uses its own DB session since
    the request-scoped one from `get_db` is already closed by the time this
    runs."""
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        if job is None:
            return

        job.status = "processing"
        db.commit()

        document = db.get(Document, job.document_id)
        try:
            text = extract_text(document.file_path, document.file_type)
            document.extracted_text = text or None
            confirmation = (
                f"\U0001f4c4 {document.original_name} processed — you can now ask questions about it."
                if text
                else f"⚠️ Couldn't extract any text from {document.original_name}."
            )
            result_message = Message(
                chat_id=job.chat_id,
                role="system",
                content=confirmation,
                document_id=document.id,
            )
            db.add(result_message)
            db.flush()
            job.result_message_id = result_message.id
            job.status = "done"
        except Exception as exc:  # noqa: BLE001 - surface extraction failure on the job, not a 500
            job.status = "failed"
            job.error_message = str(exc)
        db.commit()
    finally:
        db.close()


@router.post(
    "/chats/{chat_id}/uploads", response_model=JobStatusOut, status_code=status.HTTP_202_ACCEPTED
)
async def upload_document(
    chat_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobStatusOut:
    chat = get_owned_chat(db, chat_id, current_user)

    ext = Path(file.filename).suffix.lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported file type: {ext}")
    file_type = _ALLOWED_EXTENSIONS[ext]

    file_bytes = await file.read()
    file_path = save_upload(file_bytes, file.filename)

    document = Document(
        uploaded_by=current_user.id,
        chat_id=chat.id,
        file_path=file_path,
        file_type=file_type,
        original_name=file.filename,
    )
    db.add(document)
    db.flush()

    job = Job(document_id=document.id, chat_id=chat.id, status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(_process_job, job.id)

    return JobStatusOut.model_validate(job)


@router.get("/jobs/{job_id}", response_model=JobStatusOut)
def get_job(
    job_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JobStatusOut:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    chat = db.get(Chat, job.chat_id)
    if chat is None or chat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return JobStatusOut.model_validate(job)

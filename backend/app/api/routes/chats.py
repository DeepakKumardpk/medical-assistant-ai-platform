import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.agent.graph import run_orchestrator
from app.api.deps import get_current_user, get_db, get_owned_chat
from app.config import settings
from app.db.models.approval import Approval
from app.db.models.chat import Chat
from app.db.models.document import Document
from app.db.models.message import Message
from app.db.models.user import User, UserRole
from app.schemas.chat import ChatDetail, ChatSummary, CreateMessageRequest, MessageOut

router = APIRouter(prefix="/chats", tags=["chats"])


def _get_latest_document_text(db: Session, chat_id: uuid.UUID) -> str | None:
    latest = (
        db.query(Document)
        .filter(Document.chat_id == chat_id, Document.extracted_text.isnot(None))
        .order_by(Document.created_at.desc())
        .first()
    )
    return latest.extracted_text if latest else None


@router.post("", response_model=ChatSummary, status_code=status.HTTP_201_CREATED)
def create_chat(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ChatSummary:
    chat = Chat(user_id=current_user.id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return ChatSummary.model_validate(chat)


@router.get("", response_model=list[ChatSummary])
def list_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ChatSummary]:
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.updated_at.desc())
        .all()
    )
    return [ChatSummary.model_validate(c) for c in chats]


@router.get("/{chat_id}", response_model=ChatDetail)
def get_chat(
    chat_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ChatDetail:
    chat = get_owned_chat(db, chat_id, current_user)
    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return ChatDetail(
        id=chat.id,
        title=chat.title,
        messages=[MessageOut.model_validate(m) for m in messages],
    )


@router.post("/{chat_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def post_message(
    chat_id: uuid.UUID,
    payload: CreateMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageOut:
    chat = get_owned_chat(db, chat_id, current_user)

    user_message = Message(
        chat_id=chat.id, role="user", content=payload.content, language=payload.language
    )
    db.add(user_message)

    if chat.title is None:
        chat.title = payload.content[:80]

    document_text = _get_latest_document_text(db, chat.id)
    result = run_orchestrator(
        user_role=current_user.role.value,
        user_message=payload.content,
        document_text=document_text,
        target_language=payload.language,
    )

    is_patient = current_user.role == UserRole.patient
    needs_review = is_patient and result.get("is_clinical", True)
    if not needs_review:
        approval_status = "n/a"
    elif settings.dev_auto_approve:
        approval_status = "approved"
    else:
        approval_status = "pending_review"

    assistant_message = Message(
        chat_id=chat.id,
        role="assistant",
        content=result["final_answer"],
        language=payload.language,
        approval_status=approval_status,
    )
    db.add(assistant_message)
    db.flush()

    if approval_status == "pending_review":
        db.add(Approval(message_id=assistant_message.id, patient_id=current_user.id, status="pending"))

    chat.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(assistant_message)
    return MessageOut.model_validate(assistant_message)

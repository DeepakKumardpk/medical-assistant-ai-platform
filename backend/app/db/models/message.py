import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base

# approval_status values: 'n/a' | 'pending_review' | 'approved' | 'rejected'
# 'n/a' for patient/doctor-authored messages and non-clinical template replies;
# only AI-generated clinical explanations to a patient use the other three.


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' | 'assistant' | 'system'
    content = Column(Text, nullable=False)
    language = Column(String(10), nullable=False, default="en", server_default="en")
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    approval_status = Column(String(20), nullable=False, default="n/a", server_default="n/a")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

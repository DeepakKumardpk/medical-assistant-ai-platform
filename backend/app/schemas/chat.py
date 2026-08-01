import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChatSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str | None
    updated_at: datetime


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    language: str
    approval_status: str
    created_at: datetime


class ChatDetail(BaseModel):
    id: uuid.UUID
    title: str | None
    messages: list[MessageOut]


class CreateMessageRequest(BaseModel):
    content: str
    language: str = "en"

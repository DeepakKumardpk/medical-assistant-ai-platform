import uuid

from pydantic import BaseModel

from app.schemas.chat import MessageOut


class PatientHistoryChat(BaseModel):
    id: uuid.UUID
    title: str | None
    messages: list[MessageOut]


class PatientHistoryOut(BaseModel):
    patient_public_id: str
    full_name: str
    chats: list[PatientHistoryChat]


class DrugInteractionRequest(BaseModel):
    drug_names: list[str]


class DrugInteractionResponse(BaseModel):
    summary: str

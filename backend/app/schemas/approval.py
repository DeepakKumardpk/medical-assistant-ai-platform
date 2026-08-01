import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class ApprovalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    message_id: uuid.UUID
    message_content: str
    patient_id: uuid.UUID
    status: str
    edited_content: str | None
    created_at: datetime


class ApprovalDecisionRequest(BaseModel):
    decision: Literal["approve", "edit", "reject"]
    edited_content: str | None = None

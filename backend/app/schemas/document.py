import uuid

from pydantic import BaseModel, ConfigDict


class JobStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: str
    error_message: str | None = None
    result_message_id: uuid.UUID | None = None

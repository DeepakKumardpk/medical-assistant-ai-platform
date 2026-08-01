from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.action import SendEmailRequest, SendEmailResponse
from app.services.email_sender import get_email_sender

router = APIRouter(prefix="/actions", tags=["actions"])


@router.post("/send-email", response_model=SendEmailResponse)
def send_email(
    payload: SendEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SendEmailResponse:
    entry = get_email_sender().send(db, to=payload.to, subject=payload.subject, body=payload.body)
    db.commit()
    return SendEmailResponse(status=entry.status)

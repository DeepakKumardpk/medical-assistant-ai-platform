import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.agent.tools.drug_interaction import check_drug_interactions
from app.api.deps import get_db, require_role
from app.db.models.approval import Approval
from app.db.models.chat import Chat
from app.db.models.message import Message
from app.db.models.user import User, UserRole
from app.schemas.approval import ApprovalDecisionRequest, ApprovalOut
from app.schemas.chat import MessageOut
from app.schemas.doctor import (
    DrugInteractionRequest,
    DrugInteractionResponse,
    PatientHistoryChat,
    PatientHistoryOut,
)

router = APIRouter(prefix="/doctor", tags=["doctor"])

_require_doctor = require_role(UserRole.doctor)


@router.get("/patients/{patient_public_id}/history", response_model=PatientHistoryOut)
def get_patient_history(
    patient_public_id: str, _doctor: User = Depends(_require_doctor), db: Session = Depends(get_db)
) -> PatientHistoryOut:
    patient = (
        db.query(User)
        .filter(User.public_id == patient_public_id, User.role == UserRole.patient)
        .first()
    )
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    chats = db.query(Chat).filter(Chat.user_id == patient.id).order_by(Chat.updated_at.desc()).all()
    chat_payloads = []
    for chat in chats:
        messages = (
            db.query(Message).filter(Message.chat_id == chat.id).order_by(Message.created_at.asc()).all()
        )
        chat_payloads.append(
            PatientHistoryChat(
                id=chat.id, title=chat.title, messages=[MessageOut.model_validate(m) for m in messages]
            )
        )

    return PatientHistoryOut(patient_public_id=patient.public_id, full_name=patient.full_name, chats=chat_payloads)


@router.get("/approvals", response_model=list[ApprovalOut])
def list_approvals(_doctor: User = Depends(_require_doctor), db: Session = Depends(get_db)) -> list[ApprovalOut]:
    rows = (
        db.query(Approval, Message.content)
        .join(Message, Message.id == Approval.message_id)
        .filter(Approval.status == "pending")
        .order_by(Approval.created_at.asc())
        .all()
    )
    return [
        ApprovalOut(
            id=approval.id,
            message_id=approval.message_id,
            message_content=content,
            patient_id=approval.patient_id,
            status=approval.status,
            edited_content=approval.edited_content,
            created_at=approval.created_at,
        )
        for approval, content in rows
    ]


@router.post("/approvals/{approval_id}/decision", response_model=ApprovalOut)
def decide_approval(
    approval_id: uuid.UUID,
    payload: ApprovalDecisionRequest,
    doctor: User = Depends(_require_doctor),
    db: Session = Depends(get_db),
) -> ApprovalOut:
    approval = db.get(Approval, approval_id)
    if approval is None or approval.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Approval not found or already decided"
        )

    message = db.get(Message, approval.message_id)

    if payload.decision == "reject":
        approval.status = "rejected"
        message.approval_status = "rejected"
    elif payload.decision == "edit":
        if not payload.edited_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="edited_content is required for an edit decision"
            )
        approval.edited_content = payload.edited_content
        message.content = payload.edited_content
        approval.status = "edited"
        message.approval_status = "approved"
    else:
        approval.status = "approved"
        message.approval_status = "approved"

    approval.reviewing_doctor_id = doctor.id
    approval.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(approval)
    return ApprovalOut(
        id=approval.id,
        message_id=approval.message_id,
        message_content=message.content,
        patient_id=approval.patient_id,
        status=approval.status,
        edited_content=approval.edited_content,
        created_at=approval.created_at,
    )


@router.post("/tools/drug-interaction", response_model=DrugInteractionResponse)
def drug_interaction_tool(
    payload: DrugInteractionRequest, _doctor: User = Depends(_require_doctor)
) -> DrugInteractionResponse:
    if not payload.drug_names:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="drug_names must not be empty")
    summary = check_drug_interactions(payload.drug_names)
    return DrugInteractionResponse(summary=summary)

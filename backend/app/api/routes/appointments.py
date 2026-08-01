import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.db.models.appointment import Appointment
from app.db.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentOut

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _get_requested_appointment(db: Session, appointment_id: uuid.UUID) -> Appointment:
    appointment = db.get(Appointment, appointment_id)
    if appointment is None or appointment.status != "requested":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found or already decided"
        )
    return appointment


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(require_role(UserRole.patient)),
    db: Session = Depends(get_db),
) -> AppointmentOut:
    appointment = Appointment(
        patient_id=current_user.id, requested_time=payload.requested_time, reason=payload.reason
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return AppointmentOut.model_validate(appointment)


@router.post("/{appointment_id}/approve", response_model=AppointmentOut)
def approve_appointment(
    appointment_id: uuid.UUID,
    doctor: User = Depends(require_role(UserRole.doctor)),
    db: Session = Depends(get_db),
) -> AppointmentOut:
    appointment = _get_requested_appointment(db, appointment_id)
    appointment.status = "approved"
    appointment.doctor_id = doctor.id
    db.commit()
    db.refresh(appointment)
    return AppointmentOut.model_validate(appointment)


@router.post("/{appointment_id}/reject", response_model=AppointmentOut)
def reject_appointment(
    appointment_id: uuid.UUID,
    doctor: User = Depends(require_role(UserRole.doctor)),
    db: Session = Depends(get_db),
) -> AppointmentOut:
    appointment = _get_requested_appointment(db, appointment_id)
    appointment.status = "rejected"
    appointment.doctor_id = doctor.id
    db.commit()
    db.refresh(appointment)
    return AppointmentOut.model_validate(appointment)

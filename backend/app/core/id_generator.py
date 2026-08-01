from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.models.user import UserRole

_SEQUENCE_BY_ROLE = {
    UserRole.patient: "patient_id_seq",
    UserRole.doctor: "doctor_id_seq",
}
_PREFIX_BY_ROLE = {
    UserRole.patient: "PAT",
    UserRole.doctor: "DOC",
}


def generate_public_id(db: Session, role: UserRole) -> str:
    sequence_name = _SEQUENCE_BY_ROLE[role]
    next_value = db.execute(text(f"SELECT nextval('{sequence_name}')")).scalar_one()
    return f"{_PREFIX_BY_ROLE[role]}-{next_value:06d}"

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.id_generator import generate_public_id
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models.user import User, UserRole
from app.schemas.auth import (
    DoctorRegister,
    LoginRequest,
    PatientRegister,
    TokenResponse,
    UserProfile,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_token(user: User) -> TokenResponse:
    token = create_access_token(
        {"sub": str(user.id), "role": user.role.value, "public_id": user.public_id}
    )
    return TokenResponse(access_token=token, role=user.role.value, public_id=user.public_id)


def _register(db: Session, role: UserRole, email: str, password: str, full_name: str, **extra) -> TokenResponse:
    if db.query(User).filter(User.email == email).first() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        role=role,
        public_id=generate_public_id(db, role),
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        **extra,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_token(user)


@router.post("/register/patient", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_patient(payload: PatientRegister, db: Session = Depends(get_db)) -> TokenResponse:
    return _register(db, UserRole.patient, payload.email, payload.password, payload.full_name)


@router.post("/register/doctor", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_doctor(payload: DoctorRegister, db: Session = Depends(get_db)) -> TokenResponse:
    return _register(
        db,
        UserRole.doctor,
        payload.email,
        payload.password,
        payload.full_name,
        specialty=payload.specialty,
        license_number=payload.license_number,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return _issue_token(user)


@router.get("/me", response_model=UserProfile)
def me(current_user: User = Depends(get_current_user)) -> UserProfile:
    return UserProfile(
        public_id=current_user.public_id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        specialty=current_user.specialty,
        license_number=current_user.license_number,
    )

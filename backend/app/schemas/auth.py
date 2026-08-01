from pydantic import BaseModel, EmailStr


class PatientRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class DoctorRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    specialty: str
    license_number: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    public_id: str


class UserProfile(BaseModel):
    public_id: str
    email: EmailStr
    full_name: str
    role: str
    specialty: str | None = None
    license_number: str | None = None

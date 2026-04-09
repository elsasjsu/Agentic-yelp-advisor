from pydantic import BaseModel, EmailStr


class UserSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class OwnerSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    location: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
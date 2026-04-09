from pydantic import BaseModel, EmailStr

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    about: str | None = None
    city: str | None = None
    country: str | None = None
    languages: str | None = None
    gender: str | None = None
    profile_picture: str | None = None

    class Config:
        from_attributes = True


class UserProfileUpdateRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    about: str | None = None
    city: str | None = None
    country: str | None = None
    languages: str | None = None
    gender: str | None = None
    profile_picture: str | None = None
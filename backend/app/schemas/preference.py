from pydantic import BaseModel

class PreferenceResponse(BaseModel):
    id: int
    user_id: int
    cuisines: str | None = None
    price_range: str | None = None
    location_radius: str | None = None
    dietary: str | None = None
    ambiance: str | None = None
    sort_preference: str | None = None

    class Config:
        from_attributes = True


class PreferenceUpdateRequest(BaseModel):
    cuisines: str | None = None
    price_range: str | None = None
    location_radius: str | None = None
    dietary: str | None = None
    ambiance: str | None = None
    sort_preference: str | None = None
from pydantic import BaseModel
from datetime import datetime

class ReviewCreateRequest(BaseModel):
    rating: int
    comment: str | None = None


class ReviewUpdateRequest(BaseModel):
    rating: int | None = None
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    restaurant_id: int
    user_id: int
    rating: int
    comment: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
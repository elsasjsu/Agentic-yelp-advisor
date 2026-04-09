from pydantic import BaseModel
from datetime import datetime

class HistoryCreateRequest(BaseModel):
    action_type: str
    restaurant_id: int | None = None
    review_id: int | None = None


class HistoryResponse(BaseModel):
    id: int
    user_id: int
    action_type: str
    restaurant_id: int | None = None
    review_id: int | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
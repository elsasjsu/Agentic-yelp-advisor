from pydantic import BaseModel

class RestaurantCreateRequest(BaseModel):
    name: str
    cuisine_type: str
    description: str | None = None
    address: str | None = None
    city: str | None = None
    zip: str | None = None
    contact_info: str | None = None
    hours: str | None = None
    pricing_tier: str | None = None
    amenities: str | None = None
    photos: str | None = None


class RestaurantUpdateRequest(BaseModel):
    name: str | None = None
    cuisine_type: str | None = None
    description: str | None = None
    address: str | None = None
    city: str | None = None
    zip: str | None = None
    contact_info: str | None = None
    hours: str | None = None
    pricing_tier: str | None = None
    amenities: str | None = None
    photos: str | None = None


class RestaurantResponse(BaseModel):
    id: int
    owner_id: int | None = None
    name: str
    cuisine_type: str
    description: str | None = None
    address: str | None = None
    city: str | None = None
    zip: str | None = None
    contact_info: str | None = None
    hours: str | None = None
    pricing_tier: str | None = None
    amenities: str | None = None
    photos: str | None = None
    rating: float = 0
    review_count: int = 0

    class Config:
        from_attributes = True
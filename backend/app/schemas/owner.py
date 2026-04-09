from pydantic import BaseModel

class OwnerDashboardResponse(BaseModel):
    total_restaurants: int
    total_reviews: int
    recent_reviews_count: int


class RestaurantAnalyticsResponse(BaseModel):
    restaurant_id: int
    total_reviews: int
    average_rating: float
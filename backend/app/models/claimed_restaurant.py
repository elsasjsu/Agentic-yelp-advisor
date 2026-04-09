from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from app.db import Base

class ClaimedRestaurant(Base):
    __tablename__ = "claimed_restaurants"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    claimed_at = Column(DateTime(timezone=True), server_default=func.now())
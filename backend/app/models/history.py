from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from app.db import Base

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(100), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
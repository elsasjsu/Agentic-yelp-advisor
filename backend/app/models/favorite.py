from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.db import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "restaurant_id", name="unique_user_restaurant_favorite"),
    )
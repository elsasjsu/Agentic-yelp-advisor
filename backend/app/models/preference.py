from sqlalchemy import Column, Integer, String, ForeignKey
from app.db import Base

class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    cuisines = Column(String(255), nullable=True)
    price_range = Column(String(20), nullable=True)
    location_radius = Column(String(50), nullable=True)
    dietary = Column(String(255), nullable=True)
    ambiance = Column(String(255), nullable=True)
    sort_preference = Column(String(50), nullable=True)
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=True)
    name = Column(String(150), nullable=False)
    cuisine_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    zip = Column(String(20), nullable=True)
    contact_info = Column(String(255), nullable=True)
    hours = Column(String(255), nullable=True)
    pricing_tier = Column(String(20), nullable=True)
    amenities = Column(String(255), nullable=True)
    photos = Column(String(255), nullable=True)
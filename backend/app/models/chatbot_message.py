from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from app.db import Base

class ChatbotMessage(Base):
    __tablename__ = "chatbot_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False)   # user or assistant
    message = Column(String(2000), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[str] | None = None


class RecommendationItem(BaseModel):
    id: int
    name: str
    cuisine_type: str
    city: str | None = None
    pricing_tier: str | None = None
    reason: str
    score: int


class ChatResponse(BaseModel):
    response: str
    recommendations: list[RecommendationItem]
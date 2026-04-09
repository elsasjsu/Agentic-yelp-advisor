from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import (
    merge_conversation_context,
    get_user_preferences,
    search_restaurants,
    build_ranked_recommendations,
    save_chat_message,
    generate_ai_response,
)

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    print("MESSAGE:", payload.message)
    print("HISTORY:", payload.conversation_history)
    print("CURRENT USER ID:", current_user.id)

    filters = merge_conversation_context(payload.message, payload.conversation_history)
    print("FILTERS:", filters)

    preference = get_user_preferences(db, current_user.id)
    print("PREFERENCE:", preference)

    restaurants = search_restaurants(db, filters, preference)
    print("MATCHED RESTAURANTS:", [r.name for r in restaurants])

    recommendations = build_ranked_recommendations(restaurants, filters, preference)
    print("RECOMMENDATIONS:", recommendations)

    response_text = generate_ai_response(payload.message, recommendations, preference)
    print("RESPONSE TEXT:", response_text)

    save_chat_message(db, current_user.id, "user", payload.message)
    save_chat_message(db, current_user.id, "assistant", response_text)

    return ChatResponse(
        response=response_text,
        recommendations=recommendations,
    )